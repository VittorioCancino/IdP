/*
  Warnings:

  - You are about to drop the column `createdAt` on the `AdminUser` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `AdminUser` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `AdminUser` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `AdminUser` table. All the data in the column will be lost.
  - You are about to drop the `AdminSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdminSession" DROP CONSTRAINT "AdminSession_userId_fkey";

-- AlterTable
ALTER TABLE "AdminUser" DROP COLUMN "createdAt",
DROP COLUMN "isActive",
DROP COLUMN "role",
DROP COLUMN "updatedAt";

-- DropTable
DROP TABLE "AdminSession";

-- DropEnum
DROP TYPE "AdminRole";
