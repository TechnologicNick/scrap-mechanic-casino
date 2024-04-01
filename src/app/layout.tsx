import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { Providers } from "./providers";
import { env } from "~/env";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Scrap Mechanic Casino",
  description: "Gamble all your hard-earned resources away!",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  metadataBase: env.APP_URL ? new URL(env.APP_URL) : undefined,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full dark">
      <body
        className={`font-sans ${inter.variable} h-full [&>div:first-child]:h-full`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
