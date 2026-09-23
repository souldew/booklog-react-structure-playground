// orval の mutator。生成された全エンドポイントがここを通る。
// 呼ぶのはサーバー (Server Component / Server Action) だけなので、base URL は API_BASE_URL の 1 つ (docs/backend.md §7)。

const DEFAULT_BASE_URL = "http://localhost:8787";

export type CustomFetchOptions = RequestInit;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`api responded with ${status}`);
    this.name = "ApiError";
  }
}

function resolveBaseUrl(): string {
  return process.env.API_BASE_URL ?? DEFAULT_BASE_URL;
}

export async function customFetch<T>(url: string, init: CustomFetchOptions = {}): Promise<T> {
  const response = await fetch(`${resolveBaseUrl()}${url}`, init);
  const data = response.status === 204 ? undefined : await response.json();

  // 4xx / 5xx は throw する。Server Component からの取得はルートの error.tsx が、
  // Server Action からの更新はその中の catch が受ける。
  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  // orval の fetch クライアントが期待する形。T は生成側の { data, status, headers } の union。
  return { data, status: response.status, headers: response.headers } as T;
}
