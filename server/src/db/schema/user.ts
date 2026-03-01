import { boolean, date, integer, pgEnum, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum('user_role', ['admin', 'user', 'doctor']);

export const users = pgTable('users',{
    id: uuid('id').defaultRandom().primaryKey(),
    firstName: varchar("first_name",{ length: 50 }).notNull(),
    lastName: varchar("last_name",{ length: 50 }).notNull(),
    email: varchar("email",{ length: 60 }).unique("unique_email").notNull(),
    password: text("password").notNull(),
    isVerified: boolean("is_verified").default(false).notNull(),
    verifiedToken: text("verified_token").default(""),
    resetToken: text("reset_token").default(""),
    resetTokenExpired: date("reset_token_expired"),
    tokenVersion: integer("token_version").default(0).notNull(),
    role: roleEnum('role').default('user').notNull(),
})