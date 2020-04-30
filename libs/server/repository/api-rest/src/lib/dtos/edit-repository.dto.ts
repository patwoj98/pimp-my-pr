import { ApiProperty } from '@nestjs/swagger';

export class EditRepositoryDto {
  @ApiProperty()
  maxLines?: number;

  @ApiProperty()
  maxWaitingTime?: number;
}
