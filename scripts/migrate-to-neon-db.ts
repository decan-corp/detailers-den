/* eslint-disable no-console */
import * as oldSchema from 'src/old-schema';
import * as newSchema from 'src/schema';
import { db } from 'src/utils/db';
import { oldDb } from 'src/utils/old-db';

// TODO: delete file after prod deployment
const script = async () => {
  // services
  const services = await oldDb.select().from(oldSchema.servicesTable);
  await db.insert(newSchema.servicesTable).values(services);
  console.log('success migrating services');

  const users = await oldDb.select().from(oldSchema.usersTable);
  await db
    .insert(newSchema.usersTable)
    .values(users.map((user) => ({ ...user, isFirstTimeLogin: Boolean(user.isFirstTimeLogin) })));
  console.log('success migrating users');

  const tokens = await oldDb.select().from(oldSchema.resetPasswordTokensTable);
  await db.insert(newSchema.resetPasswordTokensTable).values(tokens);
  console.log('success migrating reset password tokens');

  const transactions = await oldDb.select().from(oldSchema.transactionsTable);
  await db.insert(newSchema.transactionsTable).values(
    transactions.map((item) => ({
      ...item,
      totalPrice: item.totalPrice.toFixed(2),
      discount: item.discount.toFixed(2),
      tip: item.tip.toFixed(2),
    }))
  );
  console.log('success migrating transactions');

  const transactionServices = await oldDb.select().from(oldSchema.transactionServicesTable);
  await db
    .insert(newSchema.transactionServicesTable)
    .values(transactionServices.map((item) => ({ ...item, price: Number(item.price) })));
  console.log('success migrating transactionServices');

  const crewEarnings = await oldDb.select().from(oldSchema.crewEarningsTable);
  await db.insert(newSchema.crewEarningsTable).values(
    crewEarnings.map((item) => ({
      ...item,
      amount: item.amount.toFixed(2),
      computedServiceCutPercentage: item.computedServiceCutPercentage?.toFixed(2) || '0',
    }))
  );
  console.log('success migrating crew earnings');

  console.log('finish migrating all records');

  process.exit(0);
};

// const script2 = async () => {
//   const test = await db.select().from(newSchema.servicesTable);
//   console.log('test', test);
//   process.exit(0);
// };

script().catch(console.error);
