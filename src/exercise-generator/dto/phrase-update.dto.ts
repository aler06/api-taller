import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PhraseUpdateDto {
  @ApiProperty({
    description: 'Text content of the phrase for the roulette',
    example: 'Python es un lenguaje de tipado dinámico.'
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}
