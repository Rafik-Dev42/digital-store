import { authRouter } from "./auth-router";
import { localAuthRouter } from "./local-auth-router";
import { productRouter } from "./product-router";
import { cartRouter } from "./cart-router";
import { orderRouter } from "./order-router";
import { reviewRouter } from "./review-router";
import { feedbackRouter } from "./feedback-router";
import { communityRouter } from "./community-router";
import { contactRouter } from "./contact-router";
import { adminRouter } from "./admin-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  product: productRouter,
  cart: cartRouter,
  order: orderRouter,
  review: reviewRouter,
  feedback: feedbackRouter,
  community: communityRouter,
  contact: contactRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
