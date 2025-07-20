import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';
import { InvoiceStatus } from '@prisma/client';



async function seedUsers() {
  // No es necesario crear tablas, Prisma Migrate se encarga de eso.
  const insertedUsers = await prisma.user.createMany({
    data: await Promise.all(
      users.map(async (user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        password: await bcrypt.hash(user.password, 10),
      })),
    ),
    skipDuplicates: true, // Evita errores si los usuarios ya existen
  });
  console.log(`Seeded ${insertedUsers.count} users`);
}

async function seedInvoices() {
  // Transforma las fechas de string a objetos Date para Prisma
  // Import InvoiceStatus from your Prisma client

  const invoicesWithDates = invoices.map((invoice) => ({
    ...invoice,
    date: new Date(invoice.date),
    status: invoice.status as InvoiceStatus,
  }));

  const insertedInvoices = await prisma.invoice.createMany({
    data: invoicesWithDates,
    skipDuplicates: true,
  });
  console.log(`Seeded ${insertedInvoices.count} invoices`);
}

async function seedCustomers() {
  const insertedCustomers = await prisma.customer.createMany({
    data: customers,
    skipDuplicates: true,
  });
  console.log(`Seeded ${insertedCustomers.count} customers`);
}

async function seedRevenue() {
  const insertedRevenue = await prisma.revenue.createMany({
    data: revenue,
    skipDuplicates: true,
  });
  console.log(`Seeded ${insertedRevenue.count} revenue entries`);
}

export async function GET() {
  try {
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json(
      { message: 'Failed to seed database', error: (error as Error).message },
      { status: 500 },
    );
  }
}
