import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./user.ts";

// Types for differentiate different token
export const tokenTypeEnum = pgEnum('token_type', ['VERIFICATION', 'PASSWORD_RESET']);

export const tokens = pgTable('tokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    token: text('token').notNull(), // Should be a hashed version for security
    type: tokenTypeEnum('type').notNull(),
    expiredAt: timestamp('expired_at', { withTimezone: true, mode: 'date' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});