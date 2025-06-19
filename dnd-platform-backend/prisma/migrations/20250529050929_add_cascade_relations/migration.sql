-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignPlayer" DROP CONSTRAINT "CampaignPlayer_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignPlayer" DROP CONSTRAINT "CampaignPlayer_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Character" DROP CONSTRAINT "Character_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "Character" DROP CONSTRAINT "Character_playerId_fkey";

-- DropForeignKey
ALTER TABLE "CharacterPosition" DROP CONSTRAINT "CharacterPosition_characterId_fkey";

-- DropForeignKey
ALTER TABLE "CharacterPosition" DROP CONSTRAINT "CharacterPosition_mapId_fkey";

-- DropForeignKey
ALTER TABLE "CombatSession" DROP CONSTRAINT "CombatSession_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "CombatTurn" DROP CONSTRAINT "CombatTurn_characterId_fkey";

-- DropForeignKey
ALTER TABLE "CombatTurn" DROP CONSTRAINT "CombatTurn_combatSessionId_fkey";

-- DropForeignKey
ALTER TABLE "FogTile" DROP CONSTRAINT "FogTile_mapId_fkey";

-- DropForeignKey
ALTER TABLE "Map" DROP CONSTRAINT "Map_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Npc" DROP CONSTRAINT "Npc_mapId_fkey";

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignPlayer" ADD CONSTRAINT "CampaignPlayer_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignPlayer" ADD CONSTRAINT "CampaignPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Npc" ADD CONSTRAINT "Npc_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CombatSession" ADD CONSTRAINT "CombatSession_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CombatTurn" ADD CONSTRAINT "CombatTurn_combatSessionId_fkey" FOREIGN KEY ("combatSessionId") REFERENCES "CombatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CombatTurn" ADD CONSTRAINT "CombatTurn_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Map" ADD CONSTRAINT "Map_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterPosition" ADD CONSTRAINT "CharacterPosition_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterPosition" ADD CONSTRAINT "CharacterPosition_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FogTile" ADD CONSTRAINT "FogTile_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE CASCADE ON UPDATE CASCADE;
