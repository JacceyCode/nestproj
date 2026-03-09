import { EntityManager } from 'typeorm';
import { faker } from '@faker-js/faker';
import { v4 as uuid4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { Playlist } from '../../src/playlists/playlist.entity';
import { User } from 'src/user/user.entity';
import { Artist } from 'src/artist/artist.entity';

export const seedData = async (manager: EntityManager): Promise<void> => {
  //1
  // Add your seeding logic here using the manager
  // For example:

  await seedUser();
  await seedArtist();
  await seedPlayLists();

  async function seedUser() {
    //2
    const salt = await bcrypt.genSalt(12);
    const encryptedPassword = await bcrypt.hash('password', salt);

    const user = new User();
    user.firstName = faker.person.firstName();
    user.lastName = faker.person.lastName();
    user.email = faker.internet.email();
    user.password = encryptedPassword;
    user.apiKey = uuid4();

    await manager.getRepository(User).save(user);
  }

  async function seedArtist() {
    const salt = await bcrypt.genSalt(12);
    const encryptedPassword = await bcrypt.hash('password', salt);

    const user = new User();
    user.firstName = faker.person.firstName();
    user.lastName = faker.person.lastName();
    user.email = faker.internet.email();
    user.password = encryptedPassword;
    user.apiKey = uuid4();

    const artist = new Artist();
    artist.user = user;
    await manager.getRepository(User).save(user);
    await manager.getRepository(Artist).save(artist);
  }

  async function seedPlayLists() {
    const salt = await bcrypt.genSalt(12);
    const encryptedPassword = await bcrypt.hash('password', salt);

    const user = new User();
    user.firstName = faker.person.firstName();
    user.lastName = faker.person.lastName();
    user.email = faker.internet.email();
    user.password = encryptedPassword;
    user.apiKey = uuid4();

    const playList = new Playlist();
    playList.name = faker.music.genre();
    playList.user = user;

    await manager.getRepository(User).save(user);
    await manager.getRepository(Playlist).save(playList);
  }
};
