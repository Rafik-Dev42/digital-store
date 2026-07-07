import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, products, orders, feedback, communityPosts, contactMessages } from "@db/schema";
import { eq, desc, sql, like } from "drizzle-orm";

export const adminRouter = createRouter({
  stats: adminQuery.query(async () => {
    const db = getDb();

    const usersCount = await db.select({ count: sql<number>`count(*)` }).from(users);
    const productsCount = await db.select({ count: sql<number>`count(*)` }).from(products);
    const ordersCount = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const revenueResult = await db
      .select({ total: sql<number>`COALESCE(SUM(totalAmount), 0)` })
      .from(orders)
      .where(eq(orders.status, "completed"));
    const feedbackCount = await db.select({ count: sql<number>`count(*)` }).from(feedback);
    const postsCount = await db.select({ count: sql<number>`count(*)` }).from(communityPosts);
    const messagesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(contactMessages)
      .where(eq(contactMessages.status, "new"));

    // Recent orders
    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(10);

    // Top products by sales
    const topProducts = await db
      .select()
      .from(products)
      .orderBy(desc(products.salesCount))
      .limit(5);

    return {
      totalUsers: usersCount[0]?.count ?? 0,
      totalProducts: productsCount[0]?.count ?? 0,
      totalOrders: ordersCount[0]?.count ?? 0,
      totalRevenue: revenueResult[0]?.total ?? 0,
      totalFeedback: feedbackCount[0]?.count ?? 0,
      totalCommunityPosts: postsCount[0]?.count ?? 0,
      newMessages: messagesCount[0]?.count ?? 0,
      recentOrders,
      topProducts,
    };
  }),

  users: adminQuery
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { page, limit, search } = input ?? { page: 1, limit: 20, search: undefined };
      const offset = (page - 1) * limit;

      let whereClause;
      if (search) {
        whereClause = like(users.name, `%${search}%`);
      }

      const totalResult = await db.select({ count: sql<number>`count(*)` }).from(users);
      const total = totalResult[0]?.count ?? 0;

      const userList = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
          role: users.role,
          authType: users.authType,
          createdAt: users.createdAt,
          lastSignInAt: users.lastSignInAt,
        })
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

      return { users: userList, total };
    }),

  updateUserRole: adminQuery
    .input(z.object({ id: z.number(), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(users).set({ role: input.role }).where(eq(users.id, input.id));
      return { success: true };
    }),

  orders: adminQuery
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
        status: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { page, limit, status } = input ?? { page: 1, limit: 20, status: undefined };
      const offset = (page - 1) * limit;

      let whereClause;
      if (status) {
        whereClause = eq(orders.status, status as "pending" | "completed" | "failed" | "refunded");
      }

      const totalResult = await db.select({ count: sql<number>`count(*)` }).from(orders);
      const total = totalResult[0]?.count ?? 0;

      const orderList = await db
        .select()
        .from(orders)
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);

      return { orders: orderList, total };
    }),
});
