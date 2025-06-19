-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "activeMapId" TEXT;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_activeMapId_fkey" FOREIGN KEY ("activeMapId") REFERENCES "Map"("id") ON DELETE SET NULL ON UPDATE CASCADE;
