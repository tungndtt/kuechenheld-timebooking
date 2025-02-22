import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TimeBlockModule } from '@/modules/timeblock.module';
import { StaffModule } from '@/modules/staff.module';
import { DatabaseModule } from '@/modules/database.module';

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        TimeBlockModule,
        StaffModule,
        DatabaseModule,
    ],
})
export class AppModule {}
