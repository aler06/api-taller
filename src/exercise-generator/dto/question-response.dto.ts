import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  name: 'QuestionResponseDTO',
  description: 'Question response DTO',
})
export class QuestionResponseDto {
  @ApiProperty({
    description: 'The question text',
    example: 'What is the capital of France?',
    required: false,
  })
  question?: string;

  @ApiProperty({
    description: 'Sentence with blank to fill',
    example: 'The capital of France is ____.',
    required: false,
  })
  sentence?: string;

  @ApiProperty({
    description: 'Multiple choice options',
    example: ['Paris', 'London', 'Madrid', 'Berlin'],
    type: [String],
    required: false,
  })
  options?: string[];

  @ApiProperty({
    description: 'The correct answer',
    example: 'Paris',
  })
  correct_answer: string;

  @ApiProperty({
    description: 'Explanation for the correct answer',
    example: 'Paris is the capital and largest city of France.',
  })
  explanation: string;
}
