import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";
import { verifyLocalToken } from "./local-auth-router";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Try OAuth first
  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // OAuth auth failed, try local auth
  }

  // Try local auth token if no OAuth user
  if (!ctx.user) {
    try {
      const localToken = opts.req.headers.get("x-local-auth-token");
      if (localToken) {
        const userId = await verifyLocalToken(localToken);
        if (userId) {
          const db = getDb();
          const user = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
          if (user[0]) {
            ctx.user = user[0];
          }
        }
      }
    } catch {
      // Local auth failed
    }
  }

  return ctx;
}
