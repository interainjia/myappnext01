import type { Metadata } from "next";
import "./globals.css";

console.log('Current API URL:', process.env.NEXT_PUBLIC_API_URL);

export const metadata: Metadata = {
  title: 'Crown Bioscience',
  description: "Crown Bioscience Scientific Data Management System"
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