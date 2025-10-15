-- CreateTable
CREATE TABLE "FeedDelivery" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeedDelivery_postId_key" ON "FeedDelivery"("postId");

-- AddForeignKey
ALTER TABLE "FeedDelivery" ADD CONSTRAINT "FeedDelivery_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
