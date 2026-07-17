-- CreateTable
CREATE TABLE "ChapterSlide" (
    "id" SERIAL NOT NULL,
    "chapterId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "imageUrl" TEXT,
    "title" TEXT,
    "content" TEXT,
    "caption" TEXT,
    "altText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChapterSlide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChapterSlide_chapterId_order_key" ON "ChapterSlide"("chapterId", "order");

-- AddForeignKey
ALTER TABLE "ChapterSlide" ADD CONSTRAINT "ChapterSlide_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
