import { IsString, IsNotEmpty, IsMongoId, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiSchema } from '@nestjs/swagger';
import { SessionStatus } from '../model/session.model';

@ApiSchema({
  name: 'SessionControlRequestDTO',
  description: 'Session control request DTO',
})
export class SessionControlRequestDTO {
  @ApiProperty({
    description: 'ID of the session to control',
    example: '507f1f77bcf86cd799439014',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Session ID is required' })
  @IsMongoId({ message: 'Session ID must be a valid MongoDB ObjectId' })
  sessionId: string;

  @ApiProperty({
    description: 'ID of the teacher controlling the session',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Teacher ID is required' })
  @IsMongoId({ message: 'Teacher ID must be a valid MongoDB ObjectId' })
  teacherId: string;

  @ApiProperty({
    description: 'Action to perform on the session',
    example: 'active',
    enum: SessionStatus,
  })
  @IsEnum(SessionStatus, {
    message: 'Status must be one of: waiting, active, finished, cancelled',
  })
  @IsNotEmpty({ message: 'Status is required' })
  status: SessionStatus;
}
