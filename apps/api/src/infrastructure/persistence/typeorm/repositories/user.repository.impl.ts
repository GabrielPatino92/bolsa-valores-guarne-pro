import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../../application/repositories/user.repository.interface';
import { UserDomain } from '../../../../domain/entities/user.domain';
import { User } from '../../../../entities/user.entity';
import { UserMapper } from '../../mappers/user.mapper';

/**
 * ADAPTADOR - Implementación del Repositorio de Usuario con TypeORM
 *
 * Clean Architecture: INFRASTRUCTURE LAYER
 * - Implementa el puerto IUserRepository
 * - Usa TypeORM como detalle de implementación
 * - Convierte entre entidades de dominio y entidades ORM
 */

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userMapper: UserMapper,
  ) {}

  async findByEmail(email: string): Promise<UserDomain | null> {
    const userEntity = await this.userRepository.findOne({
      where: { email },
      relations: ['userProviders', 'userProviders.provider'],
    });

    return userEntity ? this.userMapper.toDomain(userEntity) : null;
  }

  async findByUsername(username: string): Promise<UserDomain | null> {
    const userEntity = await this.userRepository.findOne({
      where: { username },
      relations: ['userProviders', 'userProviders.provider'],
    });

    return userEntity ? this.userMapper.toDomain(userEntity) : null;
  }

  async findById(id: string): Promise<UserDomain | null> {
    const userEntity = await this.userRepository.findOne({
      where: { id },
      relations: ['userProviders', 'userProviders.provider'],
    });

    return userEntity ? this.userMapper.toDomain(userEntity) : null;
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<UserDomain | null> {
    const userEntity = await this.userRepository.findOne({
      where: [
        { email: emailOrUsername },
        { username: emailOrUsername },
      ],
      relations: ['userProviders', 'userProviders.provider'],
    });

    return userEntity ? this.userMapper.toDomain(userEntity) : null;
  }

  async save(user: UserDomain): Promise<UserDomain> {
    // Convertir dominio → ORM
    const userEntity = this.userMapper.toEntity(user);

    // Persistir
    const savedEntity = await this.userRepository.save(userEntity);

    // Convertir ORM → dominio
    return this.userMapper.toDomain(savedEntity);
  }

  async delete(id: string): Promise<void> {
    // Soft delete (updatear deletedAt)
    await this.userRepository.update(id, { deletedAt: new Date() });
  }

  async findAll(): Promise<UserDomain[]> {
    const userEntities = await this.userRepository.find({
      where: { deletedAt: null },
      relations: ['userProviders', 'userProviders.provider'],
    });

    return userEntities.map(entity => this.userMapper.toDomain(entity));
  }

  async count(): Promise<number> {
    return this.userRepository.count({
      where: { deletedAt: null },
    });
  }
}
