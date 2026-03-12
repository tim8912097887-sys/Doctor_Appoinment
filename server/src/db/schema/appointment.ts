import { decimal, index, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./user.js";
import { doctors } from "./doctor.js";
import { workTimes } from "./workTime.js";

export const appointmentStatusEnum = pgEnum('appointment_status', [
    'PENDING', 
    'PAYED',
    'COMPLETED', 
    'CANCELLED_BY_PATIENT', 
    'CANCELLED_BY_DOCTOR', 
    'NO_SHOW'
]);

export const appointments = pgTable('appointments', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    doctorId: uuid('doctor_id').references(() => doctors.id).notNull(),
    workTimeId: uuid('work_time_id').references(() => workTimes.id).notNull(),
    
    // Snapshot of the fee at the moment of booking
    bookedFee: decimal("booked_fee", { precision: 10, scale: 2 }).notNull(),
    
    status: appointmentStatusEnum('status').default('PENDING').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ([
    // Crucial for the "50 patient" check
    index("work_time_idx").on(table.workTimeId),
]));