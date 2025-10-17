import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../application/services/password-hasher.interface';

/**
 * ADAPTADOR - Implementación del Servicio de Hash con bcrypt
 *
 * Clean Architecture: INFRASTRUCTURE LAYER
 * - Implementa el puerto IPasswordHasher
 * - Usa bcrypt como detalle de implementación
 * - Permite cambiar a argon2 o scrypt sin afectar casos de uso
 */

@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly SALT_ROUNDS = 12; // 2^12 = 4096 iteraciones

  /**
   * Hashear contraseña con bcrypt
   * - Genera salt único automáticamente
   * - Tiempo: ~300-400ms (seguro contra timing attacks)
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Comparar contraseña con hash
   * - Timing-safe comparison
   * - Previene timing attacks
   */
  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
