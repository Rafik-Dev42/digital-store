import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  int,
  bigint,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  authType: mysqlEnum("authType", ["oauth", "local"]).default("oauth"),
  password: varchar("password", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Categories ──────────────────────────────────────────────────
export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;

// ─── Products ────────────────────────────────────────────────────
export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  shortDesc: varchar("shortDesc", { length: 500 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: bigint("categoryId", { mode: "number", unsigned: true }).references(() => categories.id),
  creatorId: bigint("creatorId", { mode: "number", unsigned: true }).references(() => users.id),
  image: text("image"),
  previewUrl: text("previewUrl"),
  fileUrl: text("fileUrl"),
  fileSize: varchar("fileSize", { length: 50 }),
  fileType: varchar("fileType", { length: 50 }),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  reviewCount: int("reviewCount").default(0),
  salesCount: int("salesCount").default(0),
  tags: json("tags").$type<string[]>(),
  isFeatured: boolean("isFeatured").default(false),
  isPublished: boolean("isPublished").default(true),
  licenseType: varchar("licenseType", { length: 100 }).default("Personal"),
  version: varchar("version", { length: 50 }),
  requirements: text("requirements"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Product = typeof products.$inferSelect;

// ─── Reviews ─────────────────────────────────────────────────────
export const reviews = mysqlTable("reviews", {
  id: serial("id").primaryKey(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull().references(() => products.id),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  rating: int("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;

// ─── Cart Items ──────────────────────────────────────────────────
export const cartItems = mysqlTable("cartItems", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).references(() => users.id),
  sessionId: varchar("sessionId", { length: 255 }),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull().references(() => products.id),
  quantity: int("quantity").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;

// ─── Orders ──────────────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;

// ─── Order Items ─────────────────────────────────────────────────
export const orderItems = mysqlTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).notNull().references(() => orders.id),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull().references(() => products.id),
  priceAtPurchase: decimal("priceAtPurchase", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;

// ─── Feedback ────────────────────────────────────────────────────
export const feedback = mysqlTable("feedback", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  message: text("message").notNull(),
  rating: int("rating"),
  isPublic: boolean("isPublic").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Feedback = typeof feedback.$inferSelect;

// ─── Community Posts ─────────────────────────────────────────────
export const communityPosts = mysqlTable("communityPosts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  category: varchar("category", { length: 50 }).default("discussion"),
  tags: json("tags").$type<string[]>(),
  upvotes: int("upvotes").default(0),
  views: int("views").default(0),
  isPinned: boolean("isPinned").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type CommunityPost = typeof communityPosts.$inferSelect;

// ─── Community Comments ──────────────────────────────────────────
export const communityComments = mysqlTable("communityComments", {
  id: serial("id").primaryKey(),
  postId: bigint("postId", { mode: "number", unsigned: true }).notNull().references(() => communityPosts.id),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  content: text("content").notNull(),
  upvotes: int("upvotes").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommunityComment = typeof communityComments.$inferSelect;

// ─── Contact Messages ────────────────────────────────────────────
export const contactMessages = mysqlTable("contactMessages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "read", "replied"]).default("new"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
