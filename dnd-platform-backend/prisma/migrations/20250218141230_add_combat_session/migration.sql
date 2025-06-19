-- CreateTable
CREATE TABLE "CombatSession" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CombatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CombatTurn" (
    "id" TEXT NOT NULL,
    "combatSessionId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CombatTurn_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CombatSession" ADD CONSTRAINT "CombatSession_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CombatTurn" ADD CONSTRAINT "CombatTurn_combatSessionId_fkey" FOREIGN KEY ("combatSessionId") REFERENCES "CombatSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CombatTurn" ADD CONSTRAINT "CombatTurn_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
