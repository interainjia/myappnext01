// app/(auth)/layout.tsx
import React from 'react';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/img/cbbg.png)' }} // Background image provided
    >
      {/* This container simulates the 400px wide white card from AntD configuration */}
      <div className="w-[400px] min-h-[480px] flex flex-col justify-start rounded-2xl p-8 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] z-10">
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