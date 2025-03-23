import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';

@Injectable()
export class EnvironmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createEnvironmentDto: CreateEnvironmentDto) {
    const { features, properties } = createEnvironmentDto;

    // Create the environment
    const environment = await this.prisma.environment.create({
      data: {
        name: properties.environment.name,
        is_public: properties.environment.isPublic,
        user_id: properties.environment.userId,
        address: properties.environment.address,
        zones: {
          create: features
            .filter(
              (feature) =>
                feature.properties.type === 'zone' ||
                feature.properties.type.startsWith('Zone'),
            )
            .map((feature) => ({
              name: feature.properties.nom,
              description: feature.properties.description,
              type: feature.properties.type,
              coordinates: feature.geometry.coordinates,
            })),
        },
        pois: {
          create: features
            .filter((feature) => feature.properties.type === 'poi')
            .map((feature) => ({
              name: feature.properties.nom,
              description: feature.properties.description,
              type: feature.properties.categorie,
              coordinates: feature.geometry.coordinates,
              image_url: feature.properties.image,
              category_id: feature.properties.categoryId, // Assuming categoryId is provided
            })),
        },
      },
      include: { zones: true, pois: true },
    });

    // Link POIs to zones through poi_zone
    for (const feature of features) {
      if (feature.properties.type === 'poi' && feature.properties.zoneId) {
        await this.prisma.poi_zone.create({
          data: {
            poiId: environment.pois.find(
              (poi) => poi.name === feature.properties.nom,
            )?.id,
            zoneId: feature.properties.zoneId,
          },
        });
      }
    }

    return environment;
  }

  async update(id: number, updateEnvironmentDto: UpdateEnvironmentDto) {
    const { features, properties } = updateEnvironmentDto;

    // Update the environment
    const environment = await this.prisma.environment.update({
      where: { id },
      data: {
        name: properties.environment.name,
        is_public: properties.environment.isPublic,
        user_id: properties.environment.userId,
        address: properties.environment.address,
      },
      include: { zones: true, pois: true },
    });

    // Get existing zones and POIs
    const existingZones = environment.zones;
    const existingPOIs = environment.pois;

    // Detect changes
    for (const feature of features) {
      const { properties: featureProps, geometry, id: featureId } = feature;

      if (featureProps.type === 'zone') {
        // Check if the zone already exists
        const existingZone = existingZones.find(
          (zone) => zone.id === featureId,
        );

        if (existingZone) {
          // Update the zone
          await this.prisma.zone.update({
            where: { id: featureId },
            data: {
              name: featureProps.nom,
              description: featureProps.description,
              type: featureProps.type,
              coordinates: geometry.coordinates,
            },
          });
        } else {
          // Create a new zone
          await this.prisma.zone.create({
            data: {
              name: featureProps.nom,
              description: featureProps.description,
              type: featureProps.type,
              coordinates: geometry.coordinates,
              environmentId: environment.id,
            },
          });
        }
      } else if (featureProps.type === 'poi') {
        // Check if the POI already exists
        const existingPOI = existingPOIs.find((poi) => poi.id === featureId);

        if (existingPOI) {
          // Update the POI
          await this.prisma.poi.update({
            where: { id: featureId },
            data: {
              name: featureProps.nom,
              description: featureProps.description,
              type: featureProps.categorie,
              coordinates: geometry.coordinates,
              image_url: featureProps.image,
              category_id: featureProps.categoryId,
            },
          });
        } else {
          // Create a new POI
          await this.prisma.poi.create({
            data: {
              name: featureProps.nom,
              description: featureProps.description,
              type: featureProps.categorie,
              coordinates: geometry.coordinates,
              image_url: featureProps.image,
              category_id: featureProps.categoryId,
              env_id: environment.id,
            },
          });
        }

        // Link POI to zone (if applicable)
        if (featureProps.zoneId) {
          await this.prisma.poi_zone.create({
            data: {
              poiId: featureId,
              zoneId: featureProps.zoneId,
            },
          });
        }
      }
    }

    // Detect deleted zones and POIs
    const existingZoneIds = existingZones.map((zone) => zone.id);
    const newZoneIds = features
      .filter((feature) => feature.properties.type === 'zone')
      .map((feature) => feature.id);
    const deletedZoneIds = existingZoneIds.filter(
      (id) => !newZoneIds.includes(id),
    );

    const existingPOIIds = existingPOIs.map((poi) => poi.id);
    const newPOIIds = features
      .filter((feature) => feature.properties.type === 'poi')
      .map((feature) => feature.id);
    const deletedPOIIds = existingPOIIds.filter(
      (id) => !newPOIIds.includes(id),
    );

    // Delete zones and POIs that no longer exist
    await this.prisma.zone.deleteMany({
      where: { id: { in: deletedZoneIds } },
    });

    await this.prisma.poi.deleteMany({
      where: { id: { in: deletedPOIIds } },
    });

    return environment;
  }
}
