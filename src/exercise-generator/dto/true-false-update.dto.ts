import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TrueFalseUpdateDto {
  @ApiProperty({
    description: 'Statement to evaluate as true or false',
    example: 'Python is a compiled programming language'
  })
  @IsString()
  @IsNotEmpty()
  statement: string;

  @ApiProperty({
    description: 'Whether the statement is true or false',
    example: false
  })
  @IsBoolean()
  correct_answer: boolean;

  @ApiProperty({
    description: 'Explanation for why the statement is true or false',
    example: 'Python is actually an interpreted programming language, not compiled'
  })
  @IsString()
  @IsNotEmpty()
  explanation: string;
}
