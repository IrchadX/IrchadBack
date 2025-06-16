// Updated CreateEnvironmentDto
export class CreateEnvironmentDto {
  type: string; // "FeatureCollection"
  features: Array<{
    type: string; // "Feature"
    properties: {
      type: string; // "environment", "zone", "poi", etc.
      name?: string; // Optional name
      description?: string; // Optional description
      categorie?: string; // Optional category (for POIs)
      image?: string; // Optional image URL (for POIs)
      zoneId?: number; // Optional zone ID (for linking POIs to zones)

      // TypeId can be either a number, string, or an object with id property
      typeId?: number | string | { id: number; [key: string]: any } | null;

      id?: number; // Feature ID
      color?: string; // Optional color for styling
    };
    geometry: {
      type: string; // "Polygon", "Point", "LineString", etc.
      coordinates: any; // Array of coordinates
    };
  }>;
  properties: {
    environment: {
      name: string; // Environment name
      isPublic: boolean; // Public/private flag
      userId?: number; // User ID
      address?: string; // Optional address
      description?: string; // Optional description
    };
  };
}
