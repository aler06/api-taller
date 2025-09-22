import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Delete, 
    Body, 
    Param, 
    Query, 
    HttpStatus,
    HttpCode,
    ParseIntPipe,
    DefaultValuePipe
} from '@nestjs/common';
import { 
    ApiTags, 
    ApiOperation, 
    ApiResponse, 
    ApiParam, 
    ApiQuery,
    ApiBody,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiNotFoundResponse,
    ApiConflictResponse,
    ApiBadRequestResponse
} from '@nestjs/swagger';
import { UsersService } from '../service/users.service';
import { UserRequestDTO } from '../dto/user-request.dto';
import { UserResponseDTO } from '../dto/user-response.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ 
        summary: 'Create a new user',
        description: 'Creates a new user account with the provided information. The user will be created in inactive state by default.'
    })
    @ApiBody({ 
        type: UserRequestDTO,
        description: 'User data to create a new account'
    })
    @ApiCreatedResponse({ 
        type: UserResponseDTO,
        description: 'User created successfully'
    })
    @ApiConflictResponse({ 
        description: 'User with this email already exists'
    })
    @ApiBadRequestResponse({ 
        description: 'Invalid user data provided'
    })
    async createUser(@Body() userRequestDTO: UserRequestDTO): Promise<UserResponseDTO> {
        return this.usersService.createUser(userRequestDTO);
    }

    @Get()
    @ApiOperation({ 
        summary: 'Get all users',
        description: 'Retrieves a list of all users in the system. Passwords are excluded from the response.'
    })
    @ApiOkResponse({ 
        type: [UserResponseDTO],
        description: 'List of all users retrieved successfully'
    })
    @ApiBadRequestResponse({ 
        description: 'Failed to retrieve users'
    })
    async getAllUsers(): Promise<UserResponseDTO[]> {
        return this.usersService.getAll();
    }

    @Get('search')
    @ApiOperation({ 
        summary: 'Search users',
        description: 'Searches users by first name, last name, email, or role. Search is case-insensitive.'
    })
    @ApiQuery({ 
        name: 'q', 
        description: 'Search term to look for in user data',
        example: 'john'
    })
    @ApiOkResponse({ 
        type: [UserResponseDTO],
        description: 'Search results retrieved successfully'
    })
    @ApiBadRequestResponse({ 
        description: 'Failed to search users'
    })
    async searchUsers(@Query('q') searchTerm: string): Promise<UserResponseDTO[]> {
        return this.usersService.find(searchTerm);
    }

    @Get('paginated')
    @ApiOperation({ 
        summary: 'Get paginated users',
        description: 'Retrieves users with pagination support. Returns users with total count and pagination metadata.'
    })
    @ApiQuery({ 
        name: 'page', 
        description: 'Page number (starts from 1)',
        example: 1,
        required: false,
        type: Number
    })
    @ApiQuery({ 
        name: 'limit', 
        description: 'Number of users per page',
        example: 10,
        required: false,
        type: Number
    })
    @ApiOkResponse({ 
        description: 'Paginated users retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                users: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/UserResponseDTO' }
                },
                total: { type: 'number', description: 'Total number of users' },
                page: { type: 'number', description: 'Current page number' },
                totalPages: { type: 'number', description: 'Total number of pages' }
            }
        }
    })
    @ApiBadRequestResponse({ 
        description: 'Failed to retrieve paginated users'
    })
    async getPaginatedUsers(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
    ) {
        return this.usersService.getPageable(page, limit);
    }

    @Get(':id')
    @ApiOperation({ 
        summary: 'Get user by ID',
        description: 'Retrieves a specific user by their unique identifier.'
    })
    @ApiParam({ 
        name: 'id', 
        description: 'User ID',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiOkResponse({ 
        type: UserResponseDTO,
        description: 'User retrieved successfully'
    })
    @ApiNotFoundResponse({ 
        description: 'User not found'
    })
    @ApiBadRequestResponse({ 
        description: 'Failed to retrieve user'
    })
    async getUserById(@Param('id') id: string): Promise<UserResponseDTO> {
        return this.usersService.getById(id);
    }

    @Put(':id')
    @ApiOperation({ 
        summary: 'Update user',
        description: 'Updates an existing user with the provided information. Only provided fields will be updated.'
    })
    @ApiParam({ 
        name: 'id', 
        description: 'User ID to update',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiBody({ 
        type: UserRequestDTO,
        description: 'Updated user data (all fields are optional)'
    })
    @ApiOkResponse({ 
        type: UserResponseDTO,
        description: 'User updated successfully'
    })
    @ApiNotFoundResponse({ 
        description: 'User not found'
    })
    @ApiBadRequestResponse({ 
        description: 'Invalid user data provided'
    })
    async updateUser(
        @Param('id') id: string, 
        @Body() userRequestDTO: Partial<UserRequestDTO>
    ): Promise<UserResponseDTO> {
        return this.usersService.update(id, userRequestDTO);
    }

    @Put(':id/activate')
    @ApiOperation({ 
        summary: 'Activate user',
        description: 'Activates a user account by setting isActive to true.'
    })
    @ApiParam({ 
        name: 'id', 
        description: 'User ID to activate',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiOkResponse({ 
        type: UserResponseDTO,
        description: 'User activated successfully'
    })
    @ApiNotFoundResponse({ 
        description: 'User not found'
    })
    @ApiBadRequestResponse({ 
        description: 'Failed to activate user'
    })
    async activateUser(@Param('id') id: string): Promise<UserResponseDTO> {
        return this.usersService.activateUser(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
        summary: 'Delete user',
        description: 'Permanently deletes a user from the system.'
    })
    @ApiParam({ 
        name: 'id', 
        description: 'User ID to delete',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiOkResponse({ 
        description: 'User deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'User deleted successfully' }
            }
        }
    })
    @ApiNotFoundResponse({ 
        description: 'User not found'
    })
    @ApiBadRequestResponse({ 
        description: 'Failed to delete user'
    })
    async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
        return this.usersService.deleteUser(id);
    }
}
