"use client";

import { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { ToastType } from '@/lib/toast';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

// 每种类型的样式配置
const STYLE_MAP: Record<ToastType, {
  container: string;
  text: string;
  close: string;
  Icon: React.ElementType;
  iconClass: string;
}> = {
  success: {
    container: 'bg-green-50 border-green-200',
    text:      'text-green-900',
    close:     'text-green-400 hover:text-green-700',
    Icon:      CheckCircle2,
    iconClass: 'text-green-500',
  },
  error: {
    container: 'bg-red-50 border-red-200',
    text:      'text-red-900',
    close:     'text-red-400 hover:text-red-700',
    Icon:      AlertCircle,
    iconClass: 'text-red-500',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200',
    text:      'text-amber-900',
    close:     'text-amber-400 hover:text-amber-700',
    Icon:      AlertTriangle,
    iconClass: 'text-amber-500',
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    text:      'text-blue-900',
    close:     'text-blue-400 hover:text-blue-700',
    Icon:      Info,
    iconClass: 'text-blue-500',
  },
};

function ToastCard({
  item,
  onClose,
}: {
  item: ToastItem;
  onClose: () => void;
}) {
  const s = STYLE_MAP[item.type];
  const { Icon } = s;

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg
        ${s.container}
        animate-in fade-in slide-in-from-right-4 duration-200
      `}
      role="alert"
    >
      <Icon size={18} className={`mt-0.5 flex-shrink-0 ${s.iconClass}`} />
      <p className={`flex-1 text-sm font-medium leading-snug ${s.text}`}>
        {item.message}
      </p>
      <button
        onClick={onClose}
        className={`flex-shrink-0 transition-colors ${s.close}`}
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
}

/**
 * 全局 Toast 容器组件
 * 监听 'app:toast' CustomEvent，展示通知队列
 * 只需在根 layout 中放置一次：<Toaster />
 */
export default function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, type, duration } = (e as CustomEvent<{
        message: string;
        type: ToastType;
        duration: number;
      }>).detail;

      const id = Date.now() + Math.random(); // 防止同毫秒碰撞
      setToasts(prev => [...prev, { id, message, type, duration }]);

      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    };

    window.addEventListener('app:toast', handler);
    return () => window.removeEventListener('app:toast', handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map(item => (
        <div key={item.id} className="pointer-events-auto">
          <ToastCard
            item={item}
            onClose={() => setToasts(prev => prev.filter(t => t.id !== item.id))}
          />
        </div>
      ))}
    </div>
  );
}
