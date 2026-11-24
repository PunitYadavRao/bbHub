import { randomBytes } from "node:crypto";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { CAMPUS_EMAIL_ERROR, matchCollegeByEmail } from "./domain-guard";
import { EMAIL_NOT_READY, emailConfigured, sendOtpEmail } from "./email";

export const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

function createAuth() {
  const db = getDb();

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: "pg", schema }),

    socialProviders: googleEnabled
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            // Requires a Google Workspace account; Better Auth also enforces the
            // returned `hd` claim. The exact college domain is checked below.
            hd: "*",
            prompt: "select_account",
          },
        }
      : {},

    user: {
      additionalFields: {
        username: { type: "string", required: false, input: false },
        displayUsername: { type: "string", required: false, input: false },
        collegeId: { type: "string", required: false, input: false },
        hostelId: { type: "string", required: false, input: false },
        batchYear: { type: "number", required: false, input: false },
        onboardingCompleted: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: false,
        },
        // Server-only fields: never included in session responses.
        authorToken: { type: "string", required: false, input: false, returned: false },
        isBanned: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: false,
          returned: false,
        },
      },
      // Runs for every sign-in method (Google, email OTP) before a user is created,
      // and again on each Google sign-in.
      validateUserInfo: async ({ user }) => {
        const college = user.email ? await matchCollegeByEmail(user.email) : null;
        if (!college) {
          return { error: "college_email_required", errorDescription: CAMPUS_EMAIL_ERROR };
        }
      },
    },

    databaseHooks: {
      user: {
        create: {
          before: async (newUser) => {
            const college = await matchCollegeByEmail(newUser.email);
            if (!college) {
              throw new APIError("FORBIDDEN", { message: CAMPUS_EMAIL_ERROR });
            }
            return {
              data: {
                ...newUser,
                // Drop the real Google name and photo straight away.
                name: "Anonymous Student",
                image: null,
                collegeId: college.id,
                authorToken: randomBytes(32).toString("hex"),
              },
            };
          },
        },
      },
      session: {
        create: {
          // Banned students can't start new sessions.
          before: async (newSession) => {
            const [row] = await db
              .select({ isBanned: schema.user.isBanned })
              .from(schema.user)
              .where(eq(schema.user.id, newSession.userId))
              .limit(1);
            if (row?.isBanned) return false;
          },
        },
      },
    },

    hooks: {
      // Reject non-campus addresses before a code is generated or an email is sent.
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== "/email-otp/send-verification-otp") return;
        const email = typeof ctx.body?.email === "string" ? ctx.body.email : "";
        if (!(await matchCollegeByEmail(email))) {
          throw new APIError("FORBIDDEN", { message: CAMPUS_EMAIL_ERROR });
        }
        // Better Auth logs send failures but still replies "success", so refuse
        // up front when no email provider is configured.
        if (!emailConfigured()) {
          throw new APIError("SERVICE_UNAVAILABLE", { message: EMAIL_NOT_READY });
        }
      }),
    },

    advanced: {
      // Netlify sets this header itself, so visitors can't fake their IP.
      ipAddress: { ipAddressHeaders: ["x-nf-client-connection-ip", "x-forwarded-for"] },
    },

    rateLimit: {
      // Stored in Postgres so limits hold across serverless instances.
      storage: "database",
      customRules: {
        "/email-otp/send-verification-otp": { window: 60, max: 3 },
        "/sign-in/email-otp": { window: 60, max: 10 },
      },
    },

    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: 300, // 5 minutes
        allowedAttempts: 5,
        async sendVerificationOTP({ email, otp, type }) {
          if (type !== "sign-in") return;
          await sendOtpEmail(email, otp);
        },
      }),
      nextCookies(),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;

const globalForAuth = globalThis as unknown as { __bbhubAuth?: Auth };

/** Created lazily so builds don't need database credentials. */
export function getAuth(): Auth {
  if (!globalForAuth.__bbhubAuth) {
    globalForAuth.__bbhubAuth = createAuth();
  }
  return globalForAuth.__bbhubAuth;
}
