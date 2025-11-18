/*
  Warnings:

  - You are about to drop the column `eventId` on the `Post` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Post" DROP CONSTRAINT "Post_eventId_fkey";

-- DropIndex
DROP INDEX "public"."Post_eventId_idx";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "eventId";
