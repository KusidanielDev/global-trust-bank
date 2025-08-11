const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@bank.com' },
    update: {},
    create: { email: 'demo@bank.com', password: passwordHash, name: 'Demo User' },
  });
  const a1 = await prisma.account.create({ data: { userId: user.id } });
  const a2 = await prisma.account.create({ data: { userId: user.id } });
  const now = new Date();
  await prisma.transaction.createMany({
    data: [
      { accountId: a1.id, amount: 2000, date: now, description: 'Initial Deposit', category: 'Deposit' },
      { accountId: a1.id, amount: -75.32, date: now, description: 'Grocery Store', category: 'Groceries' },
      { accountId: a1.id, amount: -120.00, date: now, description: 'Electric Bill', category: 'Utilities' },
      { accountId: a2.id, amount: 5000, date: now, description: 'Paycheck', category: 'Income' },
      { accountId: a2.id, amount: -2500, date: now, description: 'Transfer to Checking', category: 'Transfer' },
      { accountId: a1.id, amount: 2500, date: now, description: 'Transfer from Savings', category: 'Transfer' },
    ]
  });
}
main().catch(e=>{console.error(e); process.exit(1)}).finally(()=>prisma.$disconnect());
