import { Controller, Put, Param, Body } from '@nestjs/common';
import { ProfilService } from './profil.service';
import { UpdateProfileDto } from './dto/Profile.dto';

@Controller('profile')
export class ProfilController {
  constructor(private readonly profileService: ProfilService) {}

  @Put('update/:id')
  async updateProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(Number(id), updateProfileDto);
  }
}
