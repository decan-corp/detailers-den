/* eslint-disable no-console */
import * as oldSchema from 'src/old-schema';
import * as tursoSchema from 'src/schema';
import { db } from 'src/utils/db';
import { mysqlDb } from 'src/utils/old-db';

const script = async () => {
  // services
  const services = await mysqlDb.select().from(oldSchema.servicesTable);
  await db.insert(tursoSchema.servicesTable).values(services);
  console.log('success migrating services');

  const users = await mysqlDb.select().from(oldSchema.usersTable);
  await db.insert(tursoSchema.usersTable).values(users);
  console.log('success migrating users');

  const tokens = await mysqlDb.select().from(oldSchema.resetPasswordTokensTable);
  await db.insert(tursoSchema.resetPasswordTokensTable).values(tokens);
  console.log('success migrating reset password tokens');

  const transactions = await mysqlDb.select().from(oldSchema.transactionsTable);
  await db.insert(tursoSchema.transactionsTable).values(
    transactions.map((item) => ({
      ...item,
      totalPrice: Number(item.totalPrice),
      discount: Number(item.discount || 0),
      tip: Number(item.tip || 0),
    }))
  );
  console.log('success migrating transactions');

  const transactionServices = await mysqlDb.select().from(oldSchema.transactionServicesTable);
  await db
    .insert(tursoSchema.transactionServicesTable)
    .values(transactionServices.map((item) => ({ ...item, price: Number(item.price) })));
  console.log('success migrating transactionServices');

  const crewEarnings = await mysqlDb.select().from(oldSchema.crewEarningsTable);
  await db
    .insert(tursoSchema.crewEarningsTable)
    .values(crewEarnings.map((item) => ({ ...item, amount: Number(item.amount) })));
  console.log('success migrating crew earnings');

  process.exit(0);
};

// const script2 = async () => {
//   const test = await db.select().from(tursoSchema.servicesTable);
//   console.log('test', test);
//   process.exit(0);
// };

script().catch(console.error);
