// Script to create the newsletter_subscribers table
require("dotenv").config({ path: ".env.local" });
const postgres = require("postgres");

async function main() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        email varchar(255) NOT NULL UNIQUE,
        subscribed_at timestamptz DEFAULT now() NOT NULL
      );
    `;
    console.log("newsletter_subscribers table created successfully");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await sql.end();
  }
}

main();
