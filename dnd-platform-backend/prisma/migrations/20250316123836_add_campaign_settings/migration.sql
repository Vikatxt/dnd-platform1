-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'NORMAL', 'HARD', 'INSANE');

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "allowMulticlass" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mapGridSize" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "maxPlayers" INTEGER NOT NULL DEFAULT 6,
ADD COLUMN     "startLevel" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "useHomebrew" BOOLEAN NOT NULL DEFAULT false;
