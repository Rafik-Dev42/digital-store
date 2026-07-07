import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { getInsertId } from "./lib/insert-id";
import { feedback } from "@db/schema";
import { desc, eq, sql } from "drizzle-orm";

export const feedbackRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        message: z.string().min(1),
        rating: z.number().min(1).max(5).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(feedback).values({
        name: input.name,
        email: input.email,
        message: input.message,
        rating: input.rating ?? null,
        isPublic: true,
      });
      return { success: true, id: getInsertId(result) };
    }),

  list: publicQuery
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(12),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { page, limit } = input ?? { page: 1, limit: 12 };
      const offset = (page - 1) * limit;

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(feedback)
        .where(eq(feedback.isPublic, true));
      const total = totalResult[0]?.count ?? 0;

      const items = await db
        .select()
        .from(feedback)
        .where(eq(feedback.isPublic, true))
        .orderBy(desc(feedback.createdAt))
        .limit(limit)
        .offset(offset);

      return { feedback: items, total };
    }),
});
