import { Injectable } from '@nestjs/common';
import { CreatePoisDto } from './dto/create-pois.dto';
import { UpdatePoisDto } from './dto/update-pois.dto';

@Injectable()
export class PoisService {
  create(createPoisDto: CreatePoisDto) {
    return 'This action adds a new pois';
  }

  findAll() {
    return `This action returns all pois`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pois`;
  }

  update(id: number, updatePoisDto: UpdatePoisDto) {
    return `This action updates a #${id} pois`;
  }

  remove(id: number) {
    return `This action removes a #${id} pois`;
  }
}
