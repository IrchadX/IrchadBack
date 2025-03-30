import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { CreateZoneDto } from '../zones/dto/create-zone.dto';
import { CreatePoiDto } from '../pois/dto/create-poi.dto';
import { POIZoneUtils } from '../utils/poi-zone.utils';

@Injectable()
export class EnvironmentsService {
  private poiZoneUtils: POIZoneUtils;

  constructor(private prisma: PrismaService) {
    this.poiZoneUtils = new POIZoneUtils(prisma);
  }

  async create(createEnvironmentDto: CreateEnvironmentDto) {
    if (createEnvironmentDto.type !== 'FeatureCollection') {
      throw new Error('Invalid GeoJSON format: Must be a FeatureCollection');
    }

    const { features, properties } = createEnvironmentDto;

    console.log(
      'Incoming CreateEnvironmentDto:',
      JSON.stringify(createEnvironmentDto, null, 2),
    );

    for (const feature of features) {
      this.validateGeometry(feature.geometry);
    }

    // create the map
    const map = await this.prisma.map.create({
      data: { format_id: 1 },
    });

    console.log('Created Map:', map);

    // create the environment
    const environment = await this.prisma.environment.create({
      data: {
        name: properties.environment.name,
        user_id: properties.environment.userId
          ? Number(properties.environment.userId)
          : 0,
        address: properties.environment.address,
        map_id: map.id,
      },
    });

    console.log('Created Environment:', environment);

    const envId = environment.id;

    const environmentFeature = features.find(
      (f) => f.properties.type === 'environment',
    );
    // create environment delimiter
    if (environmentFeature) {
      await this.prisma.env_delimiter.create({
        data: {
          env_id: envId,
          coordinates: environmentFeature.geometry.coordinates,
        },
      });
      console.log('✅ Inserted environment delimiter.');
    }

    console.log(
      `🔗 Associating environment ${envId} with user ${environment.user_id}`,
    );

    // create environment -> user correspondance
    if (properties.environment.userId) {
      await this.prisma.env_user.create({
        data: {
          user_id: Number(properties.environment.userId),
          env_id: envId,
        },
      });
    } else {
      console.log(`⚠️ Skipping association because user_id is missing.`);
    }

    // extract zones and POIs from the posted geojson
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
        map_id: map.id,
      }));

    const pois = features
      .filter((f) => f.properties.type === 'poi')
      .map((f) => ({
        name: f.properties.name,
        description: f.properties.description,
        coordinates: f.geometry.coordinates,
        image_url: f.properties.image,
        env_id: envId,
        map_id: map.id,
      }));

    console.log('*** Extracted Zones:', zones);
    console.log('*** Extracted POIs:', pois);

    // Bulk insert zones and POIs
    zones.length > 0 && (await this.prisma.zone.createMany({ data: zones }));
    pois.length > 0 && (await this.prisma.poi.createMany({ data: pois }));

    // 🔍 Fetch inserted zones & POIs with IDs
    const insertedZones = await this.prisma.zone.findMany({
      where: { env_id: envId },
    });

    const insertedPOIs = await this.prisma.poi.findMany({
      where: { env_id: envId },
    });
    console.log('✅ Zones and POIs inserted successfully.');
    insertedPOIs &&
      insertedZones &&
      this.poiZoneUtils.detectPOIsInsideZones(insertedZones, insertedPOIs);

    return { environment, zones, pois };
  }

  async update(id: string, updateEnvironmentDto: UpdateEnvironmentDto) {
    const envId = Number(id); // convert the id into a number
    const { features, properties } = updateEnvironmentDto;

    console.log('🔹 Starting update for environment ID:', envId);

    // determine the updated environment data
    const updateData: any = {
      name: properties.environment.name,
      address: properties.environment.address,
      user_id: properties.environment.isPublic
        ? null
        : Number(properties.environment.userId),
    };

    let userId: number | null = null;

    // handle user_id logic based on `isPublic`
    if (properties.environment.userId == null) {
      updateData.user_id = null; // public environments don't have an owner
    } else if (properties.environment.userId) {
      userId = Number(properties.environment.userId);
      updateData.user_id = userId; // update the user_id field
    }

    // update the environment information
    const environment = await this.prisma.environment.update({
      where: { id: envId },
      data: updateData,
    });

    console.log('✅ Environment updated:', environment);

    //  Handle `env_user` table updates
    if (properties.environment.isPublic) {
      // if public, remove all `env_user` records for this env
      await this.prisma.env_user.deleteMany({ where: { env_id: envId } });
      console.log(
        '❌ Removed all env_user records (Environment is now public)',
      );
    } else if (userId) {
      // if private, ensure user is correctly assigned
      const existingEnvUser = await this.prisma.env_user.findFirst({
        where: { env_id: envId },
      });

      if (existingEnvUser) {
        // upadte if user has changed
        if (existingEnvUser.user_id !== userId) {
          await this.prisma.env_user.update({
            where: { id: existingEnvUser.id },
            data: { user_id: userId },
          });
          console.log(`🔄 Updated env_user: Set new user_id ${userId}`);
        }
      } else {
        // create a new record if missing
        await this.prisma.env_user.create({
          data: { env_id: envId, user_id: userId },
        });
        console.log(`➕ Added env_user record for user_id ${userId}`);
      }
    }

    // fetch existing zones and POIs
    const existingZones = await this.prisma.zone.findMany({
      where: { env_id: envId },
    });
    const existingPOIs = await this.prisma.poi.findMany({
      where: { env_id: envId },
    });

    console.log('📌 Existing Zones:', existingZones);
    console.log('📌 Existing POIs:', existingPOIs);

    // transform GeoJSON features into Zone and POI objects
    const newZones: CreateZoneDto[] = features
      .filter(
        (f) =>
          f.properties.type.startsWith('Zone') || f.properties.type == 'zone',
      )
      .map((f) => ({
        id: Number(f.properties.id),
        name: f.properties.name || null,
        description: f.properties.description || null,
        coordinates: f.geometry.coordinates,
        env_id: envId,
      }));

    const newPOIs: CreatePoiDto[] = features
      .filter((f) => f.properties.type === 'poi')
      .map((f) => ({
        id: Number(f.properties.id),
        name: f.properties.name || null,
        description: f.properties.description || null,
        coordinates: f.geometry.coordinates,
        image_url: f.properties.image || null,
        env_id: envId,
      }));

    console.log('📌 New Zones:', newZones);
    console.log('📌 New POIs:', newPOIs);

    // detect changes in coordinates
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
      ...addedZones.map((zone) =>
        this.prisma.zone.create({ data: { ...zone, env_id: envId } }),
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
      ...addedPOIs.map((poi) =>
        this.prisma.poi.create({ data: { ...poi, env_id: envId } }),
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
    newFeatures: (CreateZoneDto | CreatePoiDto)[],
    existingFeatures: (CreateZoneDto | CreatePoiDto)[],
  ) {
    console.log('🔄 Running detectChanges...');

    const added: (CreateZoneDto | CreatePoiDto)[] = [];
    const updated: (CreateZoneDto | CreatePoiDto)[] = [];
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
        for (const newFeature of newFeatures) {
          if (newFeature.id) {
            const index = deletedIds.indexOf(newFeature.id);
            if (index > -1) {
              deletedIds.splice(index, 1);
            }
          }
        }
      }
    }

    console.log('📌 Final Deleted IDs:', deletedIds);

    return { added, updated, deletedIds };
  }

  // returns a list of al the environments
  async getAll() {
    return this.prisma.environment.findMany();
  }

  // returns one environment whose id is 'id'
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

    return {
      environment,
      zones: environment.zone,
      pois: environment.pois,
    };
  }

  // deletes te environment whose id is 'id'
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

  private validateGeometry(geometry: any): void {
    if (!geometry || !geometry.type || !geometry.coordinates) {
      throw new Error('Invalid geometry type');
    }

    switch (geometry.type) {
      case 'Point':
        if (
          !Array.isArray(geometry.coordinates) ||
          geometry.coordinates.length !== 2
        ) {
          throw new Error(
            'Invalid Point coordinates: Expected [number, number]',
          );
        }
        break;

      case 'LineString':
        if (
          !Array.isArray(geometry.coordinates) ||
          geometry.coordinates.length < 2 ||
          !geometry.coordinates.every(
            (coord: any) => Array.isArray(coord) && coord.length === 2,
          )
        ) {
          throw new Error(
            'Invalid LineString coordinates: Expected at least two [number, number] pairs',
          );
        }
        break;

      case 'Polygon':
        if (
          !Array.isArray(geometry.coordinates) ||
          geometry.coordinates.length === 0 ||
          !geometry.coordinates.every(
            (ring: any) =>
              Array.isArray(ring) &&
              ring.length >= 4 &&
              ring.every(
                (coord: any) => Array.isArray(coord) && coord.length === 2,
              ),
          )
        ) {
          throw new Error(
            'Invalid Polygon coordinates: Expected at least one ring with 4+ [number, number] pairs',
          );
        }

        // Check if polygon is closed (first and last points should be equal)
        const firstRing = geometry.coordinates[0];
        const firstPoint = firstRing[0];
        const lastPoint = firstRing[firstRing.length - 1];
        if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
          throw new Error(
            'Invalid Polygon: First and last points must be equal',
          );
        }
        break;

      default:
        throw new Error(`Unsupported geometry type`);
    }
  }
}
