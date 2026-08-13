// app/(auth)/layout.tsx
import React from 'react';
import Image from 'next/image';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/img/cbbg.png)' }} // Background image provided
    >
      {/* 暗色模式下加一层深色蒙版，避免背景图与深色卡片对比过亮 */}
      <div className="absolute inset-0 bg-transparent dark:bg-slate-950/60 transition-colors" />

      <ThemeToggle className="absolute top-6 right-6 z-20 text-slate-600 bg-white/70 hover:bg-white dark:text-slate-300 dark:bg-slate-800/70 dark:hover:bg-slate-800 shadow-sm" />

      {/* This container simulates the 400px wide white card from AntD configuration */}
      <div className="w-[400px] min-h-[480px] flex flex-col justify-start rounded-2xl p-8 bg-white dark:bg-slate-900 shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)] z-10">
        <div className="text-center mb-4">
          <Image 
            src="/img/cblogo.svg" 
            alt="Crown Bioscience" 
            width={240}
            height={60}
            className="w-[240px] mx-auto h-auto" 
            priority
          />
        </div>
        {children}
      </div>
    </div>
  );
}