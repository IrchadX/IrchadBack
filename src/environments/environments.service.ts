import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import * as turf from '@turf/turf';

interface Zone {
  id?: number;
  name?: string | null;
  description?: string | null;
  coordinates: any;
  env_id: number | null; // Allow null
  created_at?: Date;
  updated_at?: Date | null;
  type_id?: number | null;
}

interface POI {
  id?: number;
  name?: string | null;
  description?: string | null;
  coordinates: any;
  image_url?: string | null;
  env_id: number | null; // Allow null
  created_at?: Date;
  category_id?: number | null;
}

@Injectable()
export class EnvironmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createEnvironmentDto: CreateEnvironmentDto) {
    const { features, properties } = createEnvironmentDto;

    console.log(
      'Incoming CreateEnvironmentDto:',
      JSON.stringify(createEnvironmentDto, null, 2),
    );

    // Create the environment
    const environment = await this.prisma.environment.create({
      data: {
        format_id: 1,
        name: properties.environment.name,
        is_public: properties.environment.isPublic,
        user_id: Number(properties.environment.userId),
        address: properties.environment.address,
      },
    });

    console.log('Created Environment:', environment);
    const envId = environment.id;

    // Associate environment with the user if it's not public
    if (!environment.is_public) {
      console.log(
        `🔗 Associating environment ${envId} with user ${environment.user_id}`,
      );
      await this.prisma.env_user.create({
        data: {
          user_id: Number(properties.environment.userId),
          env_id: envId,
        },
      });
      console.log('✅ Environment associated with user.');
    }

    // Extract zones and POIs
    const zones = features
      .filter(
        (f) =>
          f.properties.type.startsWith('Zone') || f.properties.type === 'zone',
      )
      .map((f) => ({
        name: f.properties.name,
        description: f.properties.description,
        coordinates: f.geometry.coordinates,
        env_id: envId,
      }));

    const pois = features
      .filter((f) => f.properties.type === 'poi')
      .map((f) => ({
        name: f.properties.name,
        description: f.properties.description,
        coordinates: f.geometry.coordinates,
        image_url: f.properties.image,
        env_id: envId,
      }));

    console.log('*** Extracted Zones:', zones);
    console.log('*** Extracted POIs:', pois);

    // Bulk insert zones and POIs
    await this.prisma.zone.createMany({ data: zones });
    await this.prisma.poi.createMany({ data: pois });

    // 🔍 Fetch inserted zones & POIs with IDs
    const insertedZones = await this.prisma.zone.findMany();
    const insertedPOIs = await this.prisma.poi.findMany();

    console.log('✅ Zones and POIs inserted successfully.');
    this.detectPOIsInsideZones(insertedZones, insertedPOIs);

    return { environment, zones, pois };
  }

  async update(id: string, updateEnvironmentDto: UpdateEnvironmentDto) {
    const envId = Number(id); // Convert id to number
    const { features, properties } = updateEnvironmentDto;

    console.log('🔹 Starting update for environment ID:', envId);

    // Update the environment details
    const environment = await this.prisma.environment.update({
      where: { id: envId },
      data: {
        name: properties.environment.name,
        is_public: properties.environment.isPublic,
        user_id: properties.environment.userId
          ? Number(properties.environment.userId)
          : undefined,
        address: properties.environment.address,
      },
    });

    console.log('✅ Environment updated:', environment);

    // Fetch existing zones and POIs
    const existingZones = await this.prisma.zone.findMany({
      where: { env_id: envId },
    });
    const existingPOIs = await this.prisma.poi.findMany({
      where: { env_id: envId },
    });

    console.log('📌 Existing Zones:', existingZones);
    console.log('📌 Existing POIs:', existingPOIs);

    // Transform GeoJSON features into Zone and POI objects
    const newZones: Zone[] = features
      .filter(
        (f) =>
          f.properties.type.startsWith('Zone') || f.properties.type == 'zone',
      )
      .map((f) => ({
        id: Number(f.properties.id),
        name: f.properties.name || null,
        description: f.properties.description || null,
        coordinates: f.geometry.coordinates,
        env_id: envId, // Fix: Use envId (number) instead of id (string)
      }));

    const newPOIs: POI[] = features
      .filter((f) => f.properties.type === 'poi')
      .map((f) => ({
        id: Number(f.properties.id),
        name: f.properties.name || null,
        description: f.properties.description || null,
        coordinates: f.geometry.coordinates,
        image_url: f.properties.image || null,
        env_id: envId, // Fix: Use envId (number) instead of id (string)
      }));

    console.log('📌 New Zones:', newZones);
    console.log('📌 New POIs:', newPOIs);

    // Detect changes
    console.log('🔍 Detecting changes for Zones...');
    const {
      added: addedZones,
      updated: updatedZones,
      deletedIds: deletedZoneIds,
    } = this.detectChanges(newZones, existingZones);
    console.log('➕ Added Zones:', addedZones);
    console.log('📝 Updated Zones:', updatedZones);
    console.log('❌ Deleted Zone IDs:', deletedZoneIds);

    console.log('🔍 Detecting changes for POIs...');
    const {
      added: addedPOIs,
      updated: updatedPOIs,
      deletedIds: deletedPOIIds,
    } = this.detectChanges(newPOIs, existingPOIs);
    console.log('➕ Added POIs:', addedPOIs);
    console.log('📝 Updated POIs:', updatedPOIs);
    console.log('❌ Deleted POI IDs:', deletedPOIIds);

    // Apply changes: Zones
    await Promise.all([
      ...addedZones.map(
        (zone) => this.prisma.zone.create({ data: { ...zone, env_id: envId } }), // Fix: Use envId
      ),
      ...updatedZones.map((zone) =>
        this.prisma.zone.update({
          where: { id: zone.id as number },
          data: zone,
        }),
      ),
      this.prisma.zone.deleteMany({ where: { id: { in: deletedZoneIds } } }),
    ]);

    console.log('✅ Zones updated successfully.');

    // Apply changes: POIs
    await Promise.all([
      ...addedPOIs.map(
        (poi) => this.prisma.poi.create({ data: { ...poi, env_id: envId } }), // Fix: Use envId
      ),
      ...updatedPOIs.map((poi) =>
        this.prisma.poi.update({ where: { id: poi.id as number }, data: poi }),
      ),
      this.prisma.poi.deleteMany({ where: { id: { in: deletedPOIIds } } }),
    ]);

    console.log('✅ POIs updated successfully.');

    return environment;
  }

  /**
   * Detects added, updated, and deleted elements between the new and existing data.
   */
  private detectChanges(
    newFeatures: (Zone | POI)[],
    existingFeatures: (Zone | POI)[],
  ) {
    console.log('🔄 Running detectChanges...');

    const added: (Zone | POI)[] = [];
    const updated: (Zone | POI)[] = [];
    const deletedIds: number[] = existingFeatures.map((f) => f.id!);

    console.log('📌 Initial Deleted IDs:', deletedIds);

    for (const newFeature of newFeatures) {
      const existing = existingFeatures.find((f) => f.id === newFeature.id);

      if (!existing) {
        console.log('➕ Adding new feature:', newFeature);
        added.push(newFeature);
      } else if (JSON.stringify(existing) !== JSON.stringify(newFeature)) {
        console.log('📝 Updating feature:', newFeature);
        updated.push(newFeature);
      }

      if (newFeature.id) {
        console.log(
          `✔️ Keeping ID ${newFeature.id}, removing from deleted list`,
        );
        deletedIds.splice(deletedIds.indexOf(newFeature.id), 1);
      }
    }

    console.log('📌 Final Deleted IDs:', deletedIds);

    return { added, updated, deletedIds };
  }

  async getAll() {
    return this.prisma.environment.findMany();
  }

  async getOne(id: string) {
    const envId = Number(id);

    const environment = await this.prisma.environment.findUnique({
      where: { id: envId },
      include: {
        zone: true,
        pois: true,
      },
    });

    if (!environment) {
      throw new NotFoundException(`Environment with ID ${envId} not found.`);
    }

    return environment;
  }

  async delete(id: string) {
    const envId = Number(id);

    const environment = await this.prisma.environment.findUnique({
      where: { id: envId },
    });

    if (!environment) {
      throw new NotFoundException(`Environment with ID ${envId} not found.`);
    }

    console.log(`🗑️ Deleting Environment ID: ${envId}`);

    await this.prisma.zone.deleteMany({ where: { env_id: envId } });
    await this.prisma.poi.deleteMany({ where: { env_id: envId } });
    await this.prisma.environment.delete({ where: { id: envId } });

    console.log('✅ Environment, Zones, and POIs deleted successfully.');

    return {
      message: `Environment ${envId} and its related data have been deleted.`,
    };
  }

  private async detectPOIsInsideZones(zones: Zone[], pois: POI[]) {
    console.log('🔍 Checking which POIs are inside zones...');

    for (const poi of pois) {
      for (const zone of zones) {
        const isInside = this.isPOIInsideZone(poi, zone);
        if (await isInside) {
          console.log(`✅ POI "${poi.name}" is inside Zone "${zone.name}"`);
          // Store in DB or log it
        }
      }
    }
  }

  private async isPOIInsideZone(poi: any, zone: any): Promise<boolean> {
    console.log(`Checking POI: ${poi.name} against Zone: ${zone.name}`);

    try {
      const zonePolygon = turf.polygon([zone.coordinates[0]]); // Ensure valid zone polygon
      let isInside = false;

      if (poi.coordinates.length === 1 && poi.coordinates[0].length === 1) {
        // POI is a single point
        const poiPoint = turf.point(poi.coordinates[0][0]);
        isInside = turf.booleanPointInPolygon(poiPoint, zonePolygon);
      } else {
        // POI is a polygon, ensure it's closed
        const fixedPOI = this.fixPolygon(poi.coordinates);
        const poiPolygon = turf.polygon([fixedPOI[0]]);
        isInside = turf.booleanContains(zonePolygon, poiPolygon);
      }

      if (isInside) {
        console.log(`✅ POI "${poi.name}" is inside Zone "${zone.name}"`);

        // Insert into poi_zone table if not already there
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

  private fixPolygon = (coordinates: number[][][]) => {
    const firstPoint = coordinates[0][0];
    const lastPoint = coordinates[0][coordinates[0].length - 1];

    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      coordinates[0].push(firstPoint); // Close the polygon
    }
    return coordinates;
  };
}
