import { Injectable } from '@nestjs/common';
import { CreateSongDTO } from './dto/create-song-dto';

@Injectable()
export class SongsService {
  private readonly songs: CreateSongDTO[] = [];

  getAllSongs(): CreateSongDTO[] {
    return this.songs;
  }

  getSongById(id: number): string {
    return `Get song with id ${id}`;
  }

  createSong(song: CreateSongDTO) {
    return song;
  }

  updateSong(id: number, song: CreateSongDTO) {
    return `Update song with id ${id}: song: ${JSON.stringify(song)}`;
  }

  deleteSong(id: number) {
    return `Delete song with id ${id}`;
  }
}
