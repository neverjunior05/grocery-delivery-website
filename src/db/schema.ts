import { pgTable, serial, text, timestamp, integer, numeric, boolean, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("customer"), // 'customer' | 'delivery' | 'admin'
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"), // icon name or emoji
  color: text("color"), // warm/earthy theme
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "cascade" }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(), // e.g., "per kg", "500g pack", "per dozen"
  stockQuantity: integer("stock_quantity").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(10),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  inStock: boolean("in_stock").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  badge: text("badge"), // e.g., "Organic", "Fresh Pick", "Bestseller"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const deliverySlots = pgTable("delivery_slots", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD
  timeWindow: text("time_window").notNull(), // e.g. "Today 4:00 PM - 6:00 PM", "Tomorrow 9:00 AM - 11:00 AM"
  maxCapacity: integer("max_capacity").notNull().default(10),
  bookedCount: integer("booked_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  deliverySlot: text("delivery_slot").notNull(),
  slotId: integer("slot_id").references(() => deliverySlots.id, { onDelete: "set null" }),
  // Status flow: Placed -> Packed -> Out for Delivery -> Delivered (or Cancelled)
  status: text("status").notNull().default("Placed"), 
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: numeric("delivery_fee", { precision: 10, scale: 2 }).notNull().default("0.00"),
  discount: numeric("discount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull().default("Sandbox Card"), // "Sandbox Card", "Razorpay Mock", "COD"
  paymentStatus: text("payment_status").notNull().default("Paid"), // "Paid", "Pending"
  items: jsonb("items").notNull(), // [{ productId, name, price, unit, quantity, imageUrl, subtotal }]
  assignedStaffId: integer("assigned_staff_id").references(() => users.id, { onDelete: "set null" }),
  assignedStaffName: text("assigned_staff_name"),
  statusHistory: jsonb("status_history").notNull(), // [{ status, timestamp, note, updatedBy }]
  customerNotes: text("customer_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
