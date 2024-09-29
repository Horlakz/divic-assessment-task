import { Injectable } from '@nestjs/common';

import { hashValue, verifyHash } from '@/utils/security';
import { JwtService } from '@nestjs/jwt';
import { GraphQLError } from 'graphql';
import { DatabaseService } from 'src/database/database.service';
import { ILogin, IRegister } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: IRegister) {
    const userExists = await this.db.user.findUnique({
      where: { email: data.email },
    });

    if (userExists) {
      throw new GraphQLError('User already exists', {
        extensions: { code: 'USER_EXISTS' },
      });
    }

    const hash = await hashValue(data.password);
    return await this.db.user.create({
      data: {
        email: data.email,
        password: hash,
        biometricKey: data.biometricKey,
      },
    });
  }

  async login(data: ILogin) {
    const user = await this.db.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new GraphQLError('User not found', {
        extensions: { code: 'USER_NOT_FOUND' },
      });
    }

    const verifyPassword = await verifyHash(user.password, data.password);

    if (!verifyPassword) {
      throw new Error('Invalid password');
    }

    const accessToken = await this.generateToken(user.id);

    return { accessToken };
  }

  async loginWithBiometrics(key: string) {
    const user = await this.db.user.findUnique({
      where: { biometricKey: key },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const accessToken = await this.generateToken(user.id);

    return { accessToken };
  }

  private async generateToken(sub: string) {
    return await this.jwtService.signAsync({ sub });
  }
}
