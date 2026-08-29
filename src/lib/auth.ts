import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { db } from "../db";
import * as schema from "../db/schema";

export const auth = betterAuth({
  appName: "Hackathon",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    database: {
      joins: true,
    },
  },
  // Keep this last so Server Actions can return session cookies correctly.
  plugins: [nextCookies()],
});
