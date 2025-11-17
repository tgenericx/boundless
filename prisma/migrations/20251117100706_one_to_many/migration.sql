/*
  Warnings:

  - You are about to drop the column `mediaId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_InventoryToMedia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ListingToMedia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MediaToPost` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_InventoryToMedia" DROP CONSTRAINT "_InventoryToMedia_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_InventoryToMedia" DROP CONSTRAINT "_InventoryToMedia_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ListingToMedia" DROP CONSTRAINT "_ListingToMedia_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ListingToMedia" DROP CONSTRAINT "_ListingToMedia_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_MediaToPost" DROP CONSTRAINT "_MediaToPost_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_MediaToPost" DROP CONSTRAINT "_MediaToPost_B_fkey";

-- DropIndex
DROP INDEX "public"."Media_createdAt_idx";

-- DropIndex
DROP INDEX "public"."Media_resourceType_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "mediaId";

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "eventId" TEXT,
ADD COLUMN     "inventoryId" TEXT,
ADD COLUMN     "listingId" TEXT,
ADD COLUMN     "postId" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar";

-- DropTable
DROP TABLE "public"."_InventoryToMedia";

-- DropTable
DROP TABLE "public"."_ListingToMedia";

-- DropTable
DROP TABLE "public"."_MediaToPost";

-- CreateIndex
CREATE UNIQUE INDEX "Media_userId_key" ON "Media"("userId");

-- CreateIndex
CREATE INDEX "Media_postId_idx" ON "Media"("postId");

-- CreateIndex
CREATE INDEX "Media_listingId_idx" ON "Media"("listingId");

-- CreateIndex
CREATE INDEX "Media_inventoryId_idx" ON "Media"("inventoryId");

-- CreateIndex
CREATE INDEX "Media_eventId_idx" ON "Media"("eventId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
