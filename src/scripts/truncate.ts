import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import * as schema from "../models/schema.js";

const db = drizzle(process.env.DATABASE_URL!);

async function truncateAll() {
  const tableNames = Object.values(schema)
    .filter((t: any) => t?.["$inferSelect"] !== undefined)
    .map((t: any) => t._.name);

  for (const table of tableNames) {
    await db.execute(sql.raw(`TRUNCATE TABLE "${table}" CASCADE`));
    console.log(`Truncated: ${table}`);
  }

  process.exit(0);
}

truncateAll();