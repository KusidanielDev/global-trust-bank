-- CreateEnum
CREATE TYPE "public"."AccountStatus" AS ENUM ('ACTIVE', 'FROZEN', 'CLOSED');

-- AlterTable
ALTER TABLE "public"."BankAccount" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "status" "public"."AccountStatus" NOT NULL DEFAULT 'ACTIVE';
