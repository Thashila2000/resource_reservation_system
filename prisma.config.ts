import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { defineConfig, env } from "prisma/config";

/**
 * Prisma v7 configuration file.
 * The database connection URL has moved here from schema.prisma.
 * See: https://pris.ly/d/config-datasource
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
