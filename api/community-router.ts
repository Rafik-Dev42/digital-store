import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { getInsertId } from "./lib/insert-id";
import { communityPosts, communityComments, users } from "@db/schema";
import { desc, eq, sql, and } from "drizzle-orm";

export const communityRouter = createRouter({
  createPost: authedQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        category: z.enum(["question", "discussion", "showcase"]).default("discussion"),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const result = await db.insert(communityPosts).values({
        title: input.title,
        content: input.content,
        userId: ctx.user.id,
        category: input.category,
        tags: input.tags ?? [],
      });
      return { success: true, id: getInsertId(result) };
    }),

  listPosts: publicQuery
    .input(
      z.object({
        category: z.string().optional(),
        sort: z.enum(["newest", "popular", "top"]).optional().default("newest"),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(10),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { category, sort, page, limit } = input ?? { category: undefined, sort: "newest", page: 1, limit: 10 };
      const offset = (page - 1) * limit;

      const conditions = [];
      if (category) {
        conditions.push(eq(communityPosts.category, category));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      let orderBy;
      switch (sort) {
        case "popular":
          orderBy = desc(communityPosts.views);
          break;
        case "top":
          orderBy = desc(communityPosts.upvotes);
          break;
        default:
          orderBy = desc(communityPosts.createdAt);
      }

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(communityPosts)
        .where(whereClause);
      const total = totalResult[0]?.count ?? 0;

      const posts = await db
        .select({
          id: communityPosts.id,
          title: communityPosts.title,
          content: communityPosts.content,
          category: communityPosts.category,
          tags: communityPosts.tags,
          upvotes: communityPosts.upvotes,
          views: communityPosts.views,
          isPinned: communityPosts.isPinned,
          createdAt: communityPosts.createdAt,
          updatedAt: communityPosts.updatedAt,
          userName: users.name,
          userAvatar: users.avatar,
        })
        .from(communityPosts)
        .leftJoin(users, eq(communityPosts.userId, users.id))
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      return { posts, total };
    }),

  getPost: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const post = await db
        .select({
          id: communityPosts.id,
          title: communityPosts.title,
          content: communityPosts.content,
          category: communityPosts.category,
          tags: communityPosts.tags,
          upvotes: communityPosts.upvotes,
          views: communityPosts.views,
          isPinned: communityPosts.isPinned,
          createdAt: communityPosts.createdAt,
          updatedAt: communityPosts.updatedAt,
          userName: users.name,
          userAvatar: users.avatar,
        })
        .from(communityPosts)
        .leftJoin(users, eq(communityPosts.userId, users.id))
        .where(eq(communityPosts.id, input.id))
        .limit(1);

      if (!post[0]) return null;

      // Increment views
      await db
        .update(communityPosts)
        .set({ views: (post[0].views ?? 0) + 1 })
        .where(eq(communityPosts.id, input.id));

      const comments = await db
        .select({
          id: communityComments.id,
          content: communityComments.content,
          upvotes: communityComments.upvotes,
          createdAt: communityComments.createdAt,
          userName: users.name,
          userAvatar: users.avatar,
        })
        .from(communityComments)
        .leftJoin(users, eq(communityComments.userId, users.id))
        .where(eq(communityComments.postId, input.id))
        .orderBy(desc(communityComments.createdAt));

      return { ...post[0], views: (post[0].views ?? 0) + 1, comments };
    }),

  createComment: authedQuery
    .input(z.object({ postId: z.number(), content: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.insert(communityComments).values({
        postId: input.postId,
        userId: ctx.user.id,
        content: input.content,
      });
      return { success: true };
    }),

  upvotePost: authedQuery
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const post = await db
        .select()
        .from(communityPosts)
        .where(eq(communityPosts.id, input.postId))
        .limit(1);

      if (!post[0]) return { success: false };

      await db
        .update(communityPosts)
        .set({ upvotes: (post[0].upvotes ?? 0) + 1 })
        .where(eq(communityPosts.id, input.postId));

      return { success: true };
    }),
});
