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

// Clean Architecture - Application Layer
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../application/use-cases/login-user.use-case';
import {
  USER_REPOSITORY_TOKEN,
} from '../application/repositories/user.repository.interface';
import {
  PASSWORD_HASHER_TOKEN,
} from '../application/services/password-hasher.interface';
import {
  TOKEN_GENERATOR_TOKEN,
} from '../application/services/token-generator.interface';

// Clean Architecture - Infrastructure Layer
import { TypeOrmUserRepository } from '../infrastructure/persistence/typeorm/repositories/user.repository.impl';
import { UserMapper } from '../infrastructure/persistence/mappers/user.mapper';
import { BcryptPasswordHasher } from '../infrastructure/security/bcrypt-password-hasher';
import { JwtTokenGenerator } from '../infrastructure/security/jwt-token-generator';
import { EncryptionService } from '../shared/encryption.service';

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
  providers: [
    // ========== SERVICIOS LEGACY ==========
    AuthService,
    SecurityService,

    // ========== CLEAN ARCHITECTURE - USE CASES ==========
    RegisterUserUseCase,
    LoginUserUseCase,

    // ========== CLEAN ARCHITECTURE - DEPENDENCY INJECTION ==========
    // Repositorio de Usuario (Puerto → Adaptador)
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: TypeOrmUserRepository,
    },

    // Servicio de Hash de Contraseñas (Puerto → Adaptador)
    {
      provide: PASSWORD_HASHER_TOKEN,
      useClass: BcryptPasswordHasher,
    },

    // Generador de Tokens (Puerto → Adaptador)
    {
      provide: TOKEN_GENERATOR_TOKEN,
      useClass: JwtTokenGenerator,
    },

    // ========== MAPPERS Y UTILIDADES ==========
    UserMapper,
    EncryptionService,
  ],
  exports: [
    AuthService,
    JwtModule,
    RegisterUserUseCase,
    LoginUserUseCase,
    USER_REPOSITORY_TOKEN,
    PASSWORD_HASHER_TOKEN,
    TOKEN_GENERATOR_TOKEN,
  ],
})
export class AuthModule {}
