import { sql } from '@vercel/postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  User,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';

const ITEMS_PER_PAGE = 6;

export async function fetchRevenue() {
  //Add noStore() here to prevent the response from being cached
  //This is equivalent to in fetch(..., {cache: 'no-store'})
  try {
    //Artificially delay a response for demo purposes
    //Don't do this in production
    console.log('Fetching revenue data...');
    //await new Promise((resolve) => setTimeout(resolve, 3000))
    const data = await sql<Revenue>`SELECT * FROM revenue`;

    return data.rows;
  } catch (err) {
    console.error('Database Error:', err);

    throw new Error('Failed to fetch revenue data');
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw>`
    SELECT i.amount, c.name, c.image_url, c.email, i.id
    FROM invoices i
    JOIN customers c ON i.customer_id = c.id
    ORDER BY i.date DESC
    LIMIT 5
    `;

    const latestInvoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));

    return latestInvoices;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch the latest invoices');
  }
}

export async function fetchCardData() {
  try {
    //You can probably combine these into a single SQL query
    //However, we are intentionally splitting them to demonstrate
    //How to initialize multiple queries in parallel with JS
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
        FROM invoices
        `;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
    const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch card data');
  }
}

export async function fetchFilterInvoices(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable>`
    SELECT
        i.id,
        i.amount,
        i.date,
        i.status,
        c.name,
        c.email,
        c.image_url
    FROM invoices i
    JOIN customers c ON i.customer_id = c.id
    WHERE
        c.name ILIKE ${`%${query}%`} OR
        c.email ILIKE ${`%${query}%`} OR
        i.amount::text ILIKE ${`%${query}%`} OR
        i.date::text ILIKE ${`%${query}%`} OR
        i.status ILIKE ${`%${query}%`}
    ORDER BY i.date DESC
    LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices.rows;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch invoices');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
        FROM invoices i
        JOIN customers c ON i.customer_id = c.id
        WHERE
            c.name ILIKE ${`%${query}%`} OR
            c.email ILIKE ${`%${query}%`} OR
            i.amount::text ILIKE ${`%${query}%`} OR
            i.date::text ILIKE ${`%${query}%`} OR
            i.status ILIKE ${`%${query}%`}
        `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);

    return totalPages;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch total number of invoices');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm>`
        SELECT id, customer_id, amount, status
        FROM invoices
        WHERE ID = ${id}
        `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      //Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch Invoice');
  }
}

export async function fetchCustomers() {
  try {
    const data = await sql<CustomerField>`
        SELECT id, name
        FROM customers
        ORDER BY name ASC
        `;

    return data.rows;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType>`
        SELECT
            c.id,
            c.name,
            c.email,
            c.image_url,
            COUNT(i.id) AS total_invoices,
            SUM(CASE WHEN i.status = 'pending' THEN i.amount ELSE 0 END) AS total_pending,
            SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END) AS total_paid
        FROM customers c
        LEFT JOIN invoices i ON c.id = i.customer_id
        WHERE
            c.name ILIKE ${`%${query}%`} OR
            c.email ILIKE ${`%${query}%`}
        GROUP BY c.id, c.name, c.email, c.image_url
        ORDER BY c.name ASC
        `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table');
  }
}

export async function getUser(email: string) {
  try {
    const user = await sql`SELECT * FROM users WHERE email=${email}`;

    return user.rows[0] as User;
  } catch (err) {
    console.error('Failed to fetch User:', err);
    throw new Error('Failed to fetch user');
  }
}
