/*
  Warnings:

  - The values [DM] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `dmId` on the `Campaign` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('PLAYER', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'PLAYER';
COMMIT;

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_dmId_fkey";

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "dmId",
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CampaignPlayer" ADD COLUMN     "isDM" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
