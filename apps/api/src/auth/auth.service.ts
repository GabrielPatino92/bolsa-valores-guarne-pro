import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Provider } from '../entities/provider.entity';
import { UserProvider } from '../entities/user-provider.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SecurityService } from './security.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(UserProvider)
    private readonly userProviderRepository: Repository<UserProvider>,
    private readonly jwtService: JwtService,
    private readonly securityService: SecurityService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, username, password, fullName, providerIds } = registerDto;

    // 🔒 VALIDACIONES DE SEGURIDAD

    // Sanitizar inputs
    const sanitizedEmail = this.securityService.sanitizeString(email);
    const sanitizedUsername = this.securityService.sanitizeString(username);
    const sanitizedFullName = this.securityService.sanitizeString(fullName || '');

    // Validar email (detectar temporales y SQL injection)
    if (!this.securityService.validateEmail(sanitizedEmail)) {
      throw new BadRequestException('Email no válido o no permitido');
    }

    // Validar username (detectar patrones sospechosos)
    if (!this.securityService.validateUsername(sanitizedUsername)) {
      throw new BadRequestException('Username no válido');
    }

    // Validar fortaleza de contraseña
    const passwordValidation = this.securityService.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'Contraseña no cumple con los requisitos de seguridad',
        issues: passwordValidation.issues,
      });
    }

    // Verificar si el email ya existe
    const existingEmail = await this.userRepository.findOne({
      where: { email: sanitizedEmail },
    });
    if (existingEmail) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar si el username ya existe
    const existingUsername = await this.userRepository.findOne({
      where: { username: sanitizedUsername },
    });
    if (existingUsername) {
      throw new ConflictException('El username ya está en uso');
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // Crear usuario con valores sanitizados
    const user = this.userRepository.create({
      email: sanitizedEmail,
      username: sanitizedUsername,
      passwordHash,
      fullName: sanitizedFullName,
    });

    const savedUser = await this.userRepository.save(user);

    // Asociar proveedores si se especificaron
    if (providerIds && providerIds.length > 0) {
      for (const providerId of providerIds) {
        const provider = await this.providerRepository.findOne({
          where: { id: providerId },
        });

        if (provider) {
          const userProvider = this.userProviderRepository.create({
            userId: savedUser.id,
            providerId: provider.id,
            isTestnet: true,
            isActive: true,
          });
          await this.userProviderRepository.save(userProvider);
        }
      }
    }

    // Generar token JWT
    const token = this.generateToken(savedUser);

    return {
      message: 'Usuario registrado exitosamente',
      user: {
        id: savedUser.id,
        email: savedUser.email,
        username: savedUser.username,
        fullName: savedUser.fullName,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { emailOrUsername, password } = loginDto;

    // 🔒 VALIDACIONES DE SEGURIDAD

    // Sanitizar input
    const sanitizedIdentifier = this.securityService.sanitizeString(emailOrUsername);

    // Detectar NoSQL injection en el objeto
    if (this.securityService.detectNoSQLInjection(loginDto)) {
      throw new BadRequestException('Solicitud no válida');
    }

    // Buscar usuario por email o username
    const user = await this.userRepository.findOne({
      where: [{ email: sanitizedIdentifier }, { username: sanitizedIdentifier }],
      relations: ['userProviders', 'userProviders.provider'],
    });

    if (!user) {
      // Registrar intento fallido
      this.securityService.recordFailedAttempt(sanitizedIdentifier);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      // Registrar intento fallido
      this.securityService.recordFailedAttempt(sanitizedIdentifier);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Limpiar intentos fallidos después de login exitoso
    this.securityService.clearFailedAttempts(sanitizedIdentifier);

    // Actualizar último login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generar token JWT
    const token = this.generateToken(user);

    return {
      message: 'Login exitoso',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        providers: user.userProviders.map((up) => ({
          id: up.provider.id,
          name: up.provider.name,
          displayName: up.provider.displayName,
          isTestnet: up.isTestnet,
        })),
      },
      token,
    };
  }

  async getProviders() {
    const providers = await this.providerRepository.find({
      where: { isActive: true },
      order: { displayName: 'ASC' },
    });

    return providers.map((p) => ({
      id: p.id,
      name: p.name,
      displayName: p.displayName,
      type: p.type,
      supportsTestnet: p.supportsTestnet,
    }));
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };
    return this.jwtService.sign(payload);
  }
}
