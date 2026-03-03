import { Injectable } from '@nestjs/common';
import { CreateSongDTO } from './dto/create-song-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Song } from './song.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UpdateSongDTO } from './dto/update-song-dto';

@Injectable()
export class SongsService {
  constructor(
    @InjectRepository(Song)
    private readonly songRepository: Repository<Song>,
  ) {}

  getAllSongs(): Promise<Song[]> {
    return this.songRepository.find();
  }

  getSongById(id: number): Promise<Song | null> {
    return this.songRepository.findOneBy({ id });
  }

  createSong(songDTO: CreateSongDTO): Promise<Song> {
    const song = new Song();
    song.title = songDTO.title;
    song.artists = songDTO.artists;
    song.releaseDate = songDTO.releaseDate;
    song.duration = songDTO.duration;
    song.lyrics = songDTO.lyrics;

    return this.songRepository.save(song);
  }

  updateSong(id: number, songDTO: UpdateSongDTO): Promise<UpdateResult> {
    return this.songRepository.update(id, songDTO);
  }

  deleteSong(id: number): Promise<DeleteResult> {
    return this.songRepository.delete(id);
  }
}
