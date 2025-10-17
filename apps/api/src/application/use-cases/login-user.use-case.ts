import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY_TOKEN,
} from '../repositories/user.repository.interface';
import {
  IPasswordHasher,
  PASSWORD_HASHER_TOKEN,
} from '../services/password-hasher.interface';
import {
  ITokenGenerator,
  TOKEN_GENERATOR_TOKEN,
} from '../services/token-generator.interface';

/**
 * CAPA DE APLICACIÓN - Use Case: Login de Usuario
 *
 * Clean Architecture Layer: APPLICATION
 * - Orquesta lógica de autenticación
 * - NO depende de frameworks externos
 * - Depende solo de interfaces (Dependency Inversion)
 */

export interface LoginUserInput {
  emailOrUsername: string;
  password: string;
}

export interface LoginUserOutput {
  user: {
    id: string;
    email: string;
    username: string;
    fullName?: string;
  };
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER_TOKEN)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_GENERATOR_TOKEN)
    private readonly tokenGenerator: ITokenGenerator,
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    // 1. Buscar usuario por email o username
    const user = await this.userRepository.findByEmailOrUsername(
      input.emailOrUsername
    );

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // 2. Verificar contraseña
    const isPasswordValid = await this.passwordHasher.compare(
      input.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    // 3. Verificar que el usuario no esté eliminado
    if (user.deletedAt) {
      throw new Error('Usuario no disponible');
    }

    // 4. Actualizar último login (método de dominio)
    user.recordLogin();

    // 5. Persistir cambio
    await this.userRepository.save(user);

    // 6. Generar tokens
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const accessToken = this.tokenGenerator.generate(tokenPayload);
    const refreshToken = this.tokenGenerator.generateRefresh(tokenPayload);

    // 7. Retornar DTO de salida
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
      },
      accessToken,
      refreshToken,
    };
  }
}
