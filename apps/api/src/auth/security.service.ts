import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Servicio de seguridad centralizado
 *
 * Implementa:
 * - Sanitización de inputs
 * - Detección de patrones sospechosos
 * - Logging de seguridad
 * - Rate limiting por IP
 */

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);
  private failedAttempts = new Map<string, number>();
  private blockedIPs = new Set<string>();

  /**
   * Sanitiza un string removiendo caracteres peligrosos
   */
  sanitizeString(input: string): string {
    if (!input) return '';

    // Remover caracteres peligrosos comunes en ataques
    return input
      .replace(/[<>\"']/g, '')  // XSS básico
      .replace(/[\x00-\x1F\x7F]/g, '') // Caracteres de control
      .trim();
  }

  /**
   * Valida que el email no contenga patrones sospechosos
   */
  validateEmail(email: string): boolean {
    // Detectar emails temporales conocidos
    const disposableEmailDomains = [
      '10minutemail.com',
      'guerrillamail.com',
      'mailinator.com',
      'temp-mail.org',
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    if (disposableEmailDomains.includes(domain)) {
      this.logger.warn(`Intento de registro con email temporal: ${email}`);
      return false;
    }

    // Detectar patrones de SQL injection en email
    const sqlPattern = /(union|select|insert|update|delete|drop|;|--|\/\*|\*\/)/i;
    if (sqlPattern.test(email)) {
      this.logger.error(`SQL Injection detectado en email: ${email}`);
      return false;
    }

    return true;
  }

  /**
   * Valida que el username no contenga patrones peligrosos
   */
  validateUsername(username: string): boolean {
    // Detectar usernames comunes de bots
    const botPatterns = ['admin', 'root', 'test', 'demo', 'bot', 'crawler'];
    const lower = username.toLowerCase();

    if (botPatterns.some(pattern => lower.includes(pattern))) {
      this.logger.warn(`Username sospechoso detectado: ${username}`);
    }

    // Detectar intentos de path traversal
    if (username.includes('../') || username.includes('..\\')) {
      this.logger.error(`Path traversal detectado en username: ${username}`);
      return false;
    }

    return true;
  }

  /**
   * Registra un intento fallido de login/registro
   */
  recordFailedAttempt(identifier: string, ip?: string): void {
    const key = ip || identifier;
    const current = this.failedAttempts.get(key) || 0;
    this.failedAttempts.set(key, current + 1);

    this.logger.warn(`Intento fallido #${current + 1} para ${identifier} desde IP: ${ip}`);

    // Bloquear después de 5 intentos fallidos
    if (current + 1 >= 5) {
      this.blockedIPs.add(key);
      this.logger.error(`IP bloqueada por múltiples intentos fallidos: ${key}`);

      // Desbloquear después de 15 minutos
      setTimeout(() => {
        this.blockedIPs.delete(key);
        this.failedAttempts.delete(key);
        this.logger.log(`IP desbloqueada: ${key}`);
      }, 15 * 60 * 1000);
    }
  }

  /**
   * Verifica si una IP está bloqueada
   */
  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  /**
   * Limpia intentos fallidos después de login exitoso
   */
  clearFailedAttempts(identifier: string): void {
    this.failedAttempts.delete(identifier);
  }

  /**
   * Genera un hash seguro para almacenar datos sensibles
   */
  hashSensitiveData(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }

  /**
   * Valida la fortaleza de una contraseña
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (password.length < 8) {
      issues.push('Debe tener al menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      issues.push('Debe contener al menos una mayúscula');
    }

    if (!/[a-z]/.test(password)) {
      issues.push('Debe contener al menos una minúscula');
    }

    if (!/[0-9]/.test(password)) {
      issues.push('Debe contener al menos un número');
    }

    // Detectar contraseñas comunes
    const commonPasswords = [
      'password', '12345678', 'qwerty', 'abc123', 'password123'
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
      issues.push('Contraseña demasiado común');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Detecta patrones de NoSQL injection
   */
  detectNoSQLInjection(input: any): boolean {
    if (typeof input === 'object') {
      const keys = Object.keys(input);
      // Detectar operadores de MongoDB
      const dangerous = keys.some(key =>
        key.startsWith('$') || key.includes('..') || key.includes('__proto__')
      );

      if (dangerous) {
        this.logger.error('NoSQL Injection detectado');
        return true;
      }
    }
    return false;
  }
}
