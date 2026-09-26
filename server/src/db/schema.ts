import { pgTable, uuid, text, timestamp, date, numeric, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const riskLevelEnum = pgEnum('risk_level', ['low', 'medium', 'high']);
export const statusEnum = pgEnum('status', ['done', 'skipped']);
export const roleEnum = pgEnum('role', ['user', 'assistant']);

// 1. Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  name: text('name').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Fields Table
export const fields = pgTable('fields', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  crop_type: text('crop_type').notNull(),
  sowing_date: date('sowing_date').notNull(),
  soil_type: text('soil_type').notNull(),
  location: text('location').notNull(),
  latitude: numeric('latitude').notNull(),
  longitude: numeric('longitude').notNull(),
  acreage: numeric('acreage').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. Advisories Table
export const advisories = pgTable('advisories', {
  id: uuid('id').defaultRandom().primaryKey(),
  field_id: uuid('field_id')
    .notNull()
    .references(() => fields.id, { onDelete: 'cascade' }),
  irrigation_plan: text('irrigation_plan').notNull(),
  fertilizer_plan: jsonb('fertilizer_plan').notNull(),
  risk_level: text('risk_level', { enum: ['low', 'medium', 'high'] }).notNull(),
  risk_notes: text('risk_notes').notNull(),
  cost_of_inaction: text('cost_of_inaction').notNull(),
  plan_drift_detected: boolean('plan_drift_detected').default(false).notNull(),
  drift_explanation: text('drift_explanation'),
  next_check_in: date('next_check_in').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 4. Treatment Logs Table
export const treatment_logs = pgTable('treatment_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  advisory_id: uuid('advisory_id')
    .notNull()
    .references(() => advisories.id, { onDelete: 'cascade' }),
  action_taken: text('action_taken').notNull(),
  status: text('status', { enum: ['done', 'skipped'] }).notNull(),
  farmer_note: text('farmer_note'),
  done_at: timestamp('done_at', { withTimezone: true }).defaultNow().notNull(),
});

// 5. Chat Messages Table
export const chat_messages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  field_id: uuid('field_id')
    .notNull()
    .references(() => fields.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  message: text('message').notNull(),
  image_url: text('image_url'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations definitions
export const usersRelations = relations(users, ({ many }) => ({
  fields: many(fields),
}));

export const fieldsRelations = relations(fields, ({ one, many }) => ({
  user: one(users, {
    fields: [fields.user_id],
    references: [users.id],
  }),
  advisories: many(advisories),
  chat_messages: many(chat_messages),
}));

export const advisoriesRelations = relations(advisories, ({ one, many }) => ({
  field: one(fields, {
    fields: [advisories.field_id],
    references: [fields.id],
  }),
  treatment_logs: many(treatment_logs),
}));

export const treatmentLogsRelations = relations(treatment_logs, ({ one }) => ({
  advisory: one(advisories, {
    fields: [treatment_logs.advisory_id],
    references: [advisories.id],
  }),
}));

export const chatMessagesRelations = relations(chat_messages, ({ one }) => ({
  field: one(fields, {
    fields: [chat_messages.field_id],
    references: [fields.id],
  }),
}));

// Infer types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Field = typeof fields.$inferSelect;
export type NewField = typeof fields.$inferInsert;

export type Advisory = typeof advisories.$inferSelect;
export type NewAdvisory = typeof advisories.$inferInsert;

export type TreatmentLog = typeof treatment_logs.$inferSelect;
export type NewTreatmentLog = typeof treatment_logs.$inferInsert;

export type ChatMessage = typeof chat_messages.$inferSelect;
export type NewChatMessage = typeof chat_messages.$inferInsert;
