import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLError } from 'graphql';

import { DatabaseService } from '@/database/database.service';
import { hashValue, verifyHash } from '@/utils/security';
import { AuthService } from './auth.service';

jest.mock('@/utils/security', () => ({
  hashValue: jest.fn(),
  verifyHash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let dbService: jest.Mocked<DatabaseService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DatabaseService,
          useValue: { user: { findUnique: jest.fn(), create: jest.fn() } },
        },
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    dbService = module.get(DatabaseService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw error if user already exists', async () => {
      (dbService.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
      });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password',
          biometricKey: 'bioKey',
        }),
      ).rejects.toThrow(GraphQLError);
    });

    it('should create a new user when user does not exist', async () => {
      (dbService.user.findUnique as jest.Mock).mockResolvedValueOnce(null); // No user exists
      (hashValue as jest.Mock).mockResolvedValueOnce('hashedPassword');
      (dbService.user.create as jest.Mock).mockResolvedValueOnce({
        email: 'test@example.com',
      });

      const result = await service.register({
        email: 'test@example.com',
        password: 'password',
        biometricKey: 'bioKey',
      });

      expect(dbService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashedPassword',
          biometricKey: 'bioKey',
        },
      });
      expect(result).toEqual({ email: 'test@example.com' });
    });
  });

  describe('login', () => {
    it('should throw error if user is not found', async () => {
      (dbService.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.login({ email: 'test@example.com', password: 'password' }),
      ).rejects.toThrow(GraphQLError);
    });

    it('should throw error if password is incorrect', async () => {
      (dbService.user.findUnique as jest.Mock).mockResolvedValueOnce({
        email: 'test@example.com',
        password: 'hashedPassword',
      });
      (verifyHash as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrongPassword',
        }),
      ).rejects.toThrow('Invalid password');
    });

    it('should return access token if login is successful', async () => {
      (dbService.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      });
      (verifyHash as jest.Mock).mockResolvedValueOnce(true);
      jwtService.signAsync.mockResolvedValueOnce('accessToken');

      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 1 });
      expect(result).toEqual({ accessToken: 'accessToken' });
    });
  });

  describe('loginWithBiometrics', () => {
    it('should throw error if user is not found with biometric key', async () => {
      (dbService.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.loginWithBiometrics('invalidKey')).rejects.toThrow(
        'User not found',
      );
    });

    it('should return access token if biometric login is successful', async () => {
      (dbService.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
        biometricKey: 'validKey',
      });
      jwtService.signAsync.mockResolvedValueOnce('accessToken');

      const result = await service.loginWithBiometrics('validKey');

      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 1 });
      expect(result).toEqual({ accessToken: 'accessToken' });
    });
  });
});
