/*
  Warnings:

  - You are about to drop the column `eager` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `playbackUrl` on the `Media` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Media" DROP COLUMN "eager",
DROP COLUMN "playbackUrl";
