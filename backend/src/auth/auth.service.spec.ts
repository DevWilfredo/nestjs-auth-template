import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import * as argon2 from 'argon2';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';

jest.mock('argon2');
jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: any;
  let jwtServiceMock: any;
  let emailServiceMock: any;

  beforeEach(async () => {
    usersServiceMock = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    jwtServiceMock = {
      sign: jest.fn(),
    };

    emailServiceMock = {
      sendVerificationEmail: jest.fn(),
    };

    (randomBytes as jest.Mock).mockReturnValue(Buffer.from('fake-token'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: EmailService, useValue: emailServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  //Successfully register
  it('should register a new user successfully', async () => {
    usersServiceMock.findByEmail.mockResolvedValue(null);
    (argon2.hash as jest.Mock).mockResolvedValue('hashed-pass');
    usersServiceMock.create.mockResolvedValue({
      id: '1',
      email: 'test@mail.com',
      firstname: 'John',
    });

    const result = await service.register('John', 'Doe', 'test@mail.com', '1234');

    expect(usersServiceMock.findByEmail).toHaveBeenCalledWith('test@mail.com');
    expect(usersServiceMock.create).toHaveBeenCalledWith(
      'John',
      'Doe',
      'test@mail.com',
      'hashed-pass',
      expect.any(String),
      expect.any(Date),
    );
    expect(emailServiceMock.sendVerificationEmail).toHaveBeenCalled();
    expect(result).toEqual({
      message: 'User Register Succesfully. Check your email to activate your account.',
    });
  });

  // Email Already in Use
  it('should throw BadRequestException if email already exists', async () => {
    usersServiceMock.findByEmail.mockResolvedValue({ id: '1' });

    await expect(
      service.register('John', 'Doe', 'existing@mail.com', '1234'),
    ).rejects.toThrow(BadRequestException);
  });

  // Succesfully login
  it('should login successfully and return token', async () => {
    usersServiceMock.findByEmail.mockResolvedValue({
      id: '1',
      email: 'user@mail.com',
      password: 'hashed',
      isEmailVerified: true,
    });

    (argon2.verify as jest.Mock).mockResolvedValue(true);
    jwtServiceMock.sign.mockReturnValue('jwt-token');

    const result = await service.login('user@mail.com', 'password');

    expect(usersServiceMock.findByEmail).toHaveBeenCalledWith('user@mail.com');
    expect(argon2.verify).toHaveBeenCalledWith('hashed', 'password');
    expect(jwtServiceMock.sign).toHaveBeenCalledWith({
      sub: '1',
      email: 'user@mail.com',
    });
    expect(result).toEqual({ access_token: 'jwt-token' });
  });

  //User Does not Exists
  it('should throw UnauthorizedException if user not found', async () => {
    usersServiceMock.findByEmail.mockResolvedValue(null);

    await expect(service.login('unknown@mail.com', '1234')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  //Not Verified User
  it('should throw UnauthorizedException if email not verified', async () => {
    usersServiceMock.findByEmail.mockResolvedValue({
      email: 'user@mail.com',
      isEmailVerified: false,
    });

    await expect(service.login('user@mail.com', '1234')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  //Incorrect Password
  it('should throw UnauthorizedException if password is invalid', async () => {
    usersServiceMock.findByEmail.mockResolvedValue({
      id: '1',
      email: 'user@mail.com',
      password: 'hashed',
      isEmailVerified: true,
    });

    (argon2.verify as jest.Mock).mockResolvedValue(false);

    await expect(service.login('user@mail.com', 'wrong')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
