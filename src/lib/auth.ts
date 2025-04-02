import { db } from "@/server/db"; // your drizzle instance
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql", // or "pg", "sqlite"
  }),
  emailAndPassword: {
    enabled: true,
  },
});
