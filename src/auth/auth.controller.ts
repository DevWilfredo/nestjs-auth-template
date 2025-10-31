import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Post,
    Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dtos/user-create.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { UsersService } from 'src/users/users.service';
import {
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiOkResponse,
    ApiQuery,
} from '@nestjs/swagger';
import { LoginResponseDto } from './dtos/login-response.dto';
import { RegisterResponseDto } from './dtos/register-response.dto';
import { VerifyEmailResponseDto } from './dtos/email-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private userService: UsersService,
    ) { }

    // ==============================
    // REGISTER
    // ==============================
    @Post('register')
    @ApiOperation({
        summary: 'User registration',
        description:
            'Creates a new user and sends an email with a verification link.',
    })
    @ApiResponse({
        status: 201,
        description:
            'User registered successfully. Check your email to verify your account.',
        type: RegisterResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Email already in use or invalid input data.',
    })
    async register(@Body() body: CreateUserDto): Promise<RegisterResponseDto> {
        return await this.authService.register(
            body.firstname,
            body.lastname,
            body.email,
            body.password,
        );
    }

    // ==============================
    // LOGIN
    // ==============================
    @Post('login')
    @ApiOperation({
        summary: 'User login',
        description:
            'Authenticates a user using email and password. Returns a JWT token.',
    })
    @ApiOkResponse({
        description: 'Login successful.',
        type: LoginResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid credentials.',
    })
    async login(@Body() body: LoginUserDto): Promise<LoginResponseDto> {
        return this.authService.login(body.email, body.password);
    }

    // ==============================
    // VERIFY EMAIL
    // ==============================
    @Get('verify-email')
    @ApiOperation({
        summary: 'Email verification',
        description:
            'Verifies a user account using the token sent by email. If the token is valid and not expired, the email is marked as verified.',
    })
    @ApiQuery({
        name: 'token',
        required: true,
        description: 'Verification token sent to the user email.',
        example: '4f7b8e8a9d30c932e0b7f84a8b2c9f5d',
    })
    @ApiOkResponse({
        description: 'Email verified successfully.',
        type: VerifyEmailResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid or expired token.',
    })
    async verifyEmail(
        @Query('token') token: string,
    ): Promise<VerifyEmailResponseDto> {
        const user = await this.userService.findByVerificationToken(token);
        if (!user) throw new BadRequestException('Invalid or expired token');

        if (
            user.verificationTokenExpiresAt &&
            user.verificationTokenExpiresAt < new Date()
        ) {
            throw new BadRequestException('Token expired');
        }

        await this.userService.markEmailAsVerified(user.id);

        return {
            message: 'Email verified successfully. You can now log in.',
        };
    }
}
