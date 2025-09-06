import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com', description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPassword123!', description: 'User password' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John', description: 'First name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'Last name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;
}
