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

  // tests if a poi is inside a zone
  private async isPOIInsideZone(poi: any, zone: any): Promise<boolean> {
    console.log(`Checking POI: ${poi.name} against Zone: ${zone.name}`);
    try {
      const zonePolygon = turf.polygon([zone.coordinates[0]]);
      let isInside = false;

      if (poi.coordinates.length === 1 && poi.coordinates[0].length === 1) {
        const poiPoint = turf.point(poi.coordinates[0][0]);
        isInside = turf.booleanPointInPolygon(poiPoint, zonePolygon);
      } else if (
        poi.coordinates.length === 1 &&
        poi.coordinates[0].length === 2
      ) {
        const line = turf.lineString(poi.coordinates[0]);
        const linePoints = poi.coordinates[0].map((coord) => turf.point(coord));
        isInside = linePoints.some((point) =>
          turf.booleanPointInPolygon(point, zonePolygon),
        );
      } else {
        const fixedPOI = this.fixPolygon(poi.coordinates);
        const poiPolygon = turf.polygon([fixedPOI[0]]);
        isInside = turf.booleanContains(zonePolygon, poiPolygon);
      }
      // insert entry in poi_zone table if the poi is inside the zone
      if (isInside) {
        console.log(`✅ POI "${poi.name}" is inside Zone "${zone.name}"`);

        const existingEntry = await this.prisma.poi_zone.findFirst({
          where: { poi_id: poi.id, zone_id: zone.id },
        });

        if (!existingEntry) {
          await this.prisma.poi_zone.create({
            data: { poi_id: poi.id, zone_id: zone.id },
          });
          console.log(
            `✅ Inserted POI-Zone relation: ${poi.name} -> ${zone.name}`,
          );
        } else {
          console.log(
            `⚠️ POI-Zone relation already exists: ${poi.name} -> ${zone.name}`,
          );
        }
      }

      return isInside;
    } catch (error) {
      console.error(`❌ Error processing POI "${poi.name}": ${error.message}`);
      return false;
    }
  }

  // closes a polygon if it has only 4 coordinates
  private fixPolygon(coordinates: number[][][]) {
    const firstPoint = coordinates[0][0];
    const lastPoint = coordinates[0][coordinates[0].length - 1];

    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      coordinates[0].push(firstPoint);
    }
    return coordinates;
  }
}
