import {
  Body,
  ConsoleLogger,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  // Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { SongsService } from './songs.service';
import { CreateSongDTO } from './dto/create-song-dto';
import { Song } from './song.entity';
import { DeleteResult, UpdateResult } from 'typeorm';
import { UpdateSongDTO } from './dto/update-song-dto';
import { Pagination } from 'nestjs-typeorm-paginate';
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
  getSongs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ): Promise<Pagination<Song>> {
    try {
      limit = limit > 100 ? 100 : limit; // Limit the maximum number of items per page to 100

      return this.songsService.paginate({ page, limit });
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
