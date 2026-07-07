import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";

const timestamp = (name: string) =>
  integer(name, { mode: "timestamp_ms" })
    .default(sql`(unixepoch() * 1000)`)
    .notNull();

// ─── Users ───────────────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  unionId: text("unionId").unique(),
  name: text("name"),
  email: text("email"),
  avatar: text("avatar"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  authType: text("authType", { enum: ["oauth", "local"] }).default("oauth"),
  password: text("password"),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
  lastSignInAt: timestamp("lastSignInAt"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Categories ──────────────────────────────────────────────────
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  createdAt: timestamp("createdAt"),
});

export type Category = typeof categories.$inferSelect;

// ─── Products ────────────────────────────────────────────────────
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  shortDesc: text("shortDesc"),
  price: text("price").notNull(),
  categoryId: integer("categoryId").references(() => categories.id),
  creatorId: integer("creatorId").references(() => users.id),
  image: text("image"),
  previewUrl: text("previewUrl"),
  fileUrl: text("fileUrl"),
  fileSize: text("fileSize"),
  fileType: text("fileType"),
  rating: text("rating").default("5.0"),
  reviewCount: integer("reviewCount").default(0),
  salesCount: integer("salesCount").default(0),
  tags: text("tags", { mode: "json" }).$type<string[]>(),
  isFeatured: integer("isFeatured", { mode: "boolean" }).default(false),
  isPublished: integer("isPublished", { mode: "boolean" }).default(true),
  licenseType: text("licenseType").default("Personal"),
  version: text("version"),
  requirements: text("requirements"),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

export type Product = typeof products.$inferSelect;

// ─── Reviews ─────────────────────────────────────────────────────
export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("productId").notNull().references(() => products.id),
  userId: integer("userId").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("createdAt"),
});

export type Review = typeof reviews.$inferSelect;

// ─── Cart Items ──────────────────────────────────────────────────
export const cartItems = sqliteTable("cartItems", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").references(() => users.id),
  sessionId: text("sessionId"),
  productId: integer("productId").notNull().references(() => products.id),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("createdAt"),
});

export type CartItem = typeof cartItems.$inferSelect;

// ─── Orders ──────────────────────────────────────────────────────
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull().references(() => users.id),
  stripePaymentIntentId: text("stripePaymentIntentId"),
  totalAmount: text("totalAmount").notNull(),
  status: text("status", {
    enum: ["pending", "completed", "failed", "refunded"],
  }).default("pending"),
  createdAt: timestamp("createdAt"),
});

export type Order = typeof orders.$inferSelect;

// ─── Order Items ─────────────────────────────────────────────────
export const orderItems = sqliteTable("orderItems", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("orderId").notNull().references(() => orders.id),
  productId: integer("productId").notNull().references(() => products.id),
  priceAtPurchase: text("priceAtPurchase").notNull(),
  createdAt: timestamp("createdAt"),
});

export type OrderItem = typeof orderItems.$inferSelect;

// ─── Feedback ────────────────────────────────────────────────────
export const feedback = sqliteTable("feedback", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  rating: integer("rating"),
  isPublic: integer("isPublic", { mode: "boolean" }).default(true),
  createdAt: timestamp("createdAt"),
});

export type Feedback = typeof feedback.$inferSelect;

// ─── Community Posts ─────────────────────────────────────────────
export const communityPosts = sqliteTable("communityPosts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: integer("userId").notNull().references(() => users.id),
  category: text("category").default("discussion"),
  tags: text("tags", { mode: "json" }).$type<string[]>(),
  upvotes: integer("upvotes").default(0),
  views: integer("views").default(0),
  isPinned: integer("isPinned", { mode: "boolean" }).default(false),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

export type CommunityPost = typeof communityPosts.$inferSelect;

// ─── Community Comments ──────────────────────────────────────────
export const communityComments = sqliteTable("communityComments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("postId").notNull().references(() => communityPosts.id),
  userId: integer("userId").notNull().references(() => users.id),
  content: text("content").notNull(),
  upvotes: integer("upvotes").default(0),
  createdAt: timestamp("createdAt"),
});

export type CommunityComment = typeof communityComments.$inferSelect;

// ─── Contact Messages ────────────────────────────────────────────
export const contactMessages = sqliteTable("contactMessages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status", { enum: ["new", "read", "replied"] }).default("new"),
  createdAt: timestamp("createdAt"),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
