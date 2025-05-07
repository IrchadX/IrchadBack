import { PartialType } from '@nestjs/mapped-types';
import { CreatePoiCategoryDto } from './create-poi-category.dto';

export class UpdatePoiCategoryDto extends PartialType(CreatePoiCategoryDto) {}
