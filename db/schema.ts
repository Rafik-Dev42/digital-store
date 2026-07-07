import * as mysql from "./schema.mysql";
import * as sqlite from "./schema.sqlite";

export const useSqlite = process.env.USE_SQLITE === "true";

function pick<T>(mysqlValue: T, sqliteValue: T): T {
  return useSqlite ? sqliteValue : mysqlValue;
}

export const users = pick(mysql.users, sqlite.users);
export const categories = pick(mysql.categories, sqlite.categories);
export const products = pick(mysql.products, sqlite.products);
export const reviews = pick(mysql.reviews, sqlite.reviews);
export const cartItems = pick(mysql.cartItems, sqlite.cartItems);
export const orders = pick(mysql.orders, sqlite.orders);
export const orderItems = pick(mysql.orderItems, sqlite.orderItems);
export const feedback = pick(mysql.feedback, sqlite.feedback);
export const communityPosts = pick(mysql.communityPosts, sqlite.communityPosts);
export const communityComments = pick(
  mysql.communityComments,
  sqlite.communityComments,
);
export const contactMessages = pick(
  mysql.contactMessages,
  sqlite.contactMessages,
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type CommunityComment = typeof communityComments.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
