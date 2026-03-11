import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Playlist } from 'src/playlists/playlist.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'John', description: 'The first name of the user' })
  @Column()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'The last name of the user' })
  @Column()
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user',
  })
  @Column({ unique: true })
  email: string;

  // {
  //   example: 'strongpassword123',
  //   description: 'The password of the user (will be hashed)',
  // }
  @ApiHideProperty()
  @Column()
  @Exclude()
  password: string;

  @OneToMany(() => Playlist, (playlist) => playlist.user)
  playLists: Playlist[];

  @ApiHideProperty()
  @Exclude()
  @Column({ nullable: true, type: 'text' })
  twoFASecret: string | null;

  @ApiHideProperty()
  @Exclude()
  @Column({ default: false, type: 'boolean' })
  enable2FA: boolean;

  @ApiHideProperty()
  @Exclude()
  @Column()
  apiKey: string;
}
