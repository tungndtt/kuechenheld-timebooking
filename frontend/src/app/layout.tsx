import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NotificationProvider from "@/app/context/notification";
import TimeBlockProvider from "@/app/context/timeblock";
import StaffProvider from "@/app/context/staff";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Kuechenheld Timebooking",
    description: "Coding Challenge at Kuechenheld",
    icons: [{ rel: "icon", url: "/favicon.png", type: "image/png" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <NotificationProvider>
                        <TimeBlockProvider>
                            <StaffProvider>{children}</StaffProvider>
                        </TimeBlockProvider>
                    </NotificationProvider>
                </LocalizationProvider>
            </body>
        </html>
    );
}
