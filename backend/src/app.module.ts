import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from '@/modules/admin.module';
import { UserModule } from '@/modules/user.module';
import { StaffModule } from '@/modules/staff.module';
import { DatabaseModule } from '@/modules/database.module';

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        AdminModule,
        UserModule,
        StaffModule,
        DatabaseModule,
    ],
})
export class AppModule {}
