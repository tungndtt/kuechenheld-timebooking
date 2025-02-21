import { IsInt, IsObject, IsArray, IsOptional, IsISO8601 } from 'class-validator';

class Duration {
    @IsInt()
    startHour: number;

    @IsInt()
    startMinute: number;

    @IsInt()
    endHour: number;

    @IsInt()
    endMinute: number;
}

export class BookAppointmentDto {
    @IsInt()
    id: number;

    @IsInt()
    duration: Duration;
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
    @IsOptional()
    appointments: Duration[];
}