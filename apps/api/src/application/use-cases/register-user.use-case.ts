import { Inject, Injectable } from '@nestjs/common';
import { UserDomain } from '../../domain/entities/user.domain';
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
 * CAPA DE APLICACIÓN - Use Case: Registrar Usuario
 *
 * Clean Architecture Layer: APPLICATION
 * - Orquesta lógica de negocio
 * - NO depende de frameworks externos
 * - Depende solo de interfaces (Dependency Inversion)
 */

export interface RegisterUserInput {
  email: string;
  username: string;
  password: string;
  fullName?: string;
}

export interface RegisterUserOutput {
  user: {
    id: string;
    email: string;
    username: string;
    fullName?: string;
  };
  token: string;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER_TOKEN)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_GENERATOR_TOKEN)
    private readonly tokenGenerator: ITokenGenerator,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    // 1. Validar que el email no exista
    const existingByEmail = await this.userRepository.findByEmail(input.email);
    if (existingByEmail) {
      throw new Error('Email ya está registrado');
    }

    // 2. Validar que el username no exista
    const existingByUsername = await this.userRepository.findByUsername(input.username);
    if (existingByUsername) {
      throw new Error('Username ya está en uso');
    }

    // 3. Hash de la contraseña
    const passwordHash = await this.passwordHasher.hash(input.password);

    // 4. Crear entidad de dominio (con validaciones de negocio)
    const userDomain = UserDomain.create({
      email: input.email,
      username: input.username,
      passwordHash,
      fullName: input.fullName,
    });

    // 5. Persistir en repositorio
    const savedUser = await this.userRepository.save(userDomain);

    // 6. Generar token de acceso
    const token = this.tokenGenerator.generate({
      sub: savedUser.id,
      email: savedUser.email,
      username: savedUser.username,
    });

    // 7. Retornar DTO de salida
    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        username: savedUser.username,
        fullName: savedUser.fullName,
      },
      token,
    };
  }
}
