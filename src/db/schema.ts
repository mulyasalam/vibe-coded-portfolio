import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export type Social = { label: string; handle: string; href: string };

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  city: text("city").notNull(),
  locale: text("locale").notNull(),
  bio: text("bio").notNull(),
  longBio: text("long_bio").notNull(),
  cvUrl: text("cv_url"),
  cvName: text("cv_name"),
  cvSize: integer("cv_size"),
  cvUploadedAt: text("cv_uploaded_at"),
  socials: jsonb("socials").$type<Social[]>().notNull(),
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  client: text("client").notNull().default(""),
  category: text("category").notNull().default(""),
  year: integer("year").notNull(),
  linkUrl: text("link_url").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  techStack: jsonb("tech_stack").$type<string[]>().notNull(),
  summary: text("summary").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  readAt: text("read_at"),
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type DbUser = typeof users.$inferSelect;
export type DbProject = typeof projects.$inferSelect;
export type DbMessage = typeof messages.$inferSelect;
