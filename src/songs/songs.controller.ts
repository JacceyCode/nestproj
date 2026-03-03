import {
  Body,
  ConsoleLogger,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  // Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { SongsService } from './songs.service';
import { CreateSongDTO } from './dto/create-song-dto';
import { Song } from './song.entity';
import { DeleteResult, UpdateResult } from 'typeorm';
import { UpdateSongDTO } from './dto/update-song-dto';
// import { type Connection } from 'src/common/constants/connection';

@Controller('songs')
export class SongsController {
  private readonly logger = new ConsoleLogger(SongsController.name, {
    timestamp: true,
  });

  constructor(
    private readonly songsService: SongsService,
    // @Inject('CONNECTION')
    // private readonly connection: Connection,
  ) {
    // console.log('Database Connection Info:', this.connection);
  }

  @Get()
  getSongs(): Promise<Song[]> {
    try {
      return this.songsService.getAllSongs();
    } catch (error) {
      this.logger.error('Error getting all songs', error);
      throw new HttpException(
        'Failed to get songs',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error instanceof Error ? error : new Error(String(error)),
        },
      );
    }
  }

  @Get(':id')
  async getSong(
    @Param(
      'id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
      }),
    )
    id: number,
  ): Promise<Song> {
    const song = await this.songsService.getSongById(id);

    if (!song) {
      throw new HttpException(
        `Song with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return song;
  }

  @Post()
  createSong(@Body() createSong: CreateSongDTO): Promise<Song> {
    return this.songsService.createSong(createSong);
  }

  @Put(':id')
  updateSong(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSongDTO: UpdateSongDTO,
  ): Promise<UpdateResult> {
    return this.songsService.updateSong(id, updateSongDTO);
  }

  @Delete(':id')
  deleteSong(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
    return this.songsService.deleteSong(id);
  }
}
