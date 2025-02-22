"use client";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import NotificationProvider from "@/app/context/notification";
import TimeBlockProvider from "@/app/context/timeblock";
import StaffProvider from "@/app/context/staff";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <NotificationProvider>
                <TimeBlockProvider>
                    <StaffProvider>{children}</StaffProvider>
                </TimeBlockProvider>
            </NotificationProvider>
        </LocalizationProvider>
    );
}
