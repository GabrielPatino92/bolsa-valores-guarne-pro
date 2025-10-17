/**
 * CAPA DE DOMINIO - Entidad User
 *
 * Clean Architecture Layer: DOMAIN (Innermost)
 * - NO depende de frameworks
 * - NO depende de base de datos
 * - Lógica de negocio pura
 */

export interface UserDomainProps {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  fullName?: string;
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class UserDomain {
  private props: UserDomainProps;

  private constructor(props: UserDomainProps) {
    this.props = props;
  }

  /**
   * Factory method para crear un User válido
   */
  static create(props: Partial<UserDomainProps>): UserDomain {
    // Validaciones de negocio
    if (!props.email || !props.username || !props.passwordHash) {
      throw new Error('Email, username y passwordHash son requeridos');
    }

    if (!UserDomain.isValidEmail(props.email)) {
      throw new Error('Email inválido');
    }

    if (!UserDomain.isValidUsername(props.username)) {
      throw new Error('Username debe tener 3-30 caracteres alfanuméricos');
    }

    const now = new Date();

    return new UserDomain({
      id: props.id || crypto.randomUUID(),
      email: props.email,
      username: props.username,
      passwordHash: props.passwordHash,
      fullName: props.fullName,
      isActive: props.isActive ?? true,
      emailVerified: props.emailVerified ?? false,
      twoFactorEnabled: props.twoFactorEnabled ?? false,
      twoFactorSecret: props.twoFactorSecret,
      lastLoginAt: props.lastLoginAt,
      createdAt: props.createdAt || now,
      updatedAt: props.updatedAt || now,
    });
  }

  /**
   * Reglas de negocio: Validación de email
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Reglas de negocio: Validación de username
   */
  private static isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    return usernameRegex.test(username);
  }

  // Getters (encapsulación)
  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get username(): string {
    return this.props.username;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get fullName(): string | undefined {
    return this.props.fullName;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get emailVerified(): boolean {
    return this.props.emailVerified;
  }

  get twoFactorEnabled(): boolean {
    return this.props.twoFactorEnabled;
  }

  get twoFactorSecret(): string | undefined {
    return this.props.twoFactorSecret;
  }

  get lastLoginAt(): Date | undefined {
    return this.props.lastLoginAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Método de negocio: Actualizar último login
   */
  recordLogin(): void {
    this.props.lastLoginAt = new Date();
    this.props.updatedAt = new Date();
  }

  /**
   * Método de negocio: Activar usuario
   */
  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  /**
   * Método de negocio: Desactivar usuario
   */
  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  /**
   * Método de negocio: Verificar email
   */
  verifyEmail(): void {
    this.props.emailVerified = true;
    this.props.updatedAt = new Date();
  }

  /**
   * Método de negocio: ¿Puede iniciar sesión?
   */
  canLogin(): boolean {
    return this.props.isActive && this.props.emailVerified;
  }

  /**
   * Serialización para persistencia
   */
  toObject(): UserDomainProps {
    return { ...this.props };
  }
}
