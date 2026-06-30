import { pgTable, serial, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  imageUrl: text('image_url').notNull(),
  visits: integer('visits').default(0).notNull(),
});

export const subcategories = pgTable('subcategories', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => categories.id).notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  imageUrl: text('image_url').notNull(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  subcategoryId: integer('subcategory_id').references(() => subcategories.id).notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  sku: text('sku').notNull(),
  brand: text('brand').notNull(),
  model: text('model'),
  description: text('description'),
  isAvailable: boolean('is_available').default(true).notNull(),
  imageUrl: text('image_url').notNull(),
  galleryUrls: text('gallery_urls').default('[]').notNull(),
  pdfUrl: text('pdf_url'),
});

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  order: integer('order').default(0).notNull(),
});

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug'),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  executionDate: text('execution_date'),
  gallery: text('gallery').default('[]').notNull(),
  order: integer('order').default(0).notNull(),
});

export const tutorialCategories = pgTable('tutorial_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  imageUrl: text('image_url').notNull(),
  order: integer('order').default(0).notNull(),
});

export const tutorialSubcategories = pgTable('tutorial_subcategories', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => tutorialCategories.id).notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  order: integer('order').default(0).notNull(),
});

export const tutorials = pgTable('tutorials', {
  id: serial('id').primaryKey(),
  subcategoryId: integer('subcategory_id').references(() => tutorialSubcategories.id),
  categoryId: integer('category_id').references(() => tutorialCategories.id),
  title: text('title').notNull(),
  slug: text('slug'),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  videoUrl: text('video_url').notNull(),
  executionDate: text('execution_date'),
  views: integer('views').default(0).notNull(),
  order: integer('order').default(0).notNull(),
});

export const complaints = pgTable('complaints', {
  id: serial('id').primaryKey(),
  consumerName: text('consumer_name').notNull(),
  documentType: text('document_type').notNull(),
  documentNumber: text('document_number').notNull(),
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  productType: text('product_type').notNull(),
  amount: text('amount').notNull(),
  productDescription: text('product_description').notNull(),
  complaintType: text('complaint_type').notNull(),
  complaintDetail: text('complaint_detail').notNull(),
  consumerRequest: text('consumer_request').notNull(),
  status: text('status').default('Pendiente').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const subscribers = pgTable('subscribers', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  status: text('status').default('Activo').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
