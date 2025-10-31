import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService
    ) { }


    async register(firstname: string, lastname: string, email: string, password: string) {
        const existingUser = await this.userService.findByEmail(email);
        if (existingUser) {
            throw new BadRequestException('That Email is already on use.');
        }

        const verificationToken = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const hashedPassword = await argon2.hash(password);
        const user = await this.userService.create(firstname, lastname, email, hashedPassword, verificationToken, expiresAt);

        await this.emailService.sendVerificationEmail(
            user.email,
            verificationToken,
            user.firstname,
        );

        return { message: 'User Register Succesfully. Check your email to activate your account.' };
    }

    async login(email: string, password: string) {
        const existingUser = await this.userService.findByEmail(email);
        if (!existingUser) throw new UnauthorizedException('Invalid Credentials');

        if (!existingUser.isEmailVerified) throw new UnauthorizedException('You must verify your email before sign in.');

        const validPassword = await argon2.verify(existingUser.password, password);
        if (!validPassword) throw new UnauthorizedException('Invalid Credentials');

        const payload = { sub: existingUser.id, email: existingUser.email }

        const token = this.jwtService.sign(payload);

        return { access_token: token }
    }
}
