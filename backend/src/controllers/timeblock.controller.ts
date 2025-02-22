import { Controller, Get, Post, Query, Param, Body, Res, ParseIntPipe, Sse } from '@nestjs/common';
import { Response } from 'express';
import { TimeBlockService } from '@/services/timeblock.service';
import { PubsubService } from '@/services/pubsub.service';
import { Observable, fromEventPattern } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { TimeBlockDto, AddTimeBlockDto, Duration } from '@/dtos';

@Controller('timeblocks')
export class TimeBlockController {
    constructor(
        private readonly timeBlockService: TimeBlockService,
        private readonly pubsubService: PubsubService,
    ) {}

    @Get(':id')
    async getTimeBlock(
        @Param('id', new ParseIntPipe({optional: false})) id: number
    ): Promise<TimeBlockDto> {
        const timeBlock = await this.timeBlockService.getTimeBlock(id);
        return plainToInstance(TimeBlockDto, timeBlock);
    }

    @Get()
    async getTimeBlocks(
        @Query('date') date: string, 
        @Query('staffId', new ParseIntPipe({optional: true})) staffId?: number
    ): Promise<TimeBlockDto[]>  {
        const timeBlocks = await this.timeBlockService.getTimeBlocks(date, staffId);
        return plainToInstance(TimeBlockDto, timeBlocks);
    }

    @Post()
    async addTimeBlock(@Body() body: AddTimeBlockDto, @Res() response: Response) {
        const { staffId, date, duration } = body;
        const timeBlock = await this.timeBlockService.addTimeBlock(staffId, date, duration );
        if (!timeBlock) {
            return response.status(409).send();
        }
        const { id } = timeBlock;
        await this.pubsubService.publish('admin', { id, staffId, date });
        await this.pubsubService.publish('user', { id, staffId, date });
        return response.status(204).send();
    }

    @Post('appointment')
    async bookAppointment(
        @Query('id', new ParseIntPipe({optional: false})) id: number,
        @Body() duration: Duration, 
        @Res() response: Response
    ) {
        const timeBlock = await this.timeBlockService.bookAppointment(id, duration);
        if (!timeBlock) {
            return response.status(409).send();
        }
        const { staffId, date } = timeBlock;
        await this.pubsubService.publish('user', { id, staffId, date });
        return response.status(204).send();
    }

    @Sse('sse/user')
    sseUser(): Observable<MessageEvent> {
        return fromEventPattern(
            (handler) => this.pubsubService.subscribe('user', handler),
            () => console.log('SSE connection closed'),
        );
    }

    @Sse('sse/admin')
    sseAdmin(): Observable<MessageEvent> {
        return fromEventPattern(
            (handler) => this.pubsubService.subscribe('admin', handler),
            () => console.log('SSE connection closed'),
        );
    }
}
