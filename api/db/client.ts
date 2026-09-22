import { existsSync, readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

import { seed } from "./seed.ts";

export const DB_PATH = fileURLToPath(new URL("../booklog.db", import.meta.url));

let instance: DatabaseSync | undefined;

// 初回アクセスで開く。ファイルが無ければスキーマを作ってシードを入れる。
// import 時に開かないのは、OpenAPI 出力のスクリプトが DB を必要としないため。
export function getDb(): DatabaseSync {
  if (instance) return instance;

  const isFresh = !existsSync(DB_PATH);
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA foreign_keys = ON");

  if (isFresh) {
    db.exec(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
    seed(db);
  }

  instance = db;
  return db;
}
