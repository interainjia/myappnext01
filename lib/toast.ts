/**
 * 轻量级 Toast 工具函数（基于 CustomEvent，无需 Context Provider）
 * 使用方式：在任意客户端组件中直接调用 toast / toastSuccess / toastError 等
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * 触发一条 Toast 通知
 * @param message  显示的文字
 * @param type     类型：success | error | warning | info（默认 info）
 * @param duration 自动消失毫秒数（默认 4000）
 */
export function toast(message: string, type: ToastType = 'info', duration = 4000) {
  if (typeof window === 'undefined') return; // SSR 安全
  window.dispatchEvent(
    new CustomEvent('app:toast', { detail: { message, type, duration } })
  );
}

/** 操作成功 */
export const toastSuccess = (msg: string, duration?: number) => toast(msg, 'success', duration);
/** 操作失败 / 异常 */
export const toastError   = (msg: string, duration?: number) => toast(msg, 'error',   duration);
/** 表单校验警告 */
export const toastWarning = (msg: string, duration?: number) => toast(msg, 'warning', duration);
/** 普通提示 */
export const toastInfo    = (msg: string, duration?: number) => toast(msg, 'info',    duration);
