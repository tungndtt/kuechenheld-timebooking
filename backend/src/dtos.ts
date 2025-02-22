import { IsInt, IsObject, IsArray, IsISO8601 } from 'class-validator';

export class Duration {
    @IsInt()
    startHour: number;

    @IsInt()
    startMinute: number;

    @IsInt()
    endHour: number;

    @IsInt()
    endMinute: number;
}

export class AddTimeBlockDto {
    @IsInt()
    staffId: number;

    @IsISO8601()
    date: string;

    @IsObject()
    duration: Duration;
}

export class TimeBlockDto {
    @IsInt()
    id: number;

    @IsInt()
    staffId: number;

    @IsISO8601()
    date: string;

    @IsObject()
    duration: Duration;

    @IsArray()
    appointments: Duration[];
}