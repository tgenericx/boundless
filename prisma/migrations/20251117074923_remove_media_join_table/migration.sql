/*
  Warnings:

  - You are about to drop the column `height` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the `InventoryMedia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ListingMedia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostMedia` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `facultyId` on table `CampusProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `departmentId` on table `CampusProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."CampusProfile" DROP CONSTRAINT "CampusProfile_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CampusProfile" DROP CONSTRAINT "CampusProfile_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."InventoryMedia" DROP CONSTRAINT "InventoryMedia_inventoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."InventoryMedia" DROP CONSTRAINT "InventoryMedia_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ListingMedia" DROP CONSTRAINT "ListingMedia_listingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ListingMedia" DROP CONSTRAINT "ListingMedia_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PostMedia" DROP CONSTRAINT "PostMedia_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PostMedia" DROP CONSTRAINT "PostMedia_postId_fkey";

-- AlterTable
ALTER TABLE "CampusProfile" ALTER COLUMN "facultyId" SET NOT NULL,
ALTER COLUMN "departmentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "height",
DROP COLUMN "width";

-- DropTable
DROP TABLE "public"."InventoryMedia";

-- DropTable
DROP TABLE "public"."ListingMedia";

-- DropTable
DROP TABLE "public"."PostMedia";

-- CreateTable
CREATE TABLE "_MediaToPost" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MediaToPost_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ListingToMedia" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ListingToMedia_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_InventoryToMedia" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InventoryToMedia_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MediaToPost_B_index" ON "_MediaToPost"("B");

-- CreateIndex
CREATE INDEX "_ListingToMedia_B_index" ON "_ListingToMedia"("B");

-- CreateIndex
CREATE INDEX "_InventoryToMedia_B_index" ON "_InventoryToMedia"("B");

-- AddForeignKey
ALTER TABLE "CampusProfile" ADD CONSTRAINT "CampusProfile_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampusProfile" ADD CONSTRAINT "CampusProfile_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaToPost" ADD CONSTRAINT "_MediaToPost_A_fkey" FOREIGN KEY ("A") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaToPost" ADD CONSTRAINT "_MediaToPost_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListingToMedia" ADD CONSTRAINT "_ListingToMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListingToMedia" ADD CONSTRAINT "_ListingToMedia_B_fkey" FOREIGN KEY ("B") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InventoryToMedia" ADD CONSTRAINT "_InventoryToMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InventoryToMedia" ADD CONSTRAINT "_InventoryToMedia_B_fkey" FOREIGN KEY ("B") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
