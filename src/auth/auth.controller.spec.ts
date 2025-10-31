import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: any;
  let usersServiceMock: any;

  beforeEach(async () => {
    authServiceMock = {
      register: jest.fn(),
      login: jest.fn(),
    };

    usersServiceMock = {
      findByVerificationToken: jest.fn(),
      markEmailAsVerified: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => jest.clearAllMocks());

  // Controller should be defined
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Successful register
  it('should call AuthService.register with correct data', async () => {
    const body = {
      firstname: 'John',
      lastname: 'Doe',
      email: 'john@mail.com',
      password: '1234',
    };

    const expectedResponse = {
      message: 'User Register Succesfully. Check your email to activate your account.',
    };

    authServiceMock.register.mockResolvedValue(expectedResponse);

    const result = await controller.register(body);

    expect(authServiceMock.register).toHaveBeenCalledWith(
      'John',
      'Doe',
      'john@mail.com',
      '1234',
    );
    expect(result).toEqual(expectedResponse);
  });

  // Successful login
  it('should call AuthService.login and return token', async () => {
    const body = { email: 'test@mail.com', password: '1234' };
    const expectedResponse = { access_token: 'jwt-token' };

    authServiceMock.login.mockResolvedValue(expectedResponse);

    const result = await controller.login(body);

    expect(authServiceMock.login).toHaveBeenCalledWith('test@mail.com', '1234');
    expect(result).toEqual(expectedResponse);
  });

  // Successful email verification
  it('should verify email successfully', async () => {
    const fakeUser = {
      id: '1',
      verificationToken: 'token123',
      verificationTokenExpiresAt: new Date(Date.now() + 10000),
    };

    usersServiceMock.findByVerificationToken.mockResolvedValue(fakeUser);
    usersServiceMock.markEmailAsVerified.mockResolvedValue({
      ...fakeUser,
      isEmailVerified: true,
    });

    const result = await controller.verifyEmail('token123');

    expect(usersServiceMock.findByVerificationToken).toHaveBeenCalledWith('token123');
    expect(usersServiceMock.markEmailAsVerified).toHaveBeenCalledWith('1');
    expect(result).toEqual({
      message: 'Email verified successfully. You can now log in.',
    });
  });

  // Invalid token
  it('should throw BadRequestException if token not found', async () => {
    usersServiceMock.findByVerificationToken.mockResolvedValue(null);

    await expect(controller.verifyEmail('invalid')).rejects.toThrow(BadRequestException);
  });

  // Expired token
  it('should throw BadRequestException if token expired', async () => {
    const expiredUser = {
      id: '1',
      verificationToken: 'token123',
      verificationTokenExpiresAt: new Date(Date.now() - 10000),
    };

    usersServiceMock.findByVerificationToken.mockResolvedValue(expiredUser);

    await expect(controller.verifyEmail('token123')).rejects.toThrow(BadRequestException);
  });
});
