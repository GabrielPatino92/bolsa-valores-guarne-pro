/**
 * PUERTO - Interfaz del Generador de Tokens
 *
 * Clean Architecture: INTERFACE (Puerto)
 */

export interface TokenPayload {
  sub: string;
  email: string;
  username: string;
  [key: string]: any;
}

export interface ITokenGenerator {
  /**
   * Generar token de acceso
   */
  generate(payload: TokenPayload): string;

  /**
   * Verificar y decodificar token
   */
  verify(token: string): TokenPayload;

  /**
   * Generar refresh token
   */
  generateRefresh(payload: TokenPayload): string;
}

export const TOKEN_GENERATOR_TOKEN = Symbol('ITokenGenerator');
