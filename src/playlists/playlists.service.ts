import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Playlist } from './playlist.entity';
import { Repository } from 'typeorm';
import { Song } from 'src/songs/song.entity';
import { User } from 'src/user/user.entity';
import { CreatePlayListDTO } from 'src/songs/dto/create-playlist.dto';

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectRepository(Playlist)
    private readonly playListRepository: Repository<Playlist>,
    @InjectRepository(Song)
    private readonly songRepository: Repository<Song>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(playListDTO: CreatePlayListDTO): Promise<Playlist> {
    const playList = new Playlist();
    playList.name = playListDTO.name;

    const songs = await this.songRepository.findByIds(playListDTO.songs);
    playList.songs = songs;

    const user = await this.userRepository.findOneBy({ id: playListDTO.user });

    if (!user) {
      throw new NotFoundException(
        `User with ID: ${playListDTO.user} not found.`,
      );
    }
    playList.user = user;

    return this.playListRepository.save(playList);
  }
}
