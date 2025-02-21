import { Module } from '@nestjs/common';
import { PubsubModule } from './pubsub.module';
import { AdminController } from '@/controllers/admin.controller';
import { AdminService } from '@/services/admin.service';

@Module({
    imports: [PubsubModule],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule {}
