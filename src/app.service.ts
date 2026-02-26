import { Injectable } from '@nestjs/common';
import { DevConfigService } from './common/providers/DevConfigService';

@Injectable()
export class AppService {
  constructor(private readonly devConfigService: DevConfigService) {}

  getHello(): string {
    return 'Hello World!';
  }

  getVersion1(): string {
    return `Version 1.0 ${this.devConfigService.getDbHost()}`;
  }
}
