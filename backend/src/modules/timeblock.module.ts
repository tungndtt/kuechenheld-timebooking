import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeBlockController } from '@/controllers/timeblock.controller';
import { TimeBlockService } from '@/services/timeblock.service';
import { PubsubService } from '@/services/pubsub.service';
import { TimeBlock } from '@/entities';

@Module({
    imports: [TypeOrmModule.forFeature([TimeBlock])],
    controllers: [TimeBlockController],
    providers: [TimeBlockService, PubsubService],
})
export class TimeBlockModule {}
