import { createApp } from "./lib/createApp.ts";
import { delay } from "./middleware/delay.ts";
import { fail } from "./middleware/fail.ts";
import { bookNotes } from "./routes/bookNotes.ts";
import { bookProgress } from "./routes/bookProgress.ts";
import { books } from "./routes/books.ts";
import { dashboard } from "./routes/dashboard.ts";

export const openApiInfo = {
  openapi: "3.1.0" as const,
  info: {
    title: "booklog api",
    version: "0.1.0",
    description: "読書管理デモの API。web からは Server Component と Server Action が呼ぶ。",
  },
  servers: [{ url: "http://localhost:8787" }],
};

// .use() の戻り値は素の Hono 型になり OpenAPIHono のメソッドが型から消えるので、チェーンしない。
export const app = createApp();

app.use(fail);
app.use(delay);

app.route("/", books);
app.route("/", bookNotes);
app.route("/", bookProgress);
app.route("/", dashboard);

app.doc31("/doc", openApiInfo);
