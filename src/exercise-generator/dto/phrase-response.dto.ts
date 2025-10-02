import { ApiProperty, ApiSchema } from "@nestjs/swagger";

@ApiSchema({ name: 'PhraseResponseDTO', description: 'Phrase response DTO for roulette game' })
export class PhraseResponseDto {
    @ApiProperty({
        description: 'Text content of the phrase for the roulette',
        example: 'Python es un lenguaje de tipado dinámico.'
    })
    text: string;
}
