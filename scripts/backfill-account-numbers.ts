// scripts/backfill-account-numbers.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function genAccountNumber(): string {
  // 12 digits
  let s = "";
  for (let i = 0; i < 12; i++) s += Math.floor(Math.random() * 10);
  if (s[0] === "0") s = "1" + s.slice(1); // avoid leading zero
  return s;
}

async function main() {
  const accounts = await prisma.bankAccount.findMany({
    where: { accountNumber: null },
    select: { id: true },
  });

  for (const a of accounts) {
    // ensure uniqueness
    let num = genAccountNumber();
    let exists = await prisma.bankAccount.findFirst({
      where: { accountNumber: num },
    });
    while (exists) {
      num = genAccountNumber();
      exists = await prisma.bankAccount.findFirst({
        where: { accountNumber: num },
      });
    }
    await prisma.bankAccount.update({
      where: { id: a.id },
      data: { accountNumber: num },
    });
    console.log(`Filled ${a.id} → ${num}`);
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});
