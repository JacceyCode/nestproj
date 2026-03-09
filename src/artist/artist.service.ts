import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Artist } from './artist.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ArtistService {
  constructor(
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
  ) {}

  async createArtist(userId: number): Promise<Artist> {
    // Validate that user is not already an artist
    const existingArtist = await this.findArtist(userId);

    if (existingArtist) {
      throw new Error('User is already an artist');
    }

    const artist = this.artistRepository.create({
      user: { id: userId },
    });
    return this.artistRepository.save(artist);
  }

  async findArtist(userId: number): Promise<Artist | null> {
    return await this.artistRepository.findOneBy({ user: { id: userId } });
  }
}
