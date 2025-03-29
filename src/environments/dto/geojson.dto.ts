import { IsArray, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class GeometryDTO {
  @IsString()
  type: string;

  @IsArray()
  coordinates: number[][] | number[][][];
}

class FeaturePropertiesDTO {
  @IsString()
  type: string;

  @IsString()
  description: string;
}

class FeatureDTO {
  @IsString()
  type: string;

  @ValidateNested()
  @Type(() => FeaturePropertiesDTO)
  properties: FeaturePropertiesDTO;

  @ValidateNested()
  @Type(() => GeometryDTO)
  geometry: GeometryDTO;
}

export class GeoJSONDTO {
  @IsString()
  type: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureDTO)
  features: FeatureDTO[];
}
