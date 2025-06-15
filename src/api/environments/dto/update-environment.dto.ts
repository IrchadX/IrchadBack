// Updated UpdateEnvironmentDto
export class UpdateEnvironmentDto {
  type: string; // "FeatureCollection"
  features: Array<{
    type: string; // "Feature"
    properties: {
      type: string; // "environment", "zone", "poi", etc.
      name?: string; // Optional name
      description?: string; // Optional description
      categorie?: string; // Optional category (for POIs)
      image?: string; // Optional image URL (for POIs)

      // TypeId can be either a number, string, or an object with id property
      typeId?: number | string | { id: number; [key: string]: any } | null;

      id?: number; // Feature ID (required for updates to identify existing features)
      color?: string; // Optional color for styling
      zoneId?: number; // Optional zone ID (for linking POIs to zones)
    };
    geometry: {
      type: string; // "Polygon", "Point", "LineString", etc.
      coordinates: any; // Array of coordinates
    };
  }>;
  properties: {
    environment: {
      name?: string; // Optional environment name
      isPublic?: boolean; // Optional public/private flag
      userId?: number; // Optional userId
      address?: string; // Optional address
      description?: string; // Optional description
    };
  };
}

export type TypeIdValue =
  | number
  | string
  | { id: number; [key: string]: any }
  | null;
