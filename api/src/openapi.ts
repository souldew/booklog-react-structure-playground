import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { stringify } from "yaml";

import { app, openApiInfo } from "./app.ts";

// zod スキーマから openapi.yaml を出力する。web 側の orval がこれを読む。
const outPath = fileURLToPath(new URL("../openapi.yaml", import.meta.url));
const document = app.getOpenAPI31Document(openApiInfo);

writeFileSync(outPath, stringify(document));
console.log(`wrote ${outPath}`);
