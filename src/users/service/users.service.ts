import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../model/user.model';
import { UserRequestDTO } from '../dto/user-request.dto';
import { UserResponseDTO } from '../dto/user-response.dto';
import { UserMapper } from '../mapper';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
    ) {}

    async createUser(userRequestDTO: UserRequestDTO): Promise<UserResponseDTO> {
        try {
            // Check if user already exists
            const existingUser = await this.userModel.findOne({ email: userRequestDTO.email });
            if (existingUser) {
                throw new ConflictException('User with this email already exists');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(UserMapper.extractPassword(userRequestDTO), 10);

            // Create new user using mapper
            const userModelData = UserMapper.toUserModel(userRequestDTO);
            const newUser = new this.userModel({
                ...userModelData,
                password: hashedPassword,
            });

            const savedUser = await newUser.save();
            
            // Return user using mapper
            return UserMapper.toResponseDTO(savedUser);
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new BadRequestException('Failed to create user');
        }
    }

    async deleteUser(id: string): Promise<{ message: string }> {
        try {
            const user = await this.userModel.findByIdAndDelete(id);
            if (!user) {
                throw new NotFoundException('User not found');
            }
            return UserMapper.toSuccessResponse('User deleted successfully');
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to delete user');
        }
    }

    async update(id: string, userRequestDTO: Partial<UserRequestDTO>): Promise<UserResponseDTO> {
        try {
            const updateData = UserMapper.toUserModelForUpdate(userRequestDTO);

            // Hash password if provided
            if (UserMapper.hasPassword(userRequestDTO)) {
                const password = UserMapper.extractPasswordForUpdate(userRequestDTO);
                if (password) {
                    updateData.password = await bcrypt.hash(password, 10);
                }
            }

            const updatedUser = await this.userModel.findByIdAndUpdate(
                id, updateData,
                { new: true, runValidators: true }
            );

            if (!updatedUser) {
                throw new NotFoundException('User not found');
            }

            // Return user using mapper
            return UserMapper.toResponseDTO(updatedUser);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to update user');
        }
    }

    async getAll(): Promise<UserResponseDTO[]> {
        try {
            const users = await this.userModel.find().select('-password');
            return UserMapper.toResponseDTOArray(users);
        } catch (error) {
            throw new BadRequestException('Failed to retrieve users');
        }
    }

    async find(searchTerm: string): Promise<UserResponseDTO[]> {
        try {
            const users = await this.userModel.find({
                $or: [
                    { firstName: { $regex: searchTerm, $options: 'i' } },
                    { lastName: { $regex: searchTerm, $options: 'i' } },
                    { email: { $regex: searchTerm, $options: 'i' } },
                    { role: { $regex: searchTerm, $options: 'i' } }
                ]
            }).select('-password');
            
            return UserMapper.toResponseDTOArray(users);
        } catch (error) {
            throw new BadRequestException('Failed to search users');
        }
    }

    async getById(id: string): Promise<UserResponseDTO> {
        try {
            const user = await this.userModel.findById(id).select('-password');
            if (!user) {
                throw new NotFoundException('User not found');
            }
            return UserMapper.toResponseDTO(user);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to retrieve user');
        }
    }

    async getPageable(page: number = 1, limit: number = 10): Promise<{
        users: UserResponseDTO[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        try {
            const skip = (page - 1) * limit;
            
            const [users, total] = await Promise.all([
                this.userModel.find().select('-password').skip(skip).limit(limit),
                this.userModel.countDocuments()
            ]);

            const totalPages = Math.ceil(total / limit);
            const userResponseDTOs = UserMapper.toResponseDTOArray(users);

            return UserMapper.toPaginationResponse(userResponseDTOs, total, page, totalPages);
        } catch (error) {
            throw new BadRequestException('Failed to retrieve paginated users');
        }
    }

    async activateUser(id: string): Promise<UserResponseDTO> {
        try {
            const user = await this.userModel.findByIdAndUpdate(
                id,
                { isActive: true },
                { new: true, runValidators: true }
            );

            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Return user using mapper
            return UserMapper.toResponseDTO(user);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to activate user');
        }
    }
}
