# 🏛️ CLEAN ARCHITECTURE - Guarne Pro

## 📋 ÍNDICE
1. [Introducción](#introducción)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Capas de la Arquitectura](#capas-de-la-arquitectura)
4. [Implementación Actual](#implementación-actual)
5. [Principios SOLID](#principios-solid)
6. [Flujo de Datos](#flujo-de-datos)
7. [Testing](#testing)
8. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🎯 INTRODUCCIÓN

**Clean Architecture** es un patrón arquitectónico creado por Robert C. Martin (Uncle Bob) que promueve la separación de responsabilidades, la independencia de frameworks, y la facilidad de testeo.

### ✅ Beneficios Implementados

1. **Independencia de Frameworks**: La lógica de negocio NO depende de NestJS, TypeORM o cualquier otro framework
2. **Testeable**: Los casos de uso son fáciles de testear con mocks
3. **Independencia de UI**: La lógica de negocio no conoce detalles de HTTP, REST o GraphQL
4. **Independencia de Base de Datos**: Podemos cambiar de TypeORM a Prisma sin afectar la lógica de negocio
5. **Independencia de Agentes Externos**: Las APIs externas son detalles de implementación

### 🔄 Regla de Dependencia

**Las dependencias solo pueden apuntar hacia adentro:**

```
┌─────────────────────────────────────────┐
│   CAPA EXTERNA: Infraestructura         │ ← Frameworks, DB, HTTP
│   ↓ depende de ↓                        │
│   CAPA MEDIA: Aplicación                │ ← Casos de Uso
│   ↓ depende de ↓                        │
│   CAPA INTERNA: Dominio                 │ ← Entidades de Negocio
└─────────────────────────────────────────┘
```

**❌ NUNCA** una capa interna debe depender de una capa externa.

---

## 🗂️ ESTRUCTURA DEL PROYECTO

```
apps/api/src/
│
├── 🔵 domain/                        # CAPA 1: DOMINIO (Núcleo Inmutable)
│   ├── entities/                    # Entidades de negocio con reglas de dominio
│   │   └── user.domain.ts          # ✅ Implementado
│   │       • Validaciones de negocio
│   │       • Métodos de negocio (recordLogin, activate, etc.)
│   │       • NO frameworks, solo lógica pura
│   │
│   └── value-objects/               # Objetos de valor inmutables (futuro)
│       ├── email.vo.ts             # ⚠️ Pendiente
│       ├── password.vo.ts          # ⚠️ Pendiente
│       └── api-key.vo.ts           # ⚠️ Pendiente
│
├── 🟢 application/                   # CAPA 2: APLICACIÓN (Orquestación)
│   ├── use-cases/                  # Casos de uso (flujos de negocio)
│   │   ├── register-user.use-case.ts    # ✅ Implementado
│   │   └── login-user.use-case.ts       # ✅ Implementado
│   │
│   ├── repositories/               # PUERTOS (Interfaces)
│   │   └── user.repository.interface.ts  # ✅ Implementado
│   │       • findByEmail()
│   │       • findByUsername()
│   │       • save()
│   │       • delete()
│   │
│   └── services/                   # PUERTOS (Interfaces de Servicios)
│       ├── password-hasher.interface.ts  # ✅ Implementado
│       └── token-generator.interface.ts  # ✅ Implementado
│
├── 🟠 infrastructure/                # CAPA 3: INFRAESTRUCTURA (Detalles)
│   ├── persistence/                # Persistencia de datos
│   │   ├── typeorm/
│   │   │   └── repositories/
│   │   │       └── user.repository.impl.ts  # ✅ ADAPTADOR TypeORM
│   │   │           • Implementa IUserRepository
│   │   │           • Usa TypeORM Repository
│   │   │           • Convierte Domain ↔ ORM
│   │   │
│   │   └── mappers/                # Conversión Domain ↔ ORM
│   │       └── user.mapper.ts      # ✅ Implementado
│   │           • toDomain()  (ORM → Domain)
│   │           • toEntity()  (Domain → ORM)
│   │
│   ├── security/                   # Servicios de seguridad
│   │   ├── bcrypt-password-hasher.ts     # ✅ ADAPTADOR bcrypt
│   │   │   • Implementa IPasswordHasher
│   │   │   • hash() con 12 rounds
│   │   │   • compare() timing-safe
│   │   │
│   │   └── jwt-token-generator.ts        # ✅ ADAPTADOR JWT
│   │       • Implementa ITokenGenerator
│   │       • generate() access token
│   │       • generateRefresh() refresh token
│   │       • verify() tokens
│   │
│   └── http/                       # Controladores REST
│       ├── controllers/
│       │   └── auth.controller.ts  # ✅ HTTP Adapter (legacy)
│       └── dto/
│           ├── register.dto.ts     # ✅ Validación de inputs
│           └── login.dto.ts        # ✅ Validación de inputs
│
└── 🟣 shared/                        # CAPA TRANSVERSAL (Utilidades)
    ├── encryption.service.ts       # ✅ AES-256-GCM encryption
    └── logger.service.ts           # Logging (futuro)
```

---

## 🎨 CAPAS DE LA ARQUITECTURA

### 1️⃣ CAPA DE DOMINIO (Domain Layer)

**Responsabilidad**: Contener la lógica de negocio pura y las reglas de dominio.

**Características**:
- ✅ NO depende de ningún framework
- ✅ NO conoce detalles de infraestructura
- ✅ Contiene entidades de negocio con comportamiento
- ✅ Inmutable y testeable sin mocks

**Ejemplo: [user.domain.ts](../apps/api/src/domain/entities/user.domain.ts)**

```typescript
export class UserDomain {
  // ❌ NO usa decoradores de TypeORM
  // ❌ NO usa decoradores de NestJS
  // ✅ Solo lógica de negocio pura

  /**
   * Factory method con validaciones de negocio
   */
  static create(props: Partial<UserDomainProps>): UserDomain {
    // Validaciones de negocio
    if (!props.email || !props.username || !props.passwordHash) {
      throw new Error('Email, username y passwordHash son requeridos');
    }

    if (!UserDomain.isValidEmail(props.email)) {
      throw new Error('Email inválido');
    }

    return new UserDomain({
      id: props.id || crypto.randomUUID(),
      email: props.email,
      username: props.username,
      // ... más props
    });
  }

  /**
   * Método de negocio: Registrar login exitoso
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
   * Validación de negocio: Email válido
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
```

---

### 2️⃣ CAPA DE APLICACIÓN (Application Layer)

**Responsabilidad**: Orquestar la lógica de negocio mediante casos de uso.

**Características**:
- ✅ Coordina el flujo de datos entre capas
- ✅ Depende SOLO de interfaces (puertos)
- ✅ NO conoce detalles de implementación
- ✅ Fácil de testear con mocks

#### 📝 Casos de Uso (Use Cases)

**Ejemplo: [register-user.use-case.ts](../apps/api/src/application/use-cases/register-user.use-case.ts)**

```typescript
@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,  // ← Interfaz (Puerto)
    @Inject(PASSWORD_HASHER_TOKEN)
    private readonly passwordHasher: IPasswordHasher,  // ← Interfaz (Puerto)
    @Inject(TOKEN_GENERATOR_TOKEN)
    private readonly tokenGenerator: ITokenGenerator, // ← Interfaz (Puerto)
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    // 1. Validar que el email no exista
    const existingByEmail = await this.userRepository.findByEmail(input.email);
    if (existingByEmail) {
      throw new Error('Email ya está registrado');
    }

    // 2. Hash de la contraseña (usando interfaz)
    const passwordHash = await this.passwordHasher.hash(input.password);

    // 3. Crear entidad de dominio (con validaciones de negocio)
    const userDomain = UserDomain.create({
      email: input.email,
      username: input.username,
      passwordHash,
      fullName: input.fullName,
    });

    // 4. Persistir en repositorio (usando interfaz)
    const savedUser = await this.userRepository.save(userDomain);

    // 5. Generar token (usando interfaz)
    const token = this.tokenGenerator.generate({
      sub: savedUser.id,
      email: savedUser.email,
      username: savedUser.username,
    });

    // 6. Retornar DTO de salida
    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        username: savedUser.username,
      },
      token,
    };
  }
}
```

#### 🔌 Puertos (Ports) - Interfaces

**Ejemplo: [user.repository.interface.ts](../apps/api/src/application/repositories/user.repository.interface.ts)**

```typescript
/**
 * PUERTO - Interfaz del Repositorio de Usuario
 *
 * Define el CONTRATO que debe cumplir cualquier implementación.
 * La capa de aplicación NO conoce si es TypeORM, Prisma o MongoDB.
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<UserDomain | null>;
  findByUsername(username: string): Promise<UserDomain | null>;
  save(user: UserDomain): Promise<UserDomain>;
  delete(id: string): Promise<void>;
}

// Token para inyección de dependencias
export const USER_REPOSITORY_TOKEN = Symbol('IUserRepository');
```

---

### 3️⃣ CAPA DE INFRAESTRUCTURA (Infrastructure Layer)

**Responsabilidad**: Implementar los detalles técnicos (DB, HTTP, etc.)

**Características**:
- ✅ Implementa las interfaces (puertos) definidas en la capa de aplicación
- ✅ Usa frameworks específicos (TypeORM, bcrypt, JWT)
- ✅ Se puede cambiar sin afectar la lógica de negocio

#### 🔧 Adaptadores (Adapters) - Implementaciones

**Ejemplo: [user.repository.impl.ts](../apps/api/src/infrastructure/persistence/typeorm/repositories/user.repository.impl.ts)**

```typescript
@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)  // ← TypeORM Repository
    private readonly userRepository: Repository<User>,
    private readonly userMapper: UserMapper,  // ← Mapper Domain ↔ ORM
  ) {}

  async findByEmail(email: string): Promise<UserDomain | null> {
    // 1. Consultar con TypeORM (detalle de implementación)
    const userEntity = await this.userRepository.findOne({
      where: { email },
      relations: ['userProviders'],
    });

    // 2. Convertir ORM → Domain (usando mapper)
    return userEntity ? this.userMapper.toDomain(userEntity) : null;
  }

  async save(user: UserDomain): Promise<UserDomain> {
    // 1. Convertir Domain → ORM (usando mapper)
    const userEntity = this.userMapper.toEntity(user);

    // 2. Persistir con TypeORM
    const savedEntity = await this.userRepository.save(userEntity);

    // 3. Convertir ORM → Domain
    return this.userMapper.toDomain(savedEntity);
  }
}
```

**Ejemplo: [bcrypt-password-hasher.ts](../apps/api/src/infrastructure/security/bcrypt-password-hasher.ts)**

```typescript
@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly SALT_ROUNDS = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
```

#### 🔄 Mappers (Conversión Domain ↔ ORM)

**Ejemplo: [user.mapper.ts](../apps/api/src/infrastructure/persistence/mappers/user.mapper.ts)**

```typescript
@Injectable()
export class UserMapper {
  /**
   * Convertir de ORM Entity → Domain Entity
   */
  toDomain(ormEntity: User): UserDomain {
    return UserDomain.create({
      id: ormEntity.id,
      email: ormEntity.email,
      username: ormEntity.username,
      passwordHash: ormEntity.passwordHash,
      fullName: ormEntity.fullName,
      // ... más propiedades
    });
  }

  /**
   * Convertir de Domain Entity → ORM Entity
   */
  toEntity(domainEntity: UserDomain): User {
    const user = new User();
    user.id = domainEntity.id;
    user.email = domainEntity.email;
    user.username = domainEntity.username;
    user.passwordHash = domainEntity.passwordHash;
    // ... más propiedades
    return user;
  }
}
```

---

## 🔗 INYECCIÓN DE DEPENDENCIAS

### Configuración en [auth.module.ts](../apps/api/src/auth/auth.module.ts)

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({ /* ... */ }),
  ],
  providers: [
    // ========== CLEAN ARCHITECTURE - USE CASES ==========
    RegisterUserUseCase,
    LoginUserUseCase,

    // ========== DEPENDENCY INJECTION (Puertos → Adaptadores) ==========

    // Repositorio de Usuario: Puerto → Adaptador
    {
      provide: USER_REPOSITORY_TOKEN,        // ← Token (símbolo)
      useClass: TypeOrmUserRepository,        // ← Implementación
    },

    // Servicio de Hash: Puerto → Adaptador
    {
      provide: PASSWORD_HASHER_TOKEN,
      useClass: BcryptPasswordHasher,         // ← Podría ser Argon2PasswordHasher
    },

    // Generador de Tokens: Puerto → Adaptador
    {
      provide: TOKEN_GENERATOR_TOKEN,
      useClass: JwtTokenGenerator,            // ← Podría ser PassportTokenGenerator
    },

    // Mappers
    UserMapper,
  ],
  exports: [
    RegisterUserUseCase,
    LoginUserUseCase,
    // ... exports de tokens
  ],
})
export class AuthModule {}
```

**💡 Ventaja**: Si queremos cambiar de `bcrypt` a `argon2`, solo creamos `Argon2PasswordHasher` que implemente `IPasswordHasher` y cambiamos el `useClass` en el módulo. **Los casos de uso NO cambian**.

---

## 🧪 PRINCIPIOS SOLID

### 1. **S**ingle Responsibility Principle

Cada clase tiene una única responsabilidad:
- `UserDomain`: Reglas de negocio de Usuario
- `RegisterUserUseCase`: Orquestar registro de usuario
- `TypeOrmUserRepository`: Persistencia con TypeORM
- `UserMapper`: Conversión Domain ↔ ORM

### 2. **O**pen/Closed Principle

Las clases están abiertas a extensión pero cerradas a modificación:
- Podemos crear `PrismaUserRepository` sin modificar `RegisterUserUseCase`

### 3. **L**iskov Substitution Principle

Podemos sustituir implementaciones sin romper el código:
- `BcryptPasswordHasher` ↔ `Argon2PasswordHasher`

### 4. **I**nterface Segregation Principle

Las interfaces son específicas:
- `IPasswordHasher`: Solo hash y compare
- `ITokenGenerator`: Solo generate y verify

### 5. **D**ependency Inversion Principle ⭐

**Este es el principio más importante de Clean Architecture:**

```typescript
// ❌ MAL: Dependencia directa (acoplamiento)
class RegisterUserUseCase {
  constructor(
    private repo: TypeOrmUserRepository  // ← Acoplado a TypeORM
  ) {}
}

// ✅ BIEN: Dependencia de interfaz (inversión)
class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private repo: IUserRepository  // ← Depende de abstracción
  ) {}
}
```

---

## 🔄 FLUJO DE DATOS

### Ejemplo: Registro de Usuario

```
1. HTTP Request (POST /api/auth/register)
   │
   ↓
2. AuthController (Infrastructure)
   │ - Valida DTO con class-validator
   │ - Sanitiza inputs con SecurityService
   ↓
3. RegisterUserUseCase (Application)
   │ - Verifica email único (vía IUserRepository)
   │ - Verifica username único (vía IUserRepository)
   │ - Hash contraseña (vía IPasswordHasher)
   ↓
4. UserDomain.create() (Domain)
   │ - Validaciones de negocio
   │ - Crea entidad de dominio
   ↓
5. IUserRepository.save() (Application → Infrastructure)
   │ - UserMapper.toEntity() (Domain → ORM)
   │ - TypeORM Repository.save()
   │ - UserMapper.toDomain() (ORM → Domain)
   ↓
6. ITokenGenerator.generate() (Application → Infrastructure)
   │ - Genera JWT token
   ↓
7. HTTP Response
   │ - Retorna { user, token }
```

---

## 🧪 TESTING

### Ventajas de Clean Architecture para Testing

#### Test de Dominio (Unit Test)

```typescript
describe('UserDomain', () => {
  it('debe crear un usuario válido', () => {
    const user = UserDomain.create({
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: 'hashed_password',
    });

    expect(user.email).toBe('test@example.com');
    expect(user.isActive).toBe(true); // Default
  });

  it('debe fallar con email inválido', () => {
    expect(() => {
      UserDomain.create({
        email: 'invalid-email',
        username: 'testuser',
        passwordHash: 'hashed_password',
      });
    }).toThrow('Email inválido');
  });

  it('debe registrar último login', () => {
    const user = UserDomain.create({
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: 'hashed_password',
    });

    user.recordLogin();

    expect(user.lastLoginAt).toBeInstanceOf(Date);
  });
});
```

#### Test de Caso de Uso (Unit Test con Mocks)

```typescript
describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockPasswordHasher: jest.Mocked<IPasswordHasher>;
  let mockTokenGenerator: jest.Mocked<ITokenGenerator>;

  beforeEach(() => {
    // Crear mocks de las interfaces
    mockUserRepository = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      save: jest.fn(),
    } as any;

    mockPasswordHasher = {
      hash: jest.fn(),
    } as any;

    mockTokenGenerator = {
      generate: jest.fn(),
    } as any;

    // Inyectar mocks en el caso de uso
    useCase = new RegisterUserUseCase(
      mockUserRepository,
      mockPasswordHasher,
      mockTokenGenerator,
    );
  });

  it('debe registrar un usuario exitosamente', async () => {
    // Arrange
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.findByUsername.mockResolvedValue(null);
    mockPasswordHasher.hash.mockResolvedValue('hashed_password');
    mockUserRepository.save.mockResolvedValue({
      id: '123',
      email: 'test@example.com',
      username: 'testuser',
    } as UserDomain);
    mockTokenGenerator.generate.mockReturnValue('jwt_token');

    // Act
    const result = await useCase.execute({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    });

    // Assert
    expect(result.user.id).toBe('123');
    expect(result.token).toBe('jwt_token');
    expect(mockUserRepository.save).toHaveBeenCalled();
  });

  it('debe fallar si el email ya existe', async () => {
    // Arrange
    mockUserRepository.findByEmail.mockResolvedValue({} as UserDomain);

    // Act & Assert
    await expect(
      useCase.execute({
        email: 'existing@example.com',
        username: 'testuser',
        password: 'password123',
      }),
    ).rejects.toThrow('Email ya está registrado');
  });
});
```

---

## 📚 EJEMPLOS DE USO

### Cambiar de TypeORM a Prisma (Sin afectar lógica de negocio)

#### 1. Crear nuevo adaptador

```typescript
// infrastructure/persistence/prisma/repositories/user.repository.impl.ts

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserDomain | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? UserMapper.toDomain(user) : null;
  }

  async save(user: UserDomain): Promise<UserDomain> {
    const data = UserMapper.toEntity(user);

    const savedUser = await this.prisma.user.upsert({
      where: { id: user.id },
      create: data,
      update: data,
    });

    return UserMapper.toDomain(savedUser);
  }
}
```

#### 2. Cambiar el módulo

```typescript
// auth.module.ts

@Module({
  providers: [
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: PrismaUserRepository,  // ← Solo cambio aquí
    },
    // ... resto sin cambios
  ],
})
export class AuthModule {}
```

**✅ Los casos de uso, el dominio y los controladores NO cambian.**

---

### Cambiar de bcrypt a argon2

#### 1. Crear nuevo adaptador

```typescript
// infrastructure/security/argon2-password-hasher.ts

import * as argon2 from 'argon2';

@Injectable()
export class Argon2PasswordHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}
```

#### 2. Cambiar el módulo

```typescript
@Module({
  providers: [
    {
      provide: PASSWORD_HASHER_TOKEN,
      useClass: Argon2PasswordHasher,  // ← Solo cambio aquí
    },
  ],
})
export class AuthModule {}
```

---

## 📝 CONVENCIONES Y BUENAS PRÁCTICAS

### Nomenclatura

| Tipo | Sufijo | Ejemplo |
|------|--------|---------|
| Entidad de Dominio | `.domain.ts` | `user.domain.ts` |
| Caso de Uso | `.use-case.ts` | `register-user.use-case.ts` |
| Interfaz (Puerto) | `.interface.ts` | `user.repository.interface.ts` |
| Implementación (Adaptador) | `.impl.ts` | `user.repository.impl.ts` |
| Mapper | `.mapper.ts` | `user.mapper.ts` |
| DTO | `.dto.ts` | `register.dto.ts` |

### Reglas

1. ✅ Las entidades de dominio NUNCA importan frameworks
2. ✅ Los casos de uso SOLO dependen de interfaces
3. ✅ Los adaptadores implementan interfaces
4. ✅ Los mappers convierten Domain ↔ Infrastructure
5. ✅ Los DTOs validan inputs del exterior

---

## 🚀 PRÓXIMOS PASOS

### Futuras Mejoras

1. **Value Objects**: Crear objetos de valor inmutables
   - `Email.vo.ts`: Validación de email
   - `Password.vo.ts`: Validación de contraseña
   - `ApiKey.vo.ts`: Encapsular lógica de API keys

2. **Domain Events**: Implementar eventos de dominio
   - `UserRegistered`: Disparar cuando un usuario se registra
   - `UserLoggedIn`: Disparar cuando un usuario hace login
   - Event handlers para envío de emails, métricas, etc.

3. **Specification Pattern**: Implementar especificaciones reutilizables
   - `ActiveUserSpecification`: Filtrar usuarios activos
   - `EmailVerifiedSpecification`: Filtrar usuarios verificados

4. **CQRS**: Separar comandos de consultas
   - Commands: `RegisterUserCommand`, `LoginUserCommand`
   - Queries: `GetUserByEmailQuery`, `GetAllUsersQuery`

---

## 📖 RECURSOS

- [The Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Clean Architecture Book](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)
- [Domain-Driven Design](https://www.domainlanguage.com/ddd/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

**Última actualización**: 2025-10-17
**Versión del documento**: 1.0
**Autor**: Equipo DevSecOps Guarne
