import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { getInsertId } from "./lib/insert-id";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nexus-local-auth-secret-key-2024"
);

async function createToken(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifyLocalToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    return payload.sub ? parseInt(payload.sub, 10) : null;
  } catch {
    return null;
  }
}

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Check if email already exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existing[0]) {
        return { success: false, error: "Email already registered" };
      }

      const hashedPassword = await hash(input.password, 12);

      const result = await db.insert(users).values({
        name: input.name,
        email: input.email,
        password: hashedPassword,
        authType: "local",
        role: "user",
      });

      const userId = getInsertId(result);
      const token = await createToken(userId);

      return { success: true, token, userId };
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (!user[0] || !user[0].password) {
        return { success: false, error: "Invalid email or password" };
      }

      const valid = await compare(input.password, user[0].password);
      if (!valid) {
        return { success: false, error: "Invalid email or password" };
      }

      const token = await createToken(user[0].id);

      return {
        success: true,
        token,
        user: {
          id: user[0].id,
          name: user[0].name,
          email: user[0].email,
          avatar: user[0].avatar,
          role: user[0].role,
        },
      };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const req = ctx.req;
    const authHeader = req.headers.get("x-local-auth-token");

    if (!authHeader) return null;

    const userId = await verifyLocalToken(authHeader);
    if (!userId) return null;

    const db = getDb();
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]) return null;

    return {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      avatar: user[0].avatar,
      role: user[0].role,
      authType: user[0].authType,
    };
  }),
});
