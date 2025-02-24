"use client";
import { PublicEnvScript } from "next-runtime-env";
import Provider from "@/app/provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <PublicEnvScript />
            </head>
            <body suppressHydrationWarning style={{ padding: "20px" }}>
                <Provider>{children}</Provider>
            </body>
        </html>
    );
}
