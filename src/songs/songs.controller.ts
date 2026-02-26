import {
  Body,
  ConsoleLogger,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { SongsService } from './songs.service';
import { CreateSongDTO } from './dto/create-song-dto';
import { type Connection } from 'src/common/constants/connection';

@Controller('songs')
export class SongsController {
  private readonly logger = new ConsoleLogger(SongsController.name, {
    timestamp: true,
  });

  constructor(
    private readonly songsService: SongsService,
    @Inject('CONNECTION')
    private readonly connection: Connection,
  ) {
    console.log('Database Connection Info:', this.connection);
  }

  @Get()
  getSongs() {
    this.logger.log('Getting all songs');
    return this.songsService.getAllSongs();
  }

  @Get(':id')
  getSong(
    @Param(
      'id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
      }),
    )
    id: number,
  ) {
    return this.songsService.getSongById(id);
  }

  @Post()
  createSong(@Body() createSong: CreateSongDTO) {
    return this.songsService.createSong(createSong);
  }

  @Put(':id')
  updateSong(@Param('id', ParseIntPipe) id: number) {
    return this.songsService.updateSong(id, {
      title: `Updated Song ${id}`,
      artist: [`Updated Artist ${id}`],
      releaseDate: new Date(2025, 8, 3), // September 3, 2025 (months are 0-indexed)
      duration: new Date(2024 - 8 - 3), // Duration based on the date (for demonstration)
    });
  }

  @Delete(':id')
  deleteSong(@Param('id', ParseIntPipe) id: number) {
    return this.songsService.deleteSong(id);
  }
}
