import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum('user_role', ['admin', 'user', 'doctor']);

export const users = pgTable('users',{
    id: uuid('id').defaultRandom().primaryKey(),
    firstName: varchar("first_name",{ length: 50 }).notNull(),
    lastName: varchar("last_name",{ length: 50 }).notNull(),
    email: varchar("email",{ length: 60 }).unique("unique_email").notNull(),
    password: text("password").notNull(),
    loginAttempts: integer("login_attempts").default(0).notNull(),
    lockExpired: timestamp("lock_expired",{ withTimezone: true,mode: 'date' }),
    isVerified: boolean("is_verified").default(false).notNull(),
    tokenVersion: integer("token_version").default(1).notNull(),
    role: roleEnum('role').default('user').notNull(),
    createdAt: timestamp("created_at",{ withTimezone: true,mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at",{ withTimezone: true,mode: 'date' }).defaultNow().notNull()
})