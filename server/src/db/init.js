import { initializeDatabase, seedDatabase } from './database.js';
import 'dotenv/config';

console.log('Initializing database...');
initializeDatabase();

console.log('Seeding database...');
seedDatabase();

console.log('Database setup complete!');
process.exit(0);
