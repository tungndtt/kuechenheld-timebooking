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

    async subscribe(channel: string) {
        this.subscriber.subscribe(channel);
    }
    
    addListener(listener: (channel: string, message: string) => void) {
        this.subscriber.on('message', listener);
    }
    
    removeListener(listener: (channel: string, message: string) => void) {
        this.subscriber.off('message', listener);
    }
    

    async onModuleDestroy() {
        this.publisher.quit();
        this.subscriber.quit();
    }

    async onModuleInit() {}
}
