-- CreateTable
CREATE TABLE "FogTile" (
    "id" TEXT NOT NULL,
    "mapId" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FogTile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FogTile" ADD CONSTRAINT "FogTile_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
