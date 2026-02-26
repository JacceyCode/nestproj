import { Injectable } from '@nestjs/common';

@Injectable()
export class DevConfigService {
  DBHOST = 'localhost';
  getDbHost() {
    return this.DBHOST;
  }
}
