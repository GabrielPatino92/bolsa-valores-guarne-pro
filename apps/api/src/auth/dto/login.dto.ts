import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email o username del usuario',
    example: 'usuario@ejemplo.com',
  })
  @IsString()
  emailOrUsername: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'Password123!',
  })
  @IsString()
  @MinLength(1)
  password: string;
}
