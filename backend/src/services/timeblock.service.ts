import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TimeBlock } from '@/entities';
import { Duration } from '@/types';

@Injectable()
export class TimeBlockService {
    constructor(
        @InjectRepository(TimeBlock)
        private readonly timeBlockRepository: Repository<TimeBlock>,
        private readonly dataSource: DataSource
    ) {}

    async getTimeBlock(id: number): Promise<TimeBlock> {
        return await this.timeBlockRepository.findOne({ where: {id} });
    }

    async getTimeBlocks(date: string, staffId?: number): Promise<TimeBlock[]> {
        const where = staffId? {staffId, date} : {date};
        return this.timeBlockRepository.find({ where });
    }

    async addTimeBlock(staffId: number, date: string, duration: Duration): Promise<TimeBlock> {
        return this.dataSource.transaction<TimeBlock>(async (manager) => {
            await manager.query('LOCK TABLES timeblock WRITE');
            try {
                const timeBlocks = await manager.query<TimeBlock[]>(
                    'SELECT * FROM timeblock WHERE staffId = ? AND date = ?',
                    [staffId, date]
                );
                // check overlapping
                for(let {duration: timeBlockDuration} of timeBlocks) {
                    if(
                        timeBlockDuration.startHour <= duration.startHour && duration.startHour < timeBlockDuration.endHour ||
                        duration.startHour < timeBlockDuration.endHour && timeBlockDuration.endHour <= duration.endHour
                    ) {
                        return null;
                    }
                }
                const timeBlock = manager.create(TimeBlock, { staffId, date, duration, appointments: [] });
                return await manager.save(timeBlock);
            } finally {
                await manager.query('UNLOCK TABLES');
            }
        });
    }

    async bookAppointment(id: number, duration: Duration): Promise<TimeBlock | null> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const timeBlock = await queryRunner.manager
                .createQueryBuilder(TimeBlock, 'timeblock')
                .setLock('pessimistic_write')
                .where('timeblock.id = :id', { id })
                .getOne();
            if (!timeBlock) {
                await queryRunner.rollbackTransaction();
                return null;
            }
            // check overlapping
            for(const appointment of timeBlock.appointments) {
                if(
                    appointment.startHour <= duration.startHour && duration.startHour < appointment.endHour ||
                    duration.startHour < appointment.endHour && appointment.endHour <= duration.endHour
                ) {
                    await queryRunner.rollbackTransaction();
                    return null;
                }
            }
            timeBlock.appointments.push(duration);
            await queryRunner.manager.save(TimeBlock, timeBlock);
            await queryRunner.commitTransaction();
            return timeBlock;
        } catch (_) {
            await queryRunner.rollbackTransaction();
            return null;
        } finally {
            await queryRunner.release();
        }
    }
}
