import { cors } from "hono/cors";

import { createApp } from "./lib/createApp.ts";
import { delay } from "./middleware/delay.ts";
import { fail } from "./middleware/fail.ts";
import { bookNotes } from "./routes/bookNotes.ts";
import { bookProgress } from "./routes/bookProgress.ts";
import { books } from "./routes/books.ts";

export const openApiInfo = {
  openapi: "3.1.0" as const,
  info: {
    title: "booklog api",
    version: "0.1.0",
    description:
      "読書管理デモの API。web からは Server Component / Server Action / ブラウザの 3 経路で呼ばれる。",
  },
  servers: [{ url: "http://localhost:8787" }],
};

// .use() の戻り値は素の Hono 型になり OpenAPIHono のメソッドが型から消えるので、チェーンしない。
export const app = createApp();

// ブラウザから直接叩く経路のために web のオリジンを許可する。BFF だけなら要らない設定。
app.use(cors({ origin: "http://localhost:3000" }));
app.use(fail);
app.use(delay);

app.route("/", books);
app.route("/", bookNotes);
app.route("/", bookProgress);

app.doc31("/doc", openApiInfo);
