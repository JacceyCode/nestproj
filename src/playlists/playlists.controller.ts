import { Body, Controller, Post } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlayListDTO } from 'src/songs/dto/create-playlist-dto';
import { Playlist } from './playlist.entity';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  create(@Body() playlistDTO: CreatePlayListDTO): Promise<Playlist> {
    return this.playlistsService.create(playlistDTO);
  }
}
