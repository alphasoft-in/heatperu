import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, integer, text, serial, boolean, timestamp } from 'drizzle-orm/pg-core';

const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url").notNull(),
  visits: integer("visits").default(0).notNull()
});
const subcategories = pgTable("subcategories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url").notNull()
});
const products = pgTable("products", {
  id: serial("id").primaryKey(),
  subcategoryId: integer("subcategory_id").references(() => subcategories.id).notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sku: text("sku").notNull(),
  brand: text("brand").notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  imageUrl: text("image_url").notNull()
});
const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  order: integer("order").default(0).notNull()
});
const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug"),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  executionDate: text("execution_date"),
  gallery: text("gallery").default("[]").notNull(),
  order: integer("order").default(0).notNull()
});
const tutorialCategories = pgTable("tutorial_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url").notNull(),
  order: integer("order").default(0).notNull()
});
const tutorialSubcategories = pgTable("tutorial_subcategories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => tutorialCategories.id).notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  order: integer("order").default(0).notNull()
});
const tutorials = pgTable("tutorials", {
  id: serial("id").primaryKey(),
  subcategoryId: integer("subcategory_id").references(() => tutorialSubcategories.id),
  title: text("title").notNull(),
  slug: text("slug"),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  videoUrl: text("video_url").notNull(),
  executionDate: text("execution_date"),
  views: integer("views").default(0).notNull(),
  order: integer("order").default(0).notNull()
});
const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  consumerName: text("consumer_name").notNull(),
  documentType: text("document_type").notNull(),
  documentNumber: text("document_number").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  productType: text("product_type").notNull(),
  amount: text("amount").notNull(),
  productDescription: text("product_description").notNull(),
  complaintType: text("complaint_type").notNull(),
  complaintDetail: text("complaint_detail").notNull(),
  consumerRequest: text("consumer_request").notNull(),
  status: text("status").default("Pendiente").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  status: text("status").default("Activo").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

const schema = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  categories,
  complaints,
  products,
  projects,
  services,
  subcategories,
  subscribers,
  tutorialCategories,
  tutorialSubcategories,
  tutorials
}, Symbol.toStringTag, { value: 'Module' }));

const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": undefined, "SSR": true};
let connectionString;
if (typeof process !== "undefined" && process.env.DATABASE_URL) {
  connectionString = process.env.DATABASE_URL;
} else if (typeof import.meta !== "undefined" && Object.assign(__vite_import_meta_env__, { DATABASE_URL: "postgresql://neondb_owner:npg_YLR5EGHXkvW1@ep-delicate-cell-ai21kn9i-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require" }) && "postgresql://neondb_owner:npg_YLR5EGHXkvW1@ep-delicate-cell-ai21kn9i-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require") {
  connectionString = "postgresql://neondb_owner:npg_YLR5EGHXkvW1@ep-delicate-cell-ai21kn9i-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";
}
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}
const sql = neon(connectionString);
const db = drizzle(sql, { schema });

export { projects as a, complaints as b, categories as c, db as d, services as e, subscribers as f, tutorialSubcategories as g, tutorials as h, products as p, subcategories as s, tutorialCategories as t };
