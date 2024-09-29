import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { execSync } from 'child_process';
import * as request from 'supertest';

import { AppModule } from '@/app.module';

describe('Auth Resolver (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;
  const biometricKey = 'fbd208ddf9b23997';

  beforeAll(async () => {
    execSync('npx prisma migrate deploy --schema=./prisma/schema.prisma');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    execSync('npx prisma migrate reset --force --skip-seed');
    await app.close();
  });

  it('should register a new user', async () => {
    const mutation = `
      mutation Register($data: RegisterInput!) {
        register(data: $data) {
          id
          email
        }
      }
    `;

    const variables = {
      data: {
        email: 'test@example.com',
        password: 'password',
        biometricKey,
      },
    };

    const response = await request(httpServer).post('/graphql').send({
      query: mutation,
      variables,
    });

    const { data } = response.body;

    expect(data.register).toBeDefined();
    expect(data.register.email).toBe('test@example.com');
  });

  it('should not allow duplicate registration', async () => {
    const mutation = `
      mutation Register($data: RegisterInput!) {
        register(data: $data) {
          id
          email
        }
      }
    `;

    const variables = {
      data: {
        email: 'test@example.com',
        password: 'password',
        biometricKey,
      },
    };

    const response = await request(httpServer).post('/graphql').send({
      query: mutation,
      variables,
    });

    const errors = response.body.errors;
    expect(errors).toBeDefined();
    expect(errors[0].message).toBe('User already exists');
  });

  it('should login the user successfully', async () => {
    const mutation = `
      mutation Login($data: LoginInput!) {
        login(data: $data) {
          accessToken
        }
      }
    `;

    const variables = {
      data: {
        email: 'test@example.com',
        password: 'password',
      },
    };

    const response = await request(httpServer).post('/graphql').send({
      query: mutation,
      variables,
    });

    const { data } = response.body;

    expect(data.login).toBeDefined();
    expect(data.login.accessToken).toBeDefined();
  });

  it('should login with biometrics successfully', async () => {
    const mutation = `
      mutation LoginWithBiometrics($key: String!) {
        loginWithBiometrics(key: $key) {
          accessToken
        }
      }
    `;

    const variables = {
      key: biometricKey,
    };

    const response = await request(httpServer).post('/graphql').send({
      query: mutation,
      variables,
    });

    const { data } = response.body;

    expect(data.loginWithBiometrics).toBeDefined();
    expect(data.loginWithBiometrics.accessToken).toBeDefined();
  });
});
