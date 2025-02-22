export type Duration = {
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
};

export type TimeBlock = {
    id: number;
    staffId: number;
    date: string;
    duration: Duration;
    appointments: Duration[];
};