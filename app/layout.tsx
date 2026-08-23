import type { Metadata } from "next";
import "./globals.css";
import { SolProvoCloudBootstrap } from "@/app/components/SolProvoCloud";

export const metadata: Metadata = {
  title: "SolProvo — ProspectOS",
  description: "India-first local business growth operating system.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><SolProvoCloudBootstrap>{children}</SolProvoCloudBootstrap></body>
    </html>
  );
}
