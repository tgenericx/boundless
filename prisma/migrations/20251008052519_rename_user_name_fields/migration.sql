/*
  Warnings:

  - You are about to drop the column `description` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otherName` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Business" DROP COLUMN "description",
DROP COLUMN "name";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "otherName",
ADD COLUMN     "name" TEXT;
