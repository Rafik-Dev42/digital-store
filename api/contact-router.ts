import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { getInsertId } from "./lib/insert-id";
import { contactMessages } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const contactRouter = createRouter({
  submit: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        subject: z.string().min(1),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(contactMessages).values({
        name: input.name,
        email: input.email,
        subject: input.subject,
        message: input.message,
      });
      return { success: true, id: getInsertId(result) };
    }),

  list: adminQuery
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
        status: z.enum(["new", "read", "replied"]).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { page, limit, status } = input ?? { page: 1, limit: 20, status: undefined };
      const offset = (page - 1) * limit;

      const conditions = [];
      if (status) {
        conditions.push(eq(contactMessages.status, status));
      }

      const whereClause = conditions.length > 0 ? conditions[0] : undefined;

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(contactMessages);
      const total = totalResult[0]?.count ?? 0;

      const messages = await db
        .select()
        .from(contactMessages)
        .where(whereClause)
        .orderBy(desc(contactMessages.createdAt))
        .limit(limit)
        .offset(offset);

      return { messages, total };
    }),

  updateStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["new", "read", "replied"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(contactMessages)
        .set({ status: input.status })
        .where(eq(contactMessages.id, input.id));
      return { success: true };
    }),
});
