import { Module } from '@nestjs/common';
import { PubsubModule } from '@/modules/pubsub.module';
import { UserController } from '@/controllers/user.controller';
import { UserService } from '@/services/user.service';

@Module({
    imports: [PubsubModule],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
