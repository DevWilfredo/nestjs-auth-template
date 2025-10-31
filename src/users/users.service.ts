import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from './dtos/user-update.dto';

@Injectable()
export class UsersService {
    constructor(private prismaService: PrismaService) { }

    async findAll() {
        return await this.prismaService.user.findMany();
    }

    async findOne(id: string) {
        return await this.prismaService.user.findFirst({ where: { id } });
    }

    async findByEmail(email: string) {
        return await this.prismaService.user.findFirst({ where: { email } });
    }

    async create(firstname: string, lastname: string, email: string, password: string, verificationToken: string, verificationTokenExpiresAt: Date) {
        return await this.prismaService.user.create({ data: { firstname, lastname, email, password, verificationToken, verificationTokenExpiresAt } });
    }

    async findByVerificationToken(token: string) {
        return await this.prismaService.user.findFirst({ where: { verificationToken: token } });
    }

    async markEmailAsVerified(userId: string) {
        return await this.prismaService.user.update({
            where: { id: userId },
            data: { isEmailVerified: true, verificationToken: null, verificationTokenExpiresAt: null },
        });
    }

    async update(userId: string, updateData: UpdateUserDto) {
        try {
            return await this.prismaService.user.update({
                where: { id: userId },
                data: updateData,
            });
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === 'P2025') {
                    throw new NotFoundException('User not Found.');
                }
                if (e.code === 'P2002') {
                    throw new ConflictException('Email already in use.');
                }
            }
            throw e;
        }
    }

    async delete(userId: string) {
        try {
            await this.prismaService.user.delete({ where: { id: userId } });
            return { message: 'User deleted successfully' };
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
                throw new NotFoundException('User not Found.');
            }
            throw e;
        }
    }

}
