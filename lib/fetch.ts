/**
 * 带超时机制的 fetch 封装（AbortController）
 *
 * 使用示例：
 *   import { fetchWithTimeout } from '@/lib/fetch';
 *   const res = await fetchWithTimeout('/api/Account/login', { method: 'POST', ... });
 *   // 超时或网络错误会抛出 RequestTimeoutError / 原生 Error
 */

/** fetch 超时时抛出的具名错误，便于上层区分处理 */
export class RequestTimeoutError extends Error {
  readonly timeout: number;
  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`);
    this.name = 'RequestTimeoutError';
    this.timeout = timeout;
    // 保持正确的原型链（TypeScript + ES5 target 兼容性）
    Object.setPrototypeOf(this, RequestTimeoutError.prototype);
  }
}

export interface FetchWithTimeoutOptions extends RequestInit {
  /**
   * 超时时间（毫秒），默认 15000（15 秒）
   * 超过后自动 abort 并抛出 RequestTimeoutError
   */
  timeout?: number;
}

/**
 * 带超时的 fetch 封装
 * @param url     请求地址（绝对路径或相对路径）
 * @param options 标准 RequestInit + 可选 timeout
 * @returns       原生 Response（与 fetch 完全一致）
 * @throws        RequestTimeoutError — 请求超时
 * @throws        Error               — 网络或其他错误
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {},
): Promise<Response> {
  const { timeout = 15_000, ...fetchOptions } = options;

  const controller = new AbortController();

  const timerId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    // AbortError 由我们的超时计时器触发
    if (
      error instanceof DOMException && error.name === 'AbortError' ||
      // Firefox / 旧版运行时可能抛出不同类型
      (error instanceof Error && error.name === 'AbortError')
    ) {
      throw new RequestTimeoutError(timeout);
    }
    throw error;
  } finally {
    clearTimeout(timerId);
  }
}
