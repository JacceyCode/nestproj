import { CreateSongDTO } from './create-song-dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateSongDTO extends PartialType(CreateSongDTO) {}
