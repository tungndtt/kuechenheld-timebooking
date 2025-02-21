import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TimeBlock } from '@/entities';
import { Duration } from '@/interfaces';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(TimeBlock)
        private readonly timeBlockRepository: Repository<TimeBlock>,
        private readonly dataSource: DataSource
    ) {}

    async getTimeBlocks(staffId: number, date: string): Promise<TimeBlock[]> {
        return this.timeBlockRepository.find({ where: {staffId, date} });
    }

    async addTimeBlock(staffId: number, date: string, duration: Duration): Promise<TimeBlock> {
        return this.dataSource.transaction<TimeBlock>(async (manager) => {
            await manager.query('LOCK TABLES time_block WRITE');
            try {
                const timeBlocks = await this.getTimeBlocks(staffId, date);
                // check overlapping
                for(let {duration: timeBlockDuration} of timeBlocks) {
                    if(
                        timeBlockDuration.startHour <= duration.startHour && duration.startHour < timeBlockDuration.endHour ||
                        duration.startHour < timeBlockDuration.endHour && timeBlockDuration.endHour <= duration.endHour
                    ) {
                        return null;
                    }
                }
                const timeBlock = manager.create(TimeBlock, { staffId, date, duration });
                return await manager.save(timeBlock);
            } finally {
                await manager.query('UNLOCK TABLES');
            }
        });
    }
}
