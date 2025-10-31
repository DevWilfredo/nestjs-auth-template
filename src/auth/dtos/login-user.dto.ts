import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsString } from "class-validator"

export class LoginUserDto {
    @ApiProperty({example: 'wilfredo@example.com', description:"User's Email"})
    @IsEmail()
    email: string

    @ApiProperty({example:'StrongPass134*', description:"User's Password"})
    @IsString()
    password: string
}