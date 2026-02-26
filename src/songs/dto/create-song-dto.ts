import {
  IsArray,
  IsDateString,
  IsMilitaryTime,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateSongDTO {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString({ each: true })
  @IsNotEmpty()
  @IsArray()
  readonly artist: string[];

  @IsNotEmpty()
  @IsDateString()
  readonly releaseDate: Date;

  @IsMilitaryTime()
  @IsNotEmpty()
  readonly duration: Date;
}
