import { Module } from '@nestjs/common';
import { PoisService } from './pois.service';
import { PoisController } from './pois.controller';

@Module({
  controllers: [PoisController],
  providers: [PoisService],
})
export class PoisModule {}
