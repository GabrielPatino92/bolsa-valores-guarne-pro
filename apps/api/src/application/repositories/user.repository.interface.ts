import { UserDomain } from '../../domain/entities/user.domain';

/**
 * PUERTO - Interfaz del Repositorio de Usuario
 *
 * Clean Architecture: INTERFACE (Puerto)
 * - Define el contrato que debe cumplir cualquier implementación
 * - La capa de dominio/aplicación NO conoce los detalles de implementación
 * - Dependency Inversion Principle
 */

export interface IUserRepository {
  /**
   * Buscar usuario por email
   */
  findByEmail(email: string): Promise<UserDomain | null>;

  /**
   * Buscar usuario por username
   */
  findByUsername(username: string): Promise<UserDomain | null>;

  /**
   * Buscar usuario por ID
   */
  findById(id: string): Promise<UserDomain | null>;

  /**
   * Buscar usuario por email o username
   */
  findByEmailOrUsername(emailOrUsername: string): Promise<UserDomain | null>;

  /**
   * Guardar usuario (create o update)
   */
  save(user: UserDomain): Promise<UserDomain>;

  /**
   * Eliminar usuario (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Listar todos los usuarios activos
   */
  findAll(): Promise<UserDomain[]>;

  /**
   * Contar usuarios activos
   */
  count(): Promise<number>;
}

// Token de inyección de dependencias
export const USER_REPOSITORY_TOKEN = Symbol('IUserRepository');
