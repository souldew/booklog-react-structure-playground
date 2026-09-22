import { vi } from "vitest";

type StubbedResponse = {
  status: number;
  /** 省略すると body 無し (204 など) */
  body?: unknown;
};

export type RecordedRequest = {
  method: string;
  /** base URL を除いたパス */
  path: string;
  /** JSON の body。無ければ undefined */
  body: unknown;
};

// apis/functions のテスト専用。global の fetch を差し替え、用意した応答を順番に返しながら送った内容を記録する。
// 生成クライアント → mutator → mapper を通しで動かし、wire に何が出たかを見るための道具。
// 差し替えの解除は vitest.config.mts の unstubGlobals が毎テスト後に行う。
export function stubFetch(responses: StubbedResponse[]): RecordedRequest[] {
  const requests: RecordedRequest[] = [];
  const queue = [...responses];

  vi.stubGlobal("fetch", async (input: string | URL | Request, init?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input);
    requests.push({
      method: init?.method ?? "GET",
      path: new URL(url).pathname,
      body: typeof init?.body === "string" ? JSON.parse(init.body) : undefined,
    });

    const next = queue.shift();
    if (!next) {
      throw new Error(`stubFetch: 用意した応答を使い切った (${init?.method ?? "GET"} ${url})`);
    }
    return next.body === undefined
      ? new Response(null, { status: next.status })
      : Response.json(next.body, { status: next.status });
  });

  return requests;
}
