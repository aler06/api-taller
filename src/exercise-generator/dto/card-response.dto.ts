import { ApiProperty, ApiSchema } from "@nestjs/swagger";

@ApiSchema({ name: 'CardResponseDTO', description: 'Card response DTO for flip cards' })
export class CardResponseDto {
    @ApiProperty({
        description: 'Front text of the card',
        example: '¿Qué es Python?'
    })
    front: string;

    @ApiProperty({
        description: 'Back text of the card (answer/explanation)',
        example: 'Es un lenguaje de programación interpretado, de alto nivel y con tipado dinámico.'
    })
    back: string;
}
