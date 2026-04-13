
import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Location Intelligence - Phân tích địa điểm kinh doanh",
  description: "Nền tảng phân tích thông minh địa điểm kinh doanh tại Việt Nam với AI",
  keywords: ["location intelligence", "business analysis", "Vietnam", "real estate", "AI"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${dmSerif.variable} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
