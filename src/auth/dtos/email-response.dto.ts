import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailResponseDto {
    @ApiProperty({
        example:
            'Email verified successfully. You can now log in.',
        description:
            'Confirmation message once the email has been successfully verified.',
    })
    message: string;
}
