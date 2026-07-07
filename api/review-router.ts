import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { getInsertId } from "./lib/insert-id";
import { reviews, users } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const reviewRouter = createRouter({
  create: authedQuery
    .input(
      z.object({
        productId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const result = await db.insert(reviews).values({
        productId: input.productId,
        userId: ctx.user.id,
        rating: input.rating,
        comment: input.comment,
      });
      return { success: true, id: getInsertId(result) };
    }),

  list: publicQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          comment: reviews.comment,
          createdAt: reviews.createdAt,
          userName: users.name,
          userAvatar: users.avatar,
        })
        .from(reviews)
        .leftJoin(users, eq(reviews.userId, users.id))
        .where(eq(reviews.productId, input.productId))
        .orderBy(desc(reviews.createdAt));
    }),
});
