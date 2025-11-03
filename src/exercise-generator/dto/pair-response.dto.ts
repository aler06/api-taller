import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  name: 'PairResponseDTO',
  description: 'Pair response DTO for matching game',
})
export class PairResponseDto {
  @ApiProperty({
    description: 'Term or concept to be matched',
    example: 'Variable',
  })
  term: string;

  @ApiProperty({
    description: 'Definition or match for the term',
    example: 'Espacio en memoria que almacena un valor',
  })
  match: string;
}
