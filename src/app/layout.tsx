import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import clsx from "clsx";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "QOSAMA | Premium Sneaker Care",
  description: "Kemurnian Mutlak untuk Sepatu Anda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={clsx(outfit.variable, "antialiased")}>{children}</body>
    </html>
  );
}
