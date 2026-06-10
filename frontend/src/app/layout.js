import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const body = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "SWAIS — AI-Powered Faculty Portal",
  description: "Bringing AI into every classroom. Manage notes, assessments, and student insights at SWAIS International Academy.",
  keywords: ["AI in Schools", "EdTech", "Teacher Portal", "SWAIS"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
