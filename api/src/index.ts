import { serve } from "@hono/node-server";

import { app } from "./app.ts";

serve({ fetch: app.fetch, port: 8787 }, (info) => {
  console.log(`api is running on http://localhost:${info.port}`);
});
