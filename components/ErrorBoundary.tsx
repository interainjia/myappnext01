"use client";

/**
 * 全局 React 错误边界（Error Boundary）
 *
 * 用途：捕获子组件树中未处理的 JavaScript 错误，展示友好的降级 UI，
 *       防止整个应用白屏崩溃。
 *
 * 使用方式（在 app/layout.tsx 中包裹 children）：
 *   <ErrorBoundary>
 *     {children}
 *   </ErrorBoundary>
 *
 * 也可以为某个模块单独包裹并提供自定义 fallback：
 *   <ErrorBoundary fallback={<p>图表加载失败</p>}>
 *     <ExpensiveChart />
 *   </ErrorBoundary>
 *
 * 注意：React 错误边界必须是 class 组件（React 18 / 19 规范限制）。
 */

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// ─── Props & State ────────────────────────────────────────────────────────────

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /**
   * 自定义降级 UI。
   * 若不提供，使用内置的错误展示卡片。
   */
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ─── 组件 ─────────────────────────────────────────────────────────────────────

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /** 在渲染阶段捕获错误，更新 state 以触发降级渲染 */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /** 错误上报（可接入 Sentry / 自研日志服务） */
  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
    // TODO: 接入监控服务时在此处上报
    // reportError({ error, componentStack: info.componentStack });
  }

  /** 重置状态，让用户点击"重试"后重新渲染子树 */
  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) return children;

    // 优先使用外部传入的降级 UI
    if (fallback) return fallback;

    // ── 内置降级 UI ──────────────────────────────────────────────────────────
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8 text-center">

          {/* 图标 */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
              <AlertTriangle size={32} className="text-red-500 dark:text-red-400" />
            </div>
          </div>

          {/* 标题 */}
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Something went wrong
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
            An unexpected error occurred. You can try refreshing the page or
            return to the home screen.
          </p>

          {/* 错误详情（仅开发模式展示） */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mb-6 text-left">
              <summary className="text-xs text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 select-none">
                Error details (dev only)
              </summary>
              <pre className="mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-red-600 dark:text-red-400 overflow-auto whitespace-pre-wrap break-words border border-slate-200 dark:border-slate-700 max-h-48">
                {error.message}
                {'\n'}
                {error.stack}
              </pre>
            </details>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#4db694] hover:bg-[#3d9a7d] text-white rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
            <button
              onClick={() => { window.location.href = '/home'; }}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
            >
              Go Home
            </button>
          </div>

        </div>
      </div>
    );
  }
}
