/*
  Warnings:

  - You are about to drop the column `boardId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `boardId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `Board` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BoardCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BoardFollower` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Board" DROP CONSTRAINT "Board_userId_fkey";

-- DropForeignKey
ALTER TABLE "BoardCategory" DROP CONSTRAINT "BoardCategory_boardId_fkey";

-- DropForeignKey
ALTER TABLE "BoardCategory" DROP CONSTRAINT "BoardCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "BoardFollower" DROP CONSTRAINT "BoardFollower_boardId_fkey";

-- DropForeignKey
ALTER TABLE "BoardFollower" DROP CONSTRAINT "BoardFollower_userId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_boardId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_boardId_fkey";

-- DropIndex
DROP INDEX "Event_boardId_idx";

-- DropIndex
DROP INDEX "Post_boardId_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "boardId";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "boardId";

-- DropTable
DROP TABLE "Board";

-- DropTable
DROP TABLE "BoardCategory";

-- DropTable
DROP TABLE "BoardFollower";
