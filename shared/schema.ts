import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  password: varchar("password"), // Added for custom auth
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const appointmentStatusEnum = pgEnum('appointment_status', ['pending', 'confirmed', 'completed', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed', 'refunded']);
export const docusignStatusEnum = pgEnum('docusign_status', ['not_sent', 'sent', 'signed', 'declined']);

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  fullName: varchar("full_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  address: text("address").notNull(),
  preferredDate: timestamp("preferred_date").notNull(),
  preferredTime: varchar("preferred_time"),
  status: appointmentStatusEnum("status").default('pending'),
  paymentStatus: paymentStatusEnum("payment_status").default('pending'),
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }).default('225.00'),
  paymentId: varchar("payment_id"),
  docusignStatus: docusignStatusEnum("docusign_status").default('not_sent'),
  docusignEnvelopeId: varchar("docusign_envelope_id"),
  isReady: boolean("is_ready").default(false),
  titleProtectionAddon: boolean("title_protection_addon").default(false),
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailLogs = pgTable("email_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  emailType: varchar("email_type").notNull(), // 'confirmation', 'reminder', 'docusign'
  sentTo: varchar("sent_to").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  status: varchar("status").default('sent'), // 'sent', 'failed'
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).extend({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Complete address is required"),
  preferredDate: z.string().or(z.date()).transform((val) => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
  preferredTime: z.string().optional(),
  isReady: z.boolean().refine(val => val === true, "You must confirm readiness to proceed"),
}).pick({
  fullName: true,
  email: true,
  phone: true,
  address: true,
  preferredDate: true,
  preferredTime: true,
  isReady: true,
});

export const updateAppointmentSchema = createInsertSchema(appointments).partial();

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type UpdateAppointment = z.infer<typeof updateAppointmentSchema>;
export type EmailLog = typeof emailLogs.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;