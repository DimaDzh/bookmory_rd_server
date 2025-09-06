import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole } from '../../generated/prisma';

interface UserPayload {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a new user account' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation errors',
  })
  @ApiResponse({
    status: 409,
    description: 'User with email or username already exists',
  })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Get all users (Admin/Moderator only)' })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    type: [UserResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or Moderator access required',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth('JWT-auth')
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('me')
  async getProfile(@GetUser() user: UserPayload) {
    return this.usersService.findById(user.id);
  }

  @ApiOperation({ summary: 'Get user by ID (Admin/Moderator only)' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or Moderator access required',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth('JWT-auth')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Patch('me')
  async updateProfile(
    @GetUser() user: UserPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @ApiOperation({ summary: 'Update user by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User updated',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User deleted',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
