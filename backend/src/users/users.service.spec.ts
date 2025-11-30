import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      user: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all users', async () => {
    const fakeUsers = [{ id: '1', email: 'a@a.com' }];
    prismaMock.user.findMany.mockResolvedValue(fakeUsers);

    const result = await service.findAll();

    expect(prismaMock.user.findMany).toHaveBeenCalled();
    expect(result).toEqual(fakeUsers);
  });

  //findOne Method
  it('should return a user by ID', async () => {
    const fakeUser = { id: '1', email: 'a@a.com' };
    prismaMock.user.findFirst.mockResolvedValue(fakeUser);

    const result = await service.findOne('1');

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result).toEqual(fakeUser);
  });

  // ✅ findByEmail
  it('should return a user by email', async () => {
    const fakeUser = { id: '1', email: 'a@a.com' };
    prismaMock.user.findFirst.mockResolvedValue(fakeUser);

    const result = await service.findByEmail('a@a.com');

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({ where: { email: 'a@a.com' } });
    expect(result).toEqual(fakeUser);
  });

  //create
  it('should create a new user', async () => {
    const newUser = {
      id: '1',
      firstname: 'John',
      lastname: 'Doe',
      email: 'john@mail.com',
      password: '1234',
      verificationToken: 'token',
      verificationTokenExpiresAt: new Date(),
    };

    prismaMock.user.create.mockResolvedValue(newUser);

    const result = await service.create(
      newUser.firstname,
      newUser.lastname,
      newUser.email,
      newUser.password,
      newUser.verificationToken,
      newUser.verificationTokenExpiresAt,
    );

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        password: newUser.password,
        verificationToken: newUser.verificationToken,
        verificationTokenExpiresAt: newUser.verificationTokenExpiresAt,
      },
    });
    expect(result).toEqual(newUser);
  });

  //findByVerificationToken
  it('should find a user by verification token', async () => {
    const fakeUser = { id: '1', verificationToken: 'abc' };
    prismaMock.user.findFirst.mockResolvedValue(fakeUser);

    const result = await service.findByVerificationToken('abc');

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { verificationToken: 'abc' },
    });
    expect(result).toEqual(fakeUser);
  });

  //markEmailAsVerified
  it('should mark email as verified', async () => {
    const fakeUser = { id: '1', isEmailVerified: true };
    prismaMock.user.update.mockResolvedValue(fakeUser);

    const result = await service.markEmailAsVerified('1');

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: {
        isEmailVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
    });
    expect(result).toEqual(fakeUser);
  });

  //update
  it('should update user and return updated data', async () => {
    const updatedUser = { id: '1', email: 'new@gmail.com' };
    prismaMock.user.update.mockResolvedValue(updatedUser);

    const result = await service.update('1', { email: 'new@gmail.com' });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { email: 'new@gmail.com' },
    });
    expect(result).toEqual(updatedUser);
  });

  //update (P2025)
  it('should throw NotFoundException when user not found during update', async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('msg', {
      code: 'P2025',
      clientVersion: '4.0.0',
    });

    prismaMock.user.update.mockRejectedValue(prismaError);

    await expect(service.update('1', { email: 'x@mail.com' })).rejects.toThrow(NotFoundException);
  });

  //update (P2002)
  it('should throw ConflictException when email already exists', async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('msg', {
      code: 'P2002',
      clientVersion: '4.0.0',
    });

    prismaMock.user.update.mockRejectedValue(prismaError);

    await expect(service.update('1', { email: 'duplicate@mail.com' })).rejects.toThrow(ConflictException);
  });

  //update general Error
  it('should rethrow unknown errors during update', async () => {
    const genericError = new Error('Database down');
    prismaMock.user.update.mockRejectedValue(genericError);

    await expect(service.update('1', { email: 'fail@mail.com' })).rejects.toThrow('Database down');
  });

  //delete
  it('should delete user and return message', async () => {
    prismaMock.user.delete.mockResolvedValue({ id: '1' });

    const result = await service.delete('1');

    expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result).toEqual({ message: 'User deleted successfully' });
  });

  //delete (P2025)
  it('should throw NotFoundException when user not found during delete', async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('msg', {
      code: 'P2025',
      clientVersion: '4.0.0',
    });

    prismaMock.user.delete.mockRejectedValue(prismaError);

    await expect(service.delete('1')).rejects.toThrow(NotFoundException);
  });
});
