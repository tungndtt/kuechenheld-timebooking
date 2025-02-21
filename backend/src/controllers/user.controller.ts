import { Controller, Get, Post, Sse, Query, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from '../services/user.service';
import { PubsubService } from '../services/pubsub.service';
import { Observable, fromEventPattern } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { BookAppointmentDto, TimeBlockDto } from '../dtos';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly pubsubService: PubsubService,
    ) {}

    @Get()
    async getTimeBlocks(@Query('date') date: string): Promise<TimeBlockDto[]> {
        const timeBlocks = await this.userService.getTimeBlocks(date);
        return plainToInstance(TimeBlockDto, timeBlocks);
    }

    @Post()
    async bookAppointment(@Body() body: BookAppointmentDto, @Res() response: Response) {
        const { id, duration } = body;
        const timeBlock = await this.userService.bookAppointment(id, duration);
        if (!timeBlock) {
            return response.status(409).send();
        }
        const { staffId } = timeBlock;
        await this.pubsubService.publish('user', { type: 'appointment', id, staffId, duration });
        return response.status(204).send();
    }

    @Sse('sse')
    sse(): Observable<MessageEvent> {
        return fromEventPattern(
            (handler) => this.pubsubService.subscribe('user', handler),
            () => console.log('SSE connection closed'),
        );
    }
}
