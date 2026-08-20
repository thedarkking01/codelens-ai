-- CreateTable
CREATE TABLE "Dependency" (
    "id" TEXT NOT NULL,
    "sourceFileId" TEXT NOT NULL,
    "targetFileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dependency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Dependency_sourceFileId_idx" ON "Dependency"("sourceFileId");

-- CreateIndex
CREATE INDEX "Dependency_targetFileId_idx" ON "Dependency"("targetFileId");

-- CreateIndex
CREATE UNIQUE INDEX "Dependency_sourceFileId_targetFileId_type_key" ON "Dependency"("sourceFileId", "targetFileId", "type");

-- AddForeignKey
ALTER TABLE "Dependency" ADD CONSTRAINT "Dependency_sourceFileId_fkey" FOREIGN KEY ("sourceFileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dependency" ADD CONSTRAINT "Dependency_targetFileId_fkey" FOREIGN KEY ("targetFileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
