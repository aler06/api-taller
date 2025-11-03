import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PairUpdateDto {
  @ApiProperty({
    description: 'Term or concept to be matched',
    example: 'Variable',
  })
  @IsString()
  @IsNotEmpty()
  term: string;

  @ApiProperty({
    description: 'Definition or match for the term',
    example: 'Espacio en memoria que almacena un valor',
  })
  @IsString()
  @IsNotEmpty()
  match: string;
}
