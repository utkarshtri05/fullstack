import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as relations from "./relations";
import * as schema from "./schema";

type Schema = typeof schema & typeof relations;

declare global {
  // eslint-disable-next-line no-var
  var __drawcareDb: PostgresJsDatabase<Schema> | undefined;
  // eslint-disable-next-line no-var
  var __drawcareSql: postgres.Sql | undefined;
}

export function getDb() {
  if (globalThis.__drawcareDb) {
    return globalThis.__drawcareDb;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for database access");
  }

  const client =
    globalThis.__drawcareSql ??
    postgres(databaseUrl, {
      max: 10,
      prepare: false,
      idle_timeout: 20
    });

  const db = drizzle(client, {
    schema: { ...schema, ...relations }
  });

  if (process.env.NODE_ENV !== "production") {
    globalThis.__drawcareSql = client;
    globalThis.__drawcareDb = db;
  }

  return db;
}
