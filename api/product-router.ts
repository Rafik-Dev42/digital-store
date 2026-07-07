import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products, categories, reviews, users } from "@db/schema";
import { eq, like, and, desc, asc, sql } from "drizzle-orm";

export const productRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        sort: z.enum(["newest", "price-asc", "price-desc", "popular", "rating"]).optional().default("newest"),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(12),
        featured: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { category, search, sort, page, limit, featured } = input ?? {};
      const offset = ((page ?? 1) - 1) * (limit ?? 12);

      const conditions = [];
      if (category) {
        const cat = await db.select().from(categories).where(eq(categories.slug, category)).limit(1);
        if (cat[0]) {
          conditions.push(eq(products.categoryId, cat[0].id));
        }
      }
      if (search) {
        conditions.push(like(products.title, `%${search}%`));
      }
      if (featured !== undefined) {
        conditions.push(eq(products.isFeatured, featured));
      }
      conditions.push(eq(products.isPublished, true));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      let orderBy;
      switch (sort) {
        case "price-asc":
          orderBy = asc(products.price);
          break;
        case "price-desc":
          orderBy = desc(products.price);
          break;
        case "popular":
          orderBy = desc(products.salesCount);
          break;
        case "rating":
          orderBy = desc(products.rating);
          break;
        default:
          orderBy = desc(products.createdAt);
      }

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(whereClause);
      const total = totalResult[0]?.count ?? 0;

      const productList = await db
        .select()
        .from(products)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit ?? 12)
        .offset(offset);

      return { products: productList, total };
    }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const product = await db
        .select()
        .from(products)
        .where(eq(products.slug, input.slug))
        .limit(1);

      if (!product[0]) return null;

      const category = product[0].categoryId
        ? await db.select().from(categories).where(eq(categories.id, product[0].categoryId)).limit(1)
        : [];

      const productReviews = await db
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
        .where(eq(reviews.productId, product[0].id))
        .orderBy(desc(reviews.createdAt));

      return {
        ...product[0],
        category: category[0] ?? null,
        reviews: productReviews,
      };
    }),

  getFeatured: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(products)
      .where(and(eq(products.isFeatured, true), eq(products.isPublished, true)))
      .orderBy(desc(products.createdAt))
      .limit(6);
  }),

  getCategories: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(categories).orderBy(asc(categories.name));
  }),

  create: adminQuery
    .input(
      z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().min(1),
        shortDesc: z.string().optional(),
        price: z.string(),
        categoryId: z.number().optional(),
        image: z.string().optional(),
        previewUrl: z.string().optional(),
        fileUrl: z.string().optional(),
        fileSize: z.string().optional(),
        fileType: z.string().optional(),
        tags: z.array(z.string()).optional(),
        isFeatured: z.boolean().optional(),
        licenseType: z.string().optional(),
        version: z.string().optional(),
        requirements: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(products).values({
        ...input,
        creatorId: 1,
        isPublished: true,
      });
      return result;
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        shortDesc: z.string().optional(),
        price: z.string().optional(),
        categoryId: z.number().optional(),
        image: z.string().optional(),
        previewUrl: z.string().optional(),
        fileUrl: z.string().optional(),
        fileSize: z.string().optional(),
        fileType: z.string().optional(),
        tags: z.array(z.string()).optional(),
        isFeatured: z.boolean().optional(),
        isPublished: z.boolean().optional(),
        licenseType: z.string().optional(),
        version: z.string().optional(),
        requirements: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const db = getDb();
      await db.update(products).set(data).where(eq(products.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),
});
