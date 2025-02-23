"use client";
import Provider from "@/app/provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body suppressHydrationWarning style={{ padding: "20px" }}>
                <Provider>{children}</Provider>
            </body>
        </html>
    );
}
