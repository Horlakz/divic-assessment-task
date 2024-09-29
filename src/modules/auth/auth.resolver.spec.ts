import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';

import { LoginInput, RegisterInput } from './auth.args';
import { Login } from './auth.entity';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

describe('AuthResolver', () => {
  let authResolver: AuthResolver;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            loginWithBiometrics: jest.fn(),
          },
        },
      ],
    }).compile();

    authResolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get(AuthService);
  });

  describe('sayHello', () => {
    it('should return "Hello World!"', () => {
      expect(authResolver.sayHello()).toBe('Hello World!');
    });
  });

  describe('register', () => {
    it('should call AuthService.register and return the registered user', async () => {
      const registerInput: RegisterInput = {
        email: 'test@example.com',
        password: 'password',
        biometricKey: 'fbd208ddf9b23997',
      };

      const registerResult: User = {
        id: 'faab4fc6-1281-413c-a113-788bad71168b',
        createdAt: new Date(),
        updatedAt: new Date(),
        email: 'test@email.com',
        biometricKey: 'fbd208ddf9b23997',
        password: 'password',
      };

      authService.register.mockResolvedValueOnce(registerResult);

      const result = await authResolver.register(registerInput);

      expect(authService.register).toHaveBeenCalledWith(registerInput);
      expect(result).toEqual(registerResult);
    });
  });

  describe('login', () => {
    it('should call AuthService.login and return the login response', async () => {
      const loginInput: LoginInput = {
        email: 'test@example.com',
        password: 'password',
      };

      const loginResult: Login = {
        accessToken: 'jwtToken',
      };

      authService.login.mockResolvedValueOnce(loginResult);

      const result = await authResolver.login(loginInput);

      expect(authService.login).toHaveBeenCalledWith(loginInput);
      expect(result).toEqual(loginResult);
    });
  });

  describe('loginWithBiometrics', () => {
    it('should call AuthService.loginWithBiometrics and return the login response', async () => {
      const biometricKey = 'fbd208ddf9b23997';

      const loginResult: Login = {
        accessToken: 'jwtToken',
      };

      authService.loginWithBiometrics.mockResolvedValueOnce(loginResult);

      const result = await authResolver.loginWithBiometrics(biometricKey);

      expect(authService.loginWithBiometrics).toHaveBeenCalledWith(
        biometricKey,
      );
      expect(result).toEqual(loginResult);
    });
  });
});
