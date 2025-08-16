import { execSync } from "child_process";
import logger from "../lib/logger";

async function migrate() {
  try {
    logger.info("Running database migrations...");

    // Generate Prisma client
    execSync("pnpm prisma generate", { stdio: "inherit" });

    // Run migrations
    execSync("pnpm prisma migrate deploy", { stdio: "inherit" });

    // Enable pgvector extension
    execSync(
      `pnpm prisma db execute --sql "CREATE EXTENSION IF NOT EXISTS vector"`,
      {
        stdio: "inherit",
      }
    );

    logger.info("Database migrations completed successfully");
  } catch (error) {
    logger.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();