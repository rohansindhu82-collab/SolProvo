import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SolProvo — ProspectOS",
  description: "India-first local business growth operating system.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
