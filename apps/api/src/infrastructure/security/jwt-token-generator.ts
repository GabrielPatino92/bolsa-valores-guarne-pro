import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ITokenGenerator,
  TokenPayload
} from '../../application/services/token-generator.interface';

/**
 * ADAPTADOR - Implementación del Generador de Tokens con JWT
 *
 * Clean Architecture: INFRASTRUCTURE LAYER
 * - Implementa el puerto ITokenGenerator
 * - Usa @nestjs/jwt como detalle de implementación
 * - Permite cambiar a otro tipo de tokens sin afectar casos de uso
 */

@Injectable()
export class JwtTokenGenerator implements ITokenGenerator {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generar access token (corta duración: 15 min)
   */
  generate(payload: TokenPayload): string {
    return this.jwtService.sign(
      payload,
      {
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
      }
    );
  }

  /**
   * Verificar y decodificar token
   * @throws Error si el token es inválido o expirado
   */
  verify(token: string): TokenPayload {
    try {
      const decoded = this.jwtService.verify(token);
      return {
        sub: decoded.sub,
        email: decoded.email,
        username: decoded.username,
        ...decoded,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Token inválido: ${errorMessage}`);
    }
  }

  /**
   * Generar refresh token (larga duración: 7 días)
   */
  generateRefresh(payload: TokenPayload): string {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET no está configurado');
    }

    return this.jwtService.sign(
      {
        sub: payload.sub,
        email: payload.email,
        username: payload.username,
        type: 'refresh', // Marcar como refresh token
      },
      {
        secret: refreshSecret,
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }
    );
  }

  /**
   * Verificar refresh token
   * @throws Error si el refresh token es inválido
   */
  verifyRefresh(token: string): TokenPayload {
    try {
      const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

      if (!refreshSecret) {
        throw new Error('JWT_REFRESH_SECRET no está configurado');
      }

      const decoded = this.jwtService.verify(token, { secret: refreshSecret });

      // Validar que sea un refresh token
      if (decoded.type !== 'refresh') {
        throw new Error('No es un refresh token válido');
      }

      return {
        sub: decoded.sub,
        email: decoded.email,
        username: decoded.username,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Refresh token inválido: ${errorMessage}`);
    }
  }
}
