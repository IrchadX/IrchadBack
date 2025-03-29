export class CreateEnvironmentDto {
  type: string; // "FeatureCollection"
  features: Array<{
    type: string; // "Feature" or "polygon"
    properties: {
      type: string; // "environment", "zone", "poi", etc.
      name?: string; // Optional name
      description?: string; // Optional description
      categorie?: string; // Optional category (for POIs)
      image?: string; // Optional image URL
      zoneId?: number; // Optional zone ID (for linking POIs to zones)
    };
    geometry: {
      type: string; // "Polygon", "LineString", etc.
      coordinates: any; // Array of coordinates
    };
    id?: string; // Optional feature ID
  }>;
  properties: {
    environment: {
      name: string; // Environment name
      isPublic: boolean; // Public/private flag
      userId: number; // User ID (note: this is a string in the JSON)
      address?: string; // Optional address
    };
  };
}
