import { User } from '../model/user.model';
import { UserResponseDTO } from '../dto/user-response.dto';
import { UserRequestDTO } from '../dto/user-request.dto';
import { Document } from 'mongoose';

export class UserMapper {
  /**
   * Maps a Mongoose User document to UserResponseDTO
   * @param user - Mongoose User document
   * @returns UserResponseDTO without password
   */
  static toResponseDTO(user: Document & User): UserResponseDTO {
    const userObj = user.toObject();
    return {
      _id: (user._id as any).toString(),
      firstName: userObj.firstName,
      lastName: userObj.lastName,
      email: userObj.email,
      role: userObj.role,
      isActive: userObj.isActive,
      createdAt: userObj.createdAt || new Date(),
      updatedAt: userObj.updatedAt || new Date(),
    };
  }

  /**
   * Maps an array of Mongoose User documents to UserResponseDTO array
   * @param users - Array of Mongoose User documents
   * @returns Array of UserResponseDTO without passwords
   */
  static toResponseDTOArray(users: (Document & User)[]): UserResponseDTO[] {
    return users.map((user) => this.toResponseDTO(user));
  }

  /**
   * Maps UserRequestDTO to User model data (excluding password)
   * @param userRequestDTO - User request data
   * @returns User model data without password
   */
  static toUserModel(userRequestDTO: UserRequestDTO): Partial<User> {
    return {
      firstName: userRequestDTO.firstName,
      lastName: userRequestDTO.lastName,
      email: userRequestDTO.email,
      role: userRequestDTO.role as any,
      isActive: false, // Default to inactive
    };
  }

  /**
   * Maps UserRequestDTO to User model data for updates (excluding password)
   * @param userRequestDTO - User request data
   * @returns User model data for updates without password
   */
  static toUserModelForUpdate(
    userRequestDTO: Partial<UserRequestDTO>,
  ): Partial<User> {
    const updateData: Partial<User> = {};

    if (userRequestDTO.firstName) {
      updateData.firstName = userRequestDTO.firstName;
    }
    if (userRequestDTO.lastName) {
      updateData.lastName = userRequestDTO.lastName;
    }
    if (userRequestDTO.email) {
      updateData.email = userRequestDTO.email;
    }
    if (userRequestDTO.role) {
      updateData.role = userRequestDTO.role as any;
    }

    return updateData;
  }

  /**
   * Extracts password from UserRequestDTO
   * @param userRequestDTO - User request data
   * @returns Password string
   */
  static extractPassword(userRequestDTO: UserRequestDTO): string {
    return userRequestDTO.password;
  }

  /**
   * Checks if password is provided in update data
   * @param userRequestDTO - User request data
   * @returns Boolean indicating if password is provided
   */
  static hasPassword(userRequestDTO: Partial<UserRequestDTO>): boolean {
    return !!userRequestDTO.password;
  }

  /**
   * Extracts password from partial UserRequestDTO for updates
   * @param userRequestDTO - User request data
   * @returns Password string or undefined
   */
  static extractPasswordForUpdate(
    userRequestDTO: Partial<UserRequestDTO>,
  ): string | undefined {
    return userRequestDTO.password;
  }

  /**
   * Creates pagination response structure
   * @param users - Array of UserResponseDTO
   * @param total - Total number of users
   * @param page - Current page number
   * @param totalPages - Total number of pages
   * @returns Pagination response object
   */
  static toPaginationResponse(
    users: UserResponseDTO[],
    total: number,
    page: number,
    totalPages: number,
  ): {
    users: UserResponseDTO[];
    total: number;
    page: number;
    totalPages: number;
  } {
    return {
      users,
      total,
      page,
      totalPages,
    };
  }

  /**
   * Creates success message response
   * @param message - Success message
   * @returns Success response object
   */
  static toSuccessResponse(message: string): { message: string } {
    return { message };
  }
}
