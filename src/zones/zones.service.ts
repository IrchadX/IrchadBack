import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ZonesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllPolygonCenters(): Promise<{ latitude: number; longitude: number }[]> {
    const polygons = await this.prisma.env_delimiter.findMany();

    const centers = polygons
      .map((poly) => {
        const coordinates = poly.coordinates?.[0]; // le contour principal
        if (!coordinates || coordinates.length === 0) return null;

        let latSum = 0;
        let lonSum = 0;

        coordinates.forEach(([lon, lat]) => {
          latSum += lat;
          lonSum += lon;
        });

        return {
          latitude: latSum / coordinates.length,
          longitude: lonSum / coordinates.length,
        };
      })
      .filter((center): center is { latitude: number; longitude: number } => center !== null); // <-- typage correct ici

    return centers;
  }
}
