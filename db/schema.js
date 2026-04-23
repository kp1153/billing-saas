import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// TENANTS (दुकानें)
export const tenants = sqliteTable('tenants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  ownerEmail: text('owner_email').notNull().unique(),
  phone: text('phone'),
  address: text('address'),
  gstin: text('gstin'),
  logoUrl: text('logo_url'),
  plan: text('plan').notNull().default('free'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// USERS (मालिक / स्टाफ)
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').references(() => tenants.id),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  avatarUrl: text('avatar_url'),
  role: text('role').notNull().default('owner'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// PRODUCTS (सामान / आइटम) — currentStock जोड़ा
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  unit: text('unit').notNull().default('pcs'),
  pricePerUnit: integer('price_per_unit').notNull().default(0),
  gstPercent: integer('gst_percent').notNull().default(0),
  currentStock: integer('current_stock').notNull().default(0),   // नया ✓
  minStock: integer('min_stock').notNull().default(5),           // नया ✓
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// CUSTOMERS (ग्राहक)
export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// INVOICES (बिल) — paymentMode जोड़ा
export const invoices = sqliteTable('invoices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  customerId: integer('customer_id').references(() => customers.id),
  invoiceNumber: text('invoice_number').notNull(),
  status: text('status').notNull().default('unpaid'),
  paymentMode: text('payment_mode').notNull().default('cash'), // नया ✓
  totalAmount: integer('total_amount').notNull().default(0),
  gstAmount: integer('gst_amount').notNull().default(0),
  discount: integer('discount').notNull().default(0),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// INVOICE ITEMS (बिल की लाइनें)
export const invoiceItems = sqliteTable('invoice_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoiceId: integer('invoice_id').notNull().references(() => invoices.id),
  productId: integer('product_id').references(() => products.id),
  name: text('name').notNull(),
  quantity: integer('quantity').notNull().default(1),
  pricePerUnit: integer('price_per_unit').notNull(),
  gstPercent: integer('gst_percent').notNull().default(0),
  total: integer('total').notNull(),
})
export const preActivations = sqliteTable('pre_activations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})
