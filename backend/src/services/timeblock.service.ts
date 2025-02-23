import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TimeBlock } from '@/entities';
import { Duration } from '@/types';

function overlapping(d1: Duration, d2: Duration): boolean {
    const sd1 = (d1.startHour - d2.startHour) * 60 + (d1.startMinute - d2.startMinute);
    const ed1 = (d1.startHour - d2.endHour) * 60 + (d1.startMinute - d2.endMinute);
    const sd2 = (d2.startHour - d1.startHour) * 60 + (d2.startMinute - d1.startMinute);
    const ed2 = (d2.startHour - d1.endHour) * 60 + (d2.startMinute - d1.endMinute);
    return (sd1 >= 0 && ed1 < 0) || (sd2 >= 0 && ed2 < 0);
}

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
        const timeBlocks = await this.timeBlockRepository.find({ where });
        timeBlocks.sort(
            ({duration: d1}, {duration: d2}) => (d1.startHour - d2.startHour) * 60 + (d1.startMinute - d2.startMinute)
        )
        return timeBlocks;
    }

    async addTimeBlock(staffId: number, date: string, duration: Duration): Promise<TimeBlock | null> {
        // check whether given duration is valid
        const hours = duration.endHour - duration.startHour;
        const minutes = duration.endMinute - duration.startMinute;
        if(hours * 60 + minutes <= 0) {
            return Promise.resolve(null);
        }
        return this.dataSource.transaction<TimeBlock>(async (manager) => {
            await manager.query('LOCK TABLES timeblock WRITE');
            try {
                // const timeBlocks = await manager.query<TimeBlock[]>(
                //     'SELECT * FROM timeblock WHERE staffId = ? AND date = ?',
                //     [staffId, date]
                // );
                const timeBlocks = await manager.createQueryBuilder(TimeBlock, 'timeblock')
                    .where('timeblock.staffId = :staffId', { staffId })
                    .andWhere('timeblock.date = :date', { date })
                    .getMany();
                // check overlapping
                for(let {duration: timeBlockDuration} of timeBlocks) {
                    if(overlapping(duration, timeBlockDuration)) {
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
        // check whether given duration is valid
        const hours = duration.endHour - duration.startHour;
        const minutes = duration.endMinute - duration.startMinute;
        if(hours * 60 + minutes <= 0) {
            return Promise.resolve(null);
        }
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
            const appointments = timeBlock.appointments;
            for(const appointment of appointments) {
                if(overlapping(duration, appointment)) {
                    await queryRunner.rollbackTransaction();
                    return null;
                }
            }
            let i = 0;
            for(; i<appointments.length; i++) {
                const appointment = appointments[i];
                const hours = appointment.startHour - duration.startHour;
                const minutes = appointment.startMinute - duration.startMinute;
                if(hours * 60 + minutes > 0) {
                    appointments.splice(i, 0, duration);
                    break;
                }
            }
            if(i === appointments.length) {
                appointments.push(duration);
            }
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
