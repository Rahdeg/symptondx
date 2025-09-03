import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Ensure we load the environment variables properly
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not defined in environment variables");
  console.log("📝 Please check your .env.local file or environment setup");
  process.exit(1);
}

export default defineConfig({
  out: "./drizzle",
  schema: ["./src/db/schema.ts", "./src/db/ml-schema.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
});
