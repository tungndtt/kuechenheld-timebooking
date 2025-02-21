import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class PubsubService implements OnModuleInit, OnModuleDestroy {
    private publisher: Redis;
    private subscriber: Redis;

    constructor(readonly configService: ConfigService) {
        const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
        const redisPort = configService.get<number>('REDIS_PORT', 6379);

        this.publisher = new Redis({ host: redisHost, port: redisPort });
        this.subscriber = new Redis({ host: redisHost, port: redisPort });
    }

    async publish(channel: string, data: any) {
        await this.publisher.publish(channel, JSON.stringify(data));
    }

    async subscribe(channel: string, callback: (data: any) => void) {
        this.subscriber.subscribe(channel);
        this.subscriber.on('message', (chan, msg) => {
            if (channel === chan) {
                callback(JSON.parse(msg));
            }
        });
    }

    async onModuleDestroy() {
        this.publisher.quit();
        this.subscriber.quit();
    }

    async onModuleInit() {
        console.log('Redis Pub/Sub Service Initialized');
    }
}
