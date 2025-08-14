/*
  Warnings:

  - A unique constraint covering the columns `[accountNumber]` on the table `BankAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."BankAccount" DROP CONSTRAINT "BankAccount_userId_fkey";

-- AlterTable
ALTER TABLE "public"."BankAccount" ADD COLUMN     "accountNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_accountNumber_key" ON "public"."BankAccount"("accountNumber");

-- AddForeignKey
ALTER TABLE "public"."BankAccount" ADD CONSTRAINT "BankAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
