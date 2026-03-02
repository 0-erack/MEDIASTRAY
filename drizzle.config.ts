import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/models/schema.ts', // Point this to your schema file
  out: './migrations',     // Where Drizzle will generate SQL files
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});