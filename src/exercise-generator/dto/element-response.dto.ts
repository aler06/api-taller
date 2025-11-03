import { ApiProperty } from '@nestjs/swagger';

export class ElementResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the element',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Text content of the element to be ordered',
    example: 'Importar librerías necesarias',
  })
  texto: string;
}
