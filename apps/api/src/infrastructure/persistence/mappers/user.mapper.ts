import { Injectable } from '@nestjs/common';
import { UserDomain } from '../../../domain/entities/user.domain';
import { User } from '../../../entities/user.entity';

/**
 * MAPPER - Conversión entre Domain Entity y ORM Entity
 *
 * Clean Architecture: INFRASTRUCTURE LAYER
 * - Convierte UserDomain ↔ User (TypeORM)
 * - Aísla el dominio de los detalles de persistencia
 */

@Injectable()
export class UserMapper {
  /**
   * Convertir de ORM Entity → Domain Entity
   */
  toDomain(ormEntity: User): UserDomain {
    return UserDomain.create({
      id: ormEntity.id,
      email: ormEntity.email,
      username: ormEntity.username,
      passwordHash: ormEntity.passwordHash,
      fullName: ormEntity.fullName,
      emailVerified: ormEntity.emailVerified,
      twoFactorEnabled: ormEntity.twoFactorEnabled,
      twoFactorSecret: ormEntity.twoFactorSecret,
      lastLoginAt: ormEntity.lastLoginAt,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
      deletedAt: ormEntity.deletedAt,
    });
  }

  /**
   * Convertir de Domain Entity → ORM Entity
   */
  toEntity(domainEntity: UserDomain): User {
    const user = new User();

    // Si tiene ID, es una actualización
    if (domainEntity.id) {
      user.id = domainEntity.id;
    }

    user.email = domainEntity.email;
    user.username = domainEntity.username;
    user.passwordHash = domainEntity.passwordHash;
    user.fullName = domainEntity.fullName;
    user.emailVerified = domainEntity.emailVerified;
    user.twoFactorEnabled = domainEntity.twoFactorEnabled;
    user.twoFactorSecret = domainEntity.twoFactorSecret;
    user.lastLoginAt = domainEntity.lastLoginAt;
    user.createdAt = domainEntity.createdAt;
    user.updatedAt = domainEntity.updatedAt;
    user.deletedAt = domainEntity.deletedAt;

    return user;
  }

  /**
   * Convertir múltiples entidades ORM → Domain
   */
  toDomainList(ormEntities: User[]): UserDomain[] {
    return ormEntities.map(entity => this.toDomain(entity));
  }

  /**
   * Convertir múltiples entidades Domain → ORM
   */
  toEntityList(domainEntities: UserDomain[]): User[] {
    return domainEntities.map(entity => this.toEntity(entity));
  }
}
