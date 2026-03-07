import { Injectable } from '@nestjs/common';
import { CreateSongDTO } from './dto/create-song-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Song } from './song.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UpdateSongDTO } from './dto/update-song-dto';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Artist } from 'src/artist/artist.entity';

@Injectable()
export class SongsService {
  constructor(
    @InjectRepository(Song)
    private readonly songRepository: Repository<Song>,
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
  ) {}

  getAllSongs(): Promise<Song[]> {
    return this.songRepository.find();
  }

  getSongById(id: number): Promise<Song | null> {
    return this.songRepository.findOneBy({ id });
  }

  async createSong(songDTO: CreateSongDTO): Promise<Song> {
    const song = new Song();
    song.title = songDTO.title;
    song.releaseDate = songDTO.releaseDate;
    song.duration = songDTO.duration;
    song.lyrics = songDTO.lyrics;

    // FInd all the artists
    const artists = await this.artistRepository.findByIds(songDTO.artists);
    song.artists = artists;

    return this.songRepository.save(song);
  }

  updateSong(id: number, songDTO: UpdateSongDTO): Promise<UpdateResult> {
    return this.songRepository.update(id, songDTO);
  }

  deleteSong(id: number): Promise<DeleteResult> {
    return this.songRepository.delete(id);
  }

  async paginate(options: IPaginationOptions): Promise<Pagination<Song>> {
    const queryBuilder = this.songRepository.createQueryBuilder('song');
    queryBuilder.orderBy('song.releaseDate', 'DESC'); // Order by release date in descending order

    return paginate<Song>(queryBuilder, options);
  }
}
