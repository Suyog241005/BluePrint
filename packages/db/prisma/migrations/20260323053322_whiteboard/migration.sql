-- CreateTable
CREATE TABLE "whiteboard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data" BYTEA,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whiteboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "whiteboard_userId_idx" ON "whiteboard"("userId");

-- AddForeignKey
ALTER TABLE "whiteboard" ADD CONSTRAINT "whiteboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
