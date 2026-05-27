import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voxa | AI Voice Studio",
  description: "A premium multi-provider AI voice studio for natural speech generation.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const theme = (await cookies()).get("voxa-theme")?.value === "light" ? "light" : "dark";

  return (
    <html lang="en" className={theme}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
