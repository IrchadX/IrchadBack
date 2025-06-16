import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ZoneService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllPolygonCenters(): Promise<{ latitude: number; longitude: number }[]> {
    try {
      const polygons = await this.prisma.env_delimiter.findMany();
      
      console.log(`Nombre de polygones trouvés: ${polygons.length}`);
      
      if (polygons.length === 0) {
        console.log('Aucun polygone trouvé dans la base de données');
        return [];
      }

      const centers = polygons
        .map((poly, index) => {
          return this.calculatePolygonCenter(poly.coordinates, index + 1);
        })
        .filter((center): center is { latitude: number; longitude: number } => 
          center !== null
        );

      console.log(`Centres calculés avec succès: ${centers.length}/${polygons.length}`);
      return centers;

    } catch (error) {
      console.error('Erreur dans getAllPolygonCenters:', error);
      throw error;
    }
  }

  private calculatePolygonCenter(coordinates: any, polygonId: number): { latitude: number; longitude: number } | null {
    try {
      // Vérifier que nous avons des coordonnées
      if (!coordinates) {
        console.log(`Polygone ${polygonId}: Pas de coordonnées`);
        return null;
      }

      let points: [number, number][] = [];

      // Format attendu: [[[lng, lat], [lng, lat], ...]]
      if (Array.isArray(coordinates) && coordinates.length > 0) {
        const firstRing = coordinates[0]; // Premier anneau (contour extérieur)
        
        if (Array.isArray(firstRing) && firstRing.length > 0) {
          // Vérifier que les points sont au bon format [lng, lat]
          const validPoints = firstRing.filter((point: any) => 
            Array.isArray(point) && 
            point.length >= 2 && 
            typeof point[0] === 'number' && 
            typeof point[1] === 'number'
          );

          if (validPoints.length === 0) {
            console.log(`Polygone ${polygonId}: Aucun point valide trouvé`);
            return null;
          }

          points = validPoints;
          console.log(`Polygone ${polygonId}: ${points.length} points valides`);
        } else {
          console.log(`Polygone ${polygonId}: Format d'anneau invalide`);
          return null;
        }
      } else {
        console.log(`Polygone ${polygonId}: Format de coordonnées invalide`);
        return null;
      }

      // Calculer le centroïde
      const center = this.computeCentroid(points);
      
      if (!center) {
        console.log(`Polygone ${polygonId}: Impossible de calculer le centroïde`);
        return null;
      }

      // Vérifier que les coordonnées sont dans des plages valides
      if (!this.isValidCoordinate(center.latitude, center.longitude)) {
        console.log(`Polygone ${polygonId}: Coordonnées invalides`, center);
        return null;
      }

      console.log(`Polygone ${polygonId}: Centre calculé [${center.longitude.toFixed(6)}, ${center.latitude.toFixed(6)}]`);
      return center;

    } catch (error) {
      console.error(`Erreur lors du calcul du centroïde du polygone ${polygonId}:`, error);
      return null;
    }
  }

  private computeCentroid(points: [number, number][]): { latitude: number; longitude: number } | null {
    if (points.length === 0) return null;

    // Méthode simple: moyenne arithmétique des points
    // Pour des polygones complexes, on pourrait utiliser l'algorithme du centroïde géométrique
    let longitudeSum = 0;
    let latitudeSum = 0;
    let validPointsCount = 0;

    for (const [lng, lat] of points) {
      if (this.isValidCoordinate(lat, lng)) {
        longitudeSum += lng;
        latitudeSum += lat;
        validPointsCount++;
      }
    }

    if (validPointsCount === 0) {
      return null;
    }

    return {
      latitude: latitudeSum / validPointsCount,
      longitude: longitudeSum / validPointsCount
    };
  }

  private isValidCoordinate(latitude: number, longitude: number): boolean {
    return !isNaN(latitude) && 
           !isNaN(longitude) && 
           latitude >= -90 && latitude <= 90 && 
           longitude >= -180 && longitude <= 180 &&
           !(latitude === 0 && longitude === 0); // Éviter les points (0,0) suspects
  }

  // Méthode de debug pour analyser quelques polygones
  async debugPolygons(limit: number = 3) {
    try {
      const polygons = await this.prisma.env_delimiter.findMany({ take: limit });
      
      const debug = polygons.map((poly, index) => {
        const coords = poly.coordinates as any;
        let analysis = {
          id: poly.id,
          index: index + 1,
          hasCoordinates: !!coords,
          isArray: Array.isArray(coords),
          length: Array.isArray(coords) ? coords.length : 0,
          firstRingLength: 0,
          samplePoints: [] as any[],
          calculatedCenter: null as any
        };

        if (Array.isArray(coords) && coords.length > 0 && Array.isArray(coords[0])) {
          analysis.firstRingLength = coords[0].length;
          analysis.samplePoints = coords[0].slice(0, 3); // 3 premiers points
          analysis.calculatedCenter = this.calculatePolygonCenter(coords, index + 1);
        }

        return analysis;
      });

      return {
        totalPolygons: await this.prisma.env_delimiter.count(),
        analyzedPolygons: debug
      };

    } catch (error) {
      console.error('Erreur lors du debug:', error);
      throw error;
    }
  }

  // Méthode pour obtenir des données brutes (debug)
  async getRawPolygons(limit: number = 5) {
    try {
      return await this.prisma.env_delimiter.findMany({ 
        take: limit,
        select: {
          id: true,
          coordinates: true
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des données brutes:', error);
      throw error;
    }
  }
}