/*
  Warnings:

  - You are about to drop the `_UserCampaigns` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserCampaigns" DROP CONSTRAINT "_UserCampaigns_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserCampaigns" DROP CONSTRAINT "_UserCampaigns_B_fkey";

-- DropTable
DROP TABLE "_UserCampaigns";

-- CreateTable
CREATE TABLE "CampaignPlayer" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignPlayer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CampaignPlayer" ADD CONSTRAINT "CampaignPlayer_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignPlayer" ADD CONSTRAINT "CampaignPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
