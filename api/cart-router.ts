import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { cartItems, products } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const cartRouter = createRouter({
  get: publicQuery
    .input(z.object({ sessionId: z.string().optional(), userId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const userId = input?.userId ?? ctx.user?.id;
      const sessionId = input?.sessionId;

      let items;
      if (userId) {
        items = await db
          .select({
            id: cartItems.id,
            quantity: cartItems.quantity,
            createdAt: cartItems.createdAt,
            product: products,
          })
          .from(cartItems)
          .leftJoin(products, eq(cartItems.productId, products.id))
          .where(eq(cartItems.userId, userId));
      } else if (sessionId) {
        items = await db
          .select({
            id: cartItems.id,
            quantity: cartItems.quantity,
            createdAt: cartItems.createdAt,
            product: products,
          })
          .from(cartItems)
          .leftJoin(products, eq(cartItems.productId, products.id))
          .where(eq(cartItems.sessionId, sessionId));
      } else {
        return [];
      }

      return items.filter((item) => item.product !== null);
    }),

  add: publicQuery
    .input(z.object({ productId: z.number(), sessionId: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user?.id;
      const { productId, sessionId } = input;

      // Check if item already in cart
      let existing;
      if (userId) {
        existing = await db
          .select()
          .from(cartItems)
          .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
          .limit(1);
      } else if (sessionId) {
        existing = await db
          .select()
          .from(cartItems)
          .where(and(eq(cartItems.sessionId, sessionId), eq(cartItems.productId, productId)))
          .limit(1);
      }

      if (existing && existing[0]) {
        await db
          .update(cartItems)
          .set({ quantity: existing[0].quantity + 1 })
          .where(eq(cartItems.id, existing[0].id));
        return { success: true, action: "updated" };
      }

      await db.insert(cartItems).values({
        userId: userId ?? null,
        sessionId: sessionId ?? null,
        productId,
        quantity: 1,
      });

      return { success: true, action: "added" };
    }),

  remove: publicQuery
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(cartItems).where(eq(cartItems.id, input.itemId));
      return { success: true };
    }),

  clear: publicQuery
    .input(z.object({ sessionId: z.string().optional(), userId: z.number().optional() }).optional())
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = input?.userId ?? ctx.user?.id;
      const sessionId = input?.sessionId;

      if (userId) {
        await db.delete(cartItems).where(eq(cartItems.userId, userId));
      } else if (sessionId) {
        await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
      }

      return { success: true };
    }),
});
