import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
  })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({
    description: 'Nombre de usuario único',
    example: 'trader_pro',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @MinLength(3, { message: 'El username debe tener al menos 3 caracteres' })
  @MaxLength(20, { message: 'El username no puede exceder 20 caracteres' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'El username solo puede contener letras, números, guiones y guiones bajos',
  })
  username: string;

  @ApiProperty({
    description: 'Contraseña (mínimo 8 caracteres, debe incluir mayúscula, minúscula y número)',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  password: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @ApiProperty({
    description: 'IDs de los proveedores de trading que el usuario utilizará',
    example: ['d7e4058f-8fad-4097-a51a-880e80a2963f'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'providerIds debe ser un array' })
  @IsUUID('4', { each: true, message: 'Cada providerId debe ser un UUID válido' })
  providerIds?: string[];
}
