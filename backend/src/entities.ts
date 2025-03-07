
import { Entity, Index, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Duration } from '@/types';

@Entity('timeblock')
@Index(['staffId', 'date'])
export class TimeBlock {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    staffId: number;

    @Column({type: 'date'})
    date: string;

    @Column({type: 'json'})
    duration: Duration;

    @Column({type: 'json'})
    appointments: Duration[];
}
