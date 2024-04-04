import { db, VercelPoolClient } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import {
  invoices,
  customers,
  revenue,
  users,
} from '@/app/libs/placeholder-data';

const seedUsers = async (client: VercelPoolClient) => {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    //Create the users table if it doesn't exist
    const createTable = await client.sql`
    CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
    `;

    console.log('Created "users" table');

    //Insert data into the users table
    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);

        return client.sql`
            INSERT INTO users (id, name, email, password)
            VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
            ON CONFLICT (id) DO NOTHING
            `;
      })
    );

    console.log(`Seeded ${insertedUsers.length} users`);

    return {
      createTable,
      users: insertedUsers,
    };
  } catch (err) {
    console.error('Error seeding users:', err);
    throw err;
  }
};

const seedInvoices = async (client: VercelPoolClient) => {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    //Create the invoices table if it doesn't exist
    const createTable = await client.sql`
        CREATE TABLE IF NOT EXISTS invoices(
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            customer_id UUID NOT NULL,
            amount INT NOT NULL,
            status VARCHAR(255) NOT NULL,
            date DATE NOT NULL
        )
        `;

    console.log('Created invoices table');

    //Insert data into the invoices table
    const insertedInvoices = await Promise.all(
      invoices.map(
        (invoice) => client.sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES(${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
            ON CONFLICT (id) DO NOTHING
            `
      )
    );

    console.log(`Seeded ${insertedInvoices.length} invoices`);

    return {
      createTable,
      invoices: insertedInvoices,
    };
  } catch (err) {
    console.error('Error seeding invoices:', err);
    throw err;
  }
};

const seedCustomers = async (client: VercelPoolClient) => {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    //CREATE the customers table if it doesn't exist
    const createTable = await client.sql`
            CREATE TABLE IF NOT EXISTS customers(
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                image_url VARCHAR(255) NOT NULL
            )
        `;

    console.log('Created customers table');

    //Insert data into the customers table
    const insertedCustomers = await Promise.all(
      customers.map(
        (customer) => client.sql`
            INSERT INTO customers (id, name, email, image_url)
            VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
            ON CONFLICT (id) DO NOTHING
            `
      )
    );

    console.log(`Seeded ${insertedCustomers.length} customers`);

    return {
      createTable,
      customers: insertedCustomers,
    };
  } catch (err) {
    console.error('Error seeding customers:', err);
    throw err;
  }
};

const seedRevenue = async (client: VercelPoolClient) => {
  try {
    const createTable = await client.sql`
        CREATE TABLE IF NOT EXISTS revenue (
            month VARCHAR(4) NOT NULL UNIQUE,
            revenue INT NOT NULL
        )
        `;

    console.log('Created revenue table');

    const insertedRevenue = await Promise.all(
      revenue.map(
        (rev) => client.sql`
            INSERT INTO revenue (month, revenue)
            VALUES (${rev.month}, ${rev.revenue})
            ON CONFLICT (month) DO NOTHING
            `
      )
    );

    console.log(`Seeded ${insertedRevenue.length} revenue`);

    return {
      createTable,
      revenue: insertedRevenue,
    };
  } catch (err) {
    console.error('Error seeding revenue:', err);
    throw err;
  }
};

const main = async () => {
  const client: any = await db.connect();

  await seedUsers(client);
  await seedCustomers(client);
  await seedInvoices(client);
  await seedRevenue(client);

  await client.end();
};

main().catch((err) => {
  console.error('Error occurred while attempting to seed the database:', err);
});
