import { PartialType } from '@nestjs/mapped-types';
import { CreatePoisDto } from './create-pois.dto';

export class UpdatePoisDto extends PartialType(CreatePoisDto) {}
