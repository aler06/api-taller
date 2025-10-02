import { ApiProperty, ApiSchema } from "@nestjs/swagger";

@ApiSchema({ name: 'TrueFalseResponseDTO', description: 'True/False question response DTO' })
export class TrueFalseResponseDto {
    @ApiProperty({
        description: 'Statement to evaluate as true or false',
        example: 'Python is a compiled programming language'
    })
    statement: string;

    @ApiProperty({
        description: 'Whether the statement is true or false',
        example: false
    })
    correct_answer: boolean;

    @ApiProperty({
        description: 'Explanation for why the statement is true or false',
        example: 'Python is actually an interpreted programming language, not compiled'
    })
    explanation: string;
}
