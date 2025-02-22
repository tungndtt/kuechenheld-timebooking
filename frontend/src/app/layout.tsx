"use client";
import Provider from "@/app/provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body suppressHydrationWarning>
                <Provider>{children}</Provider>
            </body>
        </html>
    );
}
