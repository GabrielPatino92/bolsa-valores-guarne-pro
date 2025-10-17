import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * Servicio de Encriptación de Nivel Empresarial
 *
 * Implementa:
 * - AES-256-GCM para encriptación simétrica
 * - IV únicos por cada encriptación
 * - Authentication tags para integridad
 * - Key derivation con PBKDF2
 */
@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly saltLength = 64;
  private readonly tagLength = 16;
  private readonly pbkdf2Iterations = 100000;

  private masterKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');

    if (!encryptionKey || encryptionKey.length < 64) {
      throw new Error(
        'ENCRYPTION_KEY must be at least 64 characters (32 bytes hex). ' +
        'Generate with: openssl rand -hex 32'
      );
    }

    // Convertir hex string a buffer
    this.masterKey = Buffer.from(encryptionKey, 'hex');

    if (this.masterKey.length !== this.keyLength) {
      throw new Error(`Master key must be exactly ${this.keyLength} bytes`);
    }
  }

  /**
   * Encripta datos sensibles con AES-256-GCM
   *
   * @param plaintext - Texto plano a encriptar
   * @returns String en formato: salt.iv.tag.ciphertext (todo en base64)
   */
  encrypt(plaintext: string): string {
    if (!plaintext) {
      throw new Error('Cannot encrypt empty string');
    }

    try {
      // Generar salt único para key derivation
      const salt = crypto.randomBytes(this.saltLength);

      // Derivar key específica de este salt
      const key = crypto.pbkdf2Sync(
        this.masterKey,
        salt,
        this.pbkdf2Iterations,
        this.keyLength,
        'sha512'
      );

      // Generar IV único para esta encriptación
      const iv = crypto.randomBytes(this.ivLength);

      // Crear cipher
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);

      // Encriptar
      let encrypted = cipher.update(plaintext, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      // Obtener authentication tag
      const tag = cipher.getAuthTag();

      // Formato: salt.iv.tag.ciphertext (todo en base64)
      return [
        salt.toString('base64'),
        iv.toString('base64'),
        tag.toString('base64'),
        encrypted
      ].join('.');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Encryption failed: ${errorMessage}`);
    }
  }

  /**
   * Desencripta datos con AES-256-GCM
   *
   * @param encryptedData - String en formato: salt.iv.tag.ciphertext
   * @returns Texto plano desencriptado
   */
  decrypt(encryptedData: string): string {
    if (!encryptedData) {
      throw new Error('Cannot decrypt empty string');
    }

    try {
      // Parsear componentes
      const parts = encryptedData.split('.');

      if (parts.length !== 4) {
        throw new Error('Invalid encrypted data format');
      }

      const [saltB64, ivB64, tagB64, ciphertext] = parts;

      // Convertir de base64 a buffers
      const salt = Buffer.from(saltB64, 'base64');
      const iv = Buffer.from(ivB64, 'base64');
      const tag = Buffer.from(tagB64, 'base64');

      // Derivar la misma key usando el salt
      const key = crypto.pbkdf2Sync(
        this.masterKey,
        salt,
        this.pbkdf2Iterations,
        this.keyLength,
        'sha512'
      );

      // Crear decipher
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(tag);

      // Desencriptar
      let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Decryption failed: ${errorMessage}`);
    }
  }

  /**
   * Hash one-way para passwords (NO reversible)
   * Usa SHA-512 con salt
   */
  hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const passwordSalt = salt || crypto.randomBytes(32).toString('hex');

    const hash = crypto
      .pbkdf2Sync(password, passwordSalt, 100000, 64, 'sha512')
      .toString('hex');

    return { hash, salt: passwordSalt };
  }

  /**
   * Verifica password contra hash
   */
  verifyPassword(password: string, hash: string, salt: string): boolean {
    const { hash: newHash } = this.hashPassword(password, salt);
    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(newHash)
    );
  }

  /**
   * Genera token seguro aleatorio
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash para datos no sensibles (determinístico)
   */
  hash(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }
}
