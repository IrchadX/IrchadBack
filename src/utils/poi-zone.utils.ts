import * as turf from '@turf/turf';
import { PrismaService } from '../prisma/prisma.service';
import { CreateZoneDto } from '../api/zones/dto/create-zone.dto';
import { CreatePoiDto } from '../api/pois/dto/create-poi.dto';

export class POIZoneUtils {
  constructor(private prisma: PrismaService) {}

  // detects which poi is inside which zone
  async detectPOIsInsideZones(zones: CreateZoneDto[], pois: CreatePoiDto[]) {
    console.log('🔍 Checking which POIs are inside zones...');
    for (const poi of pois) {
      for (const zone of zones) {
        await this.isPOIInsideZone(poi, zone);
      }
    }
  }
  private async isPOIInsideZone(poi: any, zone: any): Promise<boolean> {
    console.log(`Checking POI: ${poi.name} against Zone: ${zone.name}`);
    try {
      const zonePolygon = turf.polygon(zone.coordinates);

      // Handle different POI geometry types
      if (poi.geometry.type === 'Point') {
        const poiPoint = turf.point(poi.coordinates);
        return turf.booleanPointInPolygon(poiPoint, zonePolygon);
      } else if (poi.geometry.type === 'LineString') {
        // For LineString, check if any point is inside the zone
        const linePoints = poi.coordinates.map((coord) => turf.point(coord));
        return linePoints.some((point) =>
          turf.booleanPointInPolygon(point, zonePolygon),
        );
      } else if (poi.geometry.type === 'Polygon') {
        // Ensure polygon is closed
        const closedCoords = this.ensureClosedPolygon(poi.coordinates);
        const poiPolygon = turf.polygon(closedCoords);
        return turf.booleanContains(zonePolygon, poiPolygon);
      }

      return false;
    } catch (error) {
      console.error(`❌ Error processing POI "${poi.name}": ${error.message}`);
      return false;
    }
  }

  private ensureClosedPolygon(coordinates: number[][][]): number[][][] {
    const [ring] = coordinates;
    if (ring.length < 4) {
      throw new Error('Polygon must have at least 4 positions');
    }

    // Check if first and last points are the same
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      return [[...ring, first]]; // Close the ring
    }
    return coordinates;
  }
}
