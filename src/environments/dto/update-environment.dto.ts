// src/environments/dto/update-environment.dto.ts
export class UpdateEnvironmentDto {
  type: string;
  features: Array<{
    type: string;
    properties: {
      type: string;
      nom?: string;
      description?: string;
      categorie?: string;
      zoneId?: string;
    };
    geometry: {
      type: string;
      coordinates: number[][];
    };
    id?: string;
  }>;
  properties: {
    environment: {
      name: string;
      isPublic: boolean;
      userId: string;
      address: string;
    };
  };
}
