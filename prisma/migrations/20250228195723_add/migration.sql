/*
  Warnings:

  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `user` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `userTypeId` on the `user` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `user_type` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `user_type` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_userTypeId_fkey";

-- AlterTable
ALTER TABLE "user" DROP CONSTRAINT "user_pkey",
ALTER COLUMN "id" SET DATA TYPE SERIAL,
ALTER COLUMN "userTypeId" SET DATA TYPE INTEGER,
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user_type" DROP CONSTRAINT "user_type_pkey",
ALTER COLUMN "id" SET DATA TYPE SERIAL,
ADD CONSTRAINT "user_type_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_userTypeId_fkey" FOREIGN KEY ("userTypeId") REFERENCES "user_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;
