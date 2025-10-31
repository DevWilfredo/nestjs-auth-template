import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Req,
    UseGuards,
    ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dtos/user-update.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) { }

    // ===============================
    // GET /users
    // ===============================
    @Get('/')
    @ApiOperation({
        summary: 'Get all users',
        description: 'Returns a list of all registered users.',
    })
    @ApiResponse({
        status: 200,
        description: 'List of users retrieved successfully.',
    })
    async getUsers() {
        return this.userService.findAll();
    }

    // ===============================
    // GET /users/profile
    // ===============================
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiOperation({
        summary: 'Get authenticated user profile',
        description: 'Returns the profile of the currently authenticated user (based on the provided JWT).',
    })
    @ApiBearerAuth()
    @ApiResponse({
        status: 200,
        description: 'Authenticated user profile returned.',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized. Invalid or missing token.',
    })
    getProfile(@Req() req) {
        return req.user;
    }

    // ===============================
    // GET /users/:userId
    // ===============================
    @Get('/:userId')
    @ApiOperation({
        summary: 'Get user by id',
        description: 'Return a single user by their unique id.',
    })
    @ApiResponse({
        status: 200,
        description: 'User retrieved successfully.',
    })
    @ApiNotFoundResponse({
        description: 'User not found.',
    })
    getSingleUser(@Param('userId') userId: string) {
        return this.userService.findOne(userId);
    }

    // ===============================
    // PATCH /users/update
    // ===============================
    @UseGuards(JwtAuthGuard)
    @Patch('/update')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update authenticated user' })
    @ApiResponse({ status: 200, description: 'User updated successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid request data.' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized. Invalid or missing token.' })
    @ApiForbiddenResponse({ description: 'Forbidden. You are not allowed to update another user.' })
    updateUser(@Body() body: UpdateUserDto, @Req() req) {
        return this.userService.update(req.user.id, body);
    }

    // ===============================
    // DELETE /users/:userId
    // ===============================
    @UseGuards(JwtAuthGuard)
    @Delete('/:userId')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Delete a user (Admin only)',
        description: 'Deletes the specified user. Only users with ADMIN role are allowed to delete users.',
    })
    @ApiResponse({ status: 200, description: 'User deleted successfully.' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized. Invalid or missing token.' })
    @ApiForbiddenResponse({ description: 'Forbidden. Only ADMIN users can delete users.' })
    @ApiNotFoundResponse({ description: 'User not found.' })
    async deleteUser(@Param('userId') userId: string, @Req() req) {
        const requester = req.user;
        if (!requester || requester.role !== 'ADMIN') {
            throw new ForbiddenException('Only ADMIN users can delete accounts.');
        }

        return this.userService.delete(userId);
    }
}
