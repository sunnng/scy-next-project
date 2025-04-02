import { db } from "@/server/db"; // your drizzle instance
import {
  accounts,
  sessions,
  users,
  verifications,
} from "@/server/db/schema/auth-schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql", // or "pg", "sqlite",
    schema: {
      accounts,
      sessions,
      users,
      verifications,
    },
    //if all of them are just using plural form, you can just pass the option below
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
});
