/*
  Warnings:

  - Added the required column `class` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `race` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stats` to the `Character` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "class" TEXT NOT NULL,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "race" TEXT NOT NULL,
ADD COLUMN     "stats" JSONB NOT NULL;
