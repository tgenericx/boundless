-- AlterTable
ALTER TABLE "public"."Post" ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "Post_scheduleId_idx" ON "public"."Post"("scheduleId");

-- CreateIndex
CREATE INDEX "Post_parentId_idx" ON "public"."Post"("parentId");

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
