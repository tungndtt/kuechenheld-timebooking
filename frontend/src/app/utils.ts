import { Duration } from "@/app/types";

export const getDuration = (startHour: number, startMinute: number, duration: number): Duration => {
    let minutes = startMinute + duration;
    let endMinute = minutes % 60;
    let hours = Math.floor(minutes / 60);
    let endHour = startHour + hours;
    return { startHour, startMinute, endHour, endMinute };
};

export const getTimeDiff = (startHour1: number, startMinute1: number, startHour2: number, startMinute2: number): number => {
    return (startHour1 - startHour2) * 60 + (startMinute1 - startMinute2);
};

export const getTimeDisplay = (hour: number, minute: number): string => {
    const hh = hour.toString().padStart(2, '0');
    const mm = minute.toString().padStart(2, '0');
    return `${hh}:${mm}`;
};

export const getDurationDisplay = (duration: Duration | undefined): string => {
    if(!duration) return "";
    const start = getTimeDisplay(duration.startHour, duration.startMinute);
    const end = getTimeDisplay(duration.endHour, duration.endMinute);
    return `${start} - ${end}`
}