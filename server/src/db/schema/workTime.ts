import { date, decimal, index, integer, pgTable, time, timestamp, uuid } from "drizzle-orm/pg-core";
import { doctors } from "./doctor.js";

export const workTimes = pgTable('work_times', {
    id: uuid('id').defaultRandom().primaryKey(),
    doctorId: uuid('doctor_id').references(() => doctors.id, { onDelete: 'cascade' }).notNull(),
    date: date('date', { mode: 'string' }).notNull(), // e.g., '2026-03-15'
    startTime: time('start_time').notNull(),         // e.g., '09:00:00'
    endTime: time('end_time').notNull(),             // e.g., '12:00:00'
    fee: decimal("fee", { precision: 10, scale: 2 }).notNull(), // Fee for THIS specific shift
    capacity: integer("capacity").default(50).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ([
    // Index for fast lookups by doctor and date
    index("doctor_date_idx").on(table.doctorId, table.date),
]));