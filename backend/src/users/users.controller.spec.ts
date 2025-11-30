import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ForbiddenException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let userServiceMock: any;

  beforeEach(async () => {
    userServiceMock = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: userServiceMock }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  //GET /users
  it('should return all users', async () => {
    const fakeUsers = [{ id: '1', email: 'a@a.com' }];
    userServiceMock.findAll.mockResolvedValue(fakeUsers);

    const result = await controller.getUsers();

    expect(userServiceMock.findAll).toHaveBeenCalled();
    expect(result).toEqual(fakeUsers);
  });

  //GET /users/profile
  it('should return the current user profile', () => {
    const req = { user: { id: '1', email: 'me@mail.com' } };

    const result = controller.getProfile(req);

    expect(result).toEqual(req.user);
  });

  //GET /users/:userId
  it('should return a single user by ID', async () => {
    const fakeUser = { id: '1', email: 'a@a.com' };
    userServiceMock.findOne.mockResolvedValue(fakeUser);

    const result = await controller.getSingleUser('1');

    expect(userServiceMock.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual(fakeUser);
  });

  //PATCH /users/update
  it('should update user using req.user.id', async () => {
    const fakeUpdated = { id: '1', email: 'new@mail.com' };
    userServiceMock.update.mockResolvedValue(fakeUpdated);

    const req = { user: { id: '1' } };
    const body = { email: 'new@mail.com' };

    const result = await controller.updateUser(body, req);

    expect(userServiceMock.update).toHaveBeenCalledWith('1', body);
    expect(result).toEqual(fakeUpdated);
  });

  //DELETE /users/:userId (ADMIN)
  it('should delete a user when requester is ADMIN', async () => {
    const fakeResponse = { message: 'User deleted successfully' };
    userServiceMock.delete.mockResolvedValue(fakeResponse);

    const req = { user: { id: '999', role: 'ADMIN' } };

    const result = await controller.deleteUser('1', req);

    expect(userServiceMock.delete).toHaveBeenCalledWith('1');
    expect(result).toEqual(fakeResponse);
  });

  //DELETE /users/:userId (not ADMIN)
  it('should throw ForbiddenException when requester is not ADMIN', async () => {
    const req = { user: { id: '999', role: 'USER' } };

    await expect(controller.deleteUser('1', req)).rejects.toThrow(ForbiddenException);
  });
});
