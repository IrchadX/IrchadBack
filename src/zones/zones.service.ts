import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ZonesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllPolygonCenters(): Promise<{ latitude: number; longitude: number }[]> {
    const polygons = await this.prisma.env_delimiter.findMany();

    const centers = polygons
      .map((poly) => {
        const data = poly.coordinates as { points: { x: number; y: number }[] };
        const points = data?.points;

        if (!points || points.length === 0) return null;

        let xSum = 0;
        let ySum = 0;

        points.forEach(({ x, y }) => {
          xSum += x;
          ySum += y;
        });

        return {
          latitude: ySum / points.length,   // y = latitude
          longitude: xSum / points.length,  // x = longitude
        };
      })
      .filter((center): center is { latitude: number; longitude: number } => center !== null);

    return centers;
  }
}
