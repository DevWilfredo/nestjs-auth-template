import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({
    example:
      'User Register Succesfully. Check your email to activate your account.',
    description:
      'Confirmation message after successful registration.',
  })
  message: string;
}
