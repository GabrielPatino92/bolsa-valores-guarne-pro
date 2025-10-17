import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SecurityService } from './security.service';
import { User } from '../entities/user.entity';
import { Provider } from '../entities/provider.entity';
import { UserProvider } from '../entities/user-provider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Provider, UserProvider]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not defined in environment variables');
        }
        return {
          secret,
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SecurityService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
