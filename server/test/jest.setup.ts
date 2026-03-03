import { tokens } from '@db/schema/token.js';
import { users } from '@db/schema/user.js';
import { db, dbDisconnection } from '@db/db.js';
import { config } from 'dotenv';
// Load test environment variables
config({ path: '.env.test' });

// Global teardown prevent race condition
afterEach(async() => {
    await db.delete(users);
    await db.delete(tokens);
},10000)
afterAll(async() => {
           await dbDisconnection();
},10000)
export {}