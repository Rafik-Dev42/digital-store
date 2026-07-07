import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { getInsertId } from "./lib/insert-id";
import { orders, orderItems, products } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const orderRouter = createRouter({
  create: authedQuery
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.number(),
            price: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user.id;
      const totalAmount = input.items.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2);

      const orderResult = await db.insert(orders).values({
        userId,
        totalAmount,
        status: "pending",
      });

      const orderId = getInsertId(orderResult);

      await db.insert(orderItems).values(
        input.items.map((item) => ({
          orderId,
          productId: item.productId,
          priceAtPurchase: item.price,
        }))
      );

      return { orderId, totalAmount };
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      if (!order[0] || order[0].userId !== ctx.user.id) return null;

      const items = await db
        .select({
          id: orderItems.id,
          priceAtPurchase: orderItems.priceAtPurchase,
          product: products,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, input.id));

      return { ...order[0], items: items.filter((i) => i.product !== null) };
    }),

  myOrders: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(orders)
      .where(eq(orders.userId, ctx.user.id))
      .orderBy(desc(orders.createdAt));
  }),

  updateStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "completed", "failed", "refunded"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(orders).set({ status: input.status }).where(eq(orders.id, input.id));
      return { success: true };
    }),

  stats: adminQuery.query(async () => {
    const db = getDb();
    const totalResult = await db.select({ count: sql<number>`count(*)`, revenue: sql<number>`COALESCE(SUM(totalAmount), 0)` }).from(orders);
    const pendingResult = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "pending"));
    const completedResult = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "completed"));

    return {
      totalOrders: totalResult[0]?.count ?? 0,
      totalRevenue: totalResult[0]?.revenue ?? 0,
      pendingOrders: pendingResult[0]?.count ?? 0,
      completedOrders: completedResult[0]?.count ?? 0,
    };
  }),
});
