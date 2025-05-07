import { Module } from '@nestjs/common';
import { ProfilService } from './profil.service';
import { ProfilController } from './profil.controller';
import { PrismaModule } from '@/prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  providers: [ProfilService],
  controllers: [ProfilController],
})
export class ProfilModule {}
