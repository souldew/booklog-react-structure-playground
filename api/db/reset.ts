import { rmSync } from "node:fs";

import { DB_PATH, getDb } from "./client.ts";

for (const suffix of ["", "-journal", "-wal", "-shm"]) {
  rmSync(`${DB_PATH}${suffix}`, { force: true });
}

getDb();
console.log(`recreated ${DB_PATH}`);
