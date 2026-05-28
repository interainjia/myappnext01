import type { Metadata } from "next";
import "./globals.css";
import Toaster from "@/components/ui/Toaster";
import ErrorBoundary from "@/components/ErrorBoundary";

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
        {/* 全局错误边界：捕获子树中未处理的 JS 错误，防止白屏 */}
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        {/* 全局 Toast 通知容器，全站唯一，无需 Context */}
        <Toaster />
      </body>
    </html>
  );
}