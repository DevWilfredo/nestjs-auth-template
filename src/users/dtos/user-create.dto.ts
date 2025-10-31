import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsStrongPassword } from "class-validator";

export class CreateUserDto {

    @ApiProperty({ example: 'Wilfredo', description: 'User first name' })
    @IsString()
    firstname: string;

    @ApiProperty({ example: 'Pinto', description: 'User last name' })
    @IsString()
    lastname: string;

    @ApiProperty({ example: 'wilfredo@example.com', description: 'User email address' })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'StrongPass123*',
        description: 'User password. Minimum 8 characters; must include uppercase, lowercase, numbers and special characters.'
    })
    @IsStrongPassword()
    password: string;

}