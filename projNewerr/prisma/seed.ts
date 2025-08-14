// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

/** Recompute mirror balance *inside the same tx* */
async function recomputeTx(tx: PrismaClient, accountId: string) {
  const sum = await tx.transaction.aggregate({
    where: { accountId },
    _sum: { amountCents: true },
  });
  await tx.bankAccount.update({
    where: { id: accountId },
    data: { balanceCents: sum._sum.amountCents ?? 0 },
  });
}

/** Simple random id for transfer correlation (not cryptographically strong) */
function cryptoRandomId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Generate a 12-digit account number that does not already exist */
async function generateUniqueAccountNumber(): Promise<string> {
  function gen12(): string {
    let s = "";
    for (let i = 0; i < 12; i++) s += Math.floor(Math.random() * 10);
    if (s[0] === "0") s = "1" + s.slice(1); // avoid leading zero
    return s;
  }

  // Try a few times before fallback
  for (let i = 0; i < 10; i++) {
    const candidate = gen12();
    const exists = await prisma.bankAccount.findFirst({
      where: { accountNumber: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }
  // Ultra-rare fallback: append ticks to ensure uniqueness
  const fallback = (gen12() + Date.now().toString().slice(-2)).slice(0, 12);
  return fallback;
}

/** Create a transfer atomically and recompute both accounts in the same tx */
async function createTransferAtomic(
  fromAccountId: string,
  toAccountId: string,
  cents: number,
  note?: string
) {
  const transferId = cryptoRandomId();
  await prisma.$transaction(async (tx) => {
    await tx.transaction.create({
      data: {
        accountId: fromAccountId,
        amountCents: -Math.abs(cents),
        description: note || "Transfer out",
        category: "Transfer",
        transferId,
      },
    });
    await tx.transaction.create({
      data: {
        accountId: toAccountId,
        amountCents: Math.abs(cents),
        description: note || "Transfer in",
        category: "Transfer",
        transferId,
      },
    });
    await recomputeTx(tx, fromAccountId);
    await recomputeTx(tx, toAccountId);
  });
}

async function main() {
  console.log("🌱 Seeding…");

  // Clear existing (order matters due to FKs)
  await prisma.notification.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.bankAccount.deleteMany({});
  await prisma.account.deleteMany({}); // NextAuth adapter tables (if used)
  await prisma.session.deleteMany({});
  await prisma.verificationToken.deleteMany({});
  await prisma.user.deleteMany({});

  // Users
  const [alice, bob] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Alice Doe",
        email: "alice@example.com",
        password: await bcrypt.hash("Password123!", 10),
      },
    }),
    prisma.user.create({
      data: {
        name: "Bob Smith",
        email: "bob@example.com",
        password: await bcrypt.hash("Password123!", 10),
      },
    }),
  ]);

  // Accounts (with unique accountNumber)
  const aliceChecking = await prisma.bankAccount.create({
    data: {
      userId: alice.id,
      name: "Checking",
      type: "checking",
      accountNumber: await generateUniqueAccountNumber(),
      balanceCents: 0, // will be recomputed below; keep explicit 0 for clarity
    },
  });

  const aliceSavings = await prisma.bankAccount.create({
    data: {
      userId: alice.id,
      name: "Savings",
      type: "savings",
      accountNumber: await generateUniqueAccountNumber(),
      balanceCents: 0,
    },
  });

  const bobChecking = await prisma.bankAccount.create({
    data: {
      userId: bob.id,
      name: "Checking",
      type: "checking",
      accountNumber: await generateUniqueAccountNumber(),
      balanceCents: 0,
    },
  });

  // Transactions (cents-only)
  await prisma.transaction.createMany({
    data: [
      {
        accountId: aliceChecking.id,
        amountCents: 1000_00,
        description: "Initial deposit",
        category: "Deposit",
      },
      {
        accountId: aliceChecking.id,
        amountCents: -250_00,
        description: "Groceries",
        category: "Expense",
      },
      {
        accountId: aliceChecking.id,
        amountCents: 500_00,
        description: "Salary",
        category: "Income",
      },
      {
        accountId: aliceSavings.id,
        amountCents: 200_00,
        description: "Initial savings",
        category: "Deposit",
      },
      {
        accountId: bobChecking.id,
        amountCents: 300_00,
        description: "Initial deposit",
        category: "Deposit",
      },
      {
        accountId: bobChecking.id,
        amountCents: -50_00,
        description: "Taxi",
        category: "Expense",
      },
    ],
  });

  // One sample transfer (atomic)
  await createTransferAtomic(
    aliceChecking.id,
    aliceSavings.id,
    150_00,
    "Move to savings"
  );

  // Recompute mirrors (in case you add/change anything above)
  await prisma.$transaction(async (tx) => {
    await recomputeTx(tx, aliceChecking.id);
    await recomputeTx(tx, aliceSavings.id);
    await recomputeTx(tx, bobChecking.id);
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      { userId: alice.id, title: "Welcome", body: "Your account is ready." },
      {
        userId: alice.id,
        title: "Deposit received",
        body: "We’ve credited your account.",
      },
      { userId: bob.id, title: "Welcome", body: "Your account is ready." },
    ],
  });

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
