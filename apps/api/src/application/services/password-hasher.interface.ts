/**
 * PUERTO - Interfaz del Servicio de Hash de Contraseñas
 *
 * Clean Architecture: INTERFACE (Puerto)
 * - Define el contrato
 * - Permite cambiar implementación (bcrypt → argon2) sin afectar casos de uso
 */

export interface IPasswordHasher {
  /**
   * Hashear contraseña
   */
  hash(password: string): Promise<string>;

  /**
   * Comparar contraseña con hash
   */
  compare(password: string, hash: string): Promise<boolean>;
}

export const PASSWORD_HASHER_TOKEN = Symbol('IPasswordHasher');
