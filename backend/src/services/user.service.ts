import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeBlock } from '@/entities';
import { Duration } from '@/interfaces';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(TimeBlock)
        private readonly timeBlockRepository: Repository<TimeBlock>
    ) {}

    async getTimeBlocks(date: string): Promise<TimeBlock[]> {
        return await this.timeBlockRepository.find({ where: {date} });
    }

    async bookAppointment(id: number, duration: Duration): Promise<TimeBlock | null> {
        const queryRunner = this.timeBlockRepository.manager.connection.createQueryRunner();
        await queryRunner.startTransaction();
        try {
            const timeBlock = await queryRunner.manager
                .createQueryBuilder(TimeBlock, 'time_block')
                .setLock('pessimistic_write')
                .where('time_block.id = :id', { id })
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
