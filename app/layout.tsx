import type { Metadata } from "next";
import "./globals.css";
import Toaster from "@/components/ui/Toaster";
import ErrorBoundary from "@/components/ErrorBoundary";
import ThemeProvider, { themeInitScript } from "@/components/ThemeProvider";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 在 React hydrate 之前同步设置 .dark class，避免切换主题时的闪烁 */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 transition-colors">
        <ThemeProvider>
          {/* 全局错误边界：捕获子树中未处理的 JS 错误，防止白屏 */}
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          {/* 全局 Toast 通知容器，全站唯一，无需 Context */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}