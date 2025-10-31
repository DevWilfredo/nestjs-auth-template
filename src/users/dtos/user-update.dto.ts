import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsStrongPassword } from 'class-validator';

export class UpdateUserDto {
    @ApiProperty({ example: 'Wilfredo', description: "User's Firstname" })
    @IsOptional()
    @IsString()
    firstname?: string;

    @ApiProperty({ example: 'Pinto', description: "User's Lastname" })
    @IsOptional()
    @IsString()
    lastname?: string;

    @ApiProperty({ example: 'wilfredo@example.com', description: "User's Email" })
    @IsOptional()
    @IsEmail()
    email?: string;
}
