import { PartialType } from '@nestjs/mapped-types';
import { CreateZoneTypeDto } from './create-zone_type.dto';

export class UpdateZoneTypeDto extends PartialType(CreateZoneTypeDto) {}
