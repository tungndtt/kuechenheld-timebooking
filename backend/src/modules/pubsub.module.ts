import { Module } from '@nestjs/common';
import { PubsubService } from '@/services/pubsub.service';

@Module({
    providers: [PubsubService],
    exports: [PubsubService],
})
export class PubsubModule {}
