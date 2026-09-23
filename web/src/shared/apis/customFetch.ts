// orval の mutator。生成された全エンドポイントがここを通る。
//
// 通信経路は 3 つあり (docs/backend.md §7)、base URL の切り替えをここで吸収する。
//   サーバー (Server Component / Server Action)  → API_BASE_URL で api に直接
//   ブラウザ、既定                                → NEXT_PUBLIC_API_BASE_URL で api に直接
//   ブラウザ、BFF を試す Container                → baseUrl: "/api" を渡して Route Handler へ

const DEFAULT_BASE_URL = "http://localhost:8787";

export type CustomFetchOptions = RequestInit & {
  /** 既定の base URL を上書きする。BFF 経路を試す Container だけが使う */
  baseUrl?: string;
};

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
  if (typeof window === "undefined") {
    return process.env.API_BASE_URL ?? DEFAULT_BASE_URL;
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL;
}

export async function customFetch<T>(url: string, options: CustomFetchOptions = {}): Promise<T> {
  const { baseUrl, ...init } = options;
  const response = await fetch(`${baseUrl ?? resolveBaseUrl()}${url}`, init);
  const data = response.status === 204 ? undefined : await response.json();

  // 4xx / 5xx は throw する。Server Component からの取得はルートの error.tsx が、
  // Server Action からの更新はその中の catch が受ける。
  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  // orval の fetch クライアントが期待する形。T は生成側の { data, status, headers } の union。
  return { data, status: response.status, headers: response.headers } as T;
}
