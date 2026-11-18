// Deletes the local SQLite database; it is re-created and re-seeded on next request.
import fs from "node:fs";
import path from "node:path";
const dir = path.join(process.cwd(), "data");
for (const f of ["soundcy.db", "soundcy.db-wal", "soundcy.db-shm"]) {
  const p = path.join(dir, f);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}
console.log("Database reset. Restart the server to re-seed with fresh sample data.");
