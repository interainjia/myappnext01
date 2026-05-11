import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BioData Portal",
  description: "Scientific Data Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900 bg-white">
        {children}
      </body>
    </html>
  );
}