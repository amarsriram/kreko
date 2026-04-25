import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Kreko — Turn Ideas Into Execution",
  description:
    "Kreko is a modern AI assistant that helps you break down ideas, create content, explain concepts, and plan your time — instantly.",
  keywords: ["AI assistant", "productivity", "Kreko", "task planner", "content creator"],
  openGraph: {
    title: "Kreko — Turn Ideas Into Execution",
    description: "A modern AI-powered productivity assistant.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
