import { Controller, Get, Post, Query, Body, Res, Sse } from '@nestjs/common';
import { Response } from 'express';
import { AdminService } from '@/services/admin.service';
import { PubsubService } from '@/services/pubsub.service';
import { Observable, fromEventPattern } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { TimeBlockDto, AddTimeBlockDto } from '@/dtos';

@Controller('admins')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly pubsubService: PubsubService,
    ) {}

    @Get()
    async getTimeBlocks(@Query('staffId') staffId: number, @Query('date') date: string): Promise<TimeBlockDto[]>  {
        const timeBlocks = await this.adminService.getTimeBlocks(staffId, date);
        return plainToInstance(TimeBlockDto, timeBlocks);
    }

    @Post()
    async addTimeBlock(@Body() body: AddTimeBlockDto, @Res() response: Response) {
        const { staffId, date, duration } = body;
        const timeBlock = await this.adminService.addTimeBlock(staffId, date, duration );
        if (!timeBlock) {
            return response.status(409).send();
        }
        const { id } = timeBlock;
        await this.pubsubService.publish('admin', { id, staffId, duration });
        await this.pubsubService.publish('user', { type: 'block', id, staffId, duration });
        return response.status(204).send();
    }

    @Sse('sse')
    sse(): Observable<MessageEvent> {
        return fromEventPattern(
            (handler) => this.pubsubService.subscribe('admin', handler),
            () => console.log('SSE connection closed'),
        );
    }
}
