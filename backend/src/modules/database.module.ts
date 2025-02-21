import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            //@ts-ignore
            useFactory: (configService: ConfigService) => ({ 
                type: configService.get<string>('DATABASE_TYPE'),
                host: configService.get<string>('DATABASE_HOST'),
                port: configService.get<number>('DATABASE_PORT'),
                username: configService.get<string>('DATABASE_USERNAME'),
                password: configService.get<string>('DATABASE_PASSWORD'),
                database: configService.get<string>('DATABASE_NAME'),
                entities: [],
                synchronize: true,
            }),
        }),
    ],
})
export class DatabaseModule {}
