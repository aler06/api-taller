import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExerciseByIdRequestDTO {
  @ApiProperty({
    description: 'ID of the exercise to retrieve/delete',
    example: '507f1f77bcf86cd799439014',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Exercise ID is required' })
  @IsMongoId({ message: 'Exercise ID must be a valid MongoDB ObjectId' })
  exerciseId: string;

  @ApiProperty({
    description: 'ID of the user requesting the exercise',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'User ID is required' })
  @IsMongoId({ message: 'User ID must be a valid MongoDB ObjectId' })
  userId: string;
}
