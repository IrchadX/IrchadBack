import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { CreateBasicEnvironmentDto } from './dto/create-basic-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { CreateZoneDto } from '../zones/dto/create-zone.dto';
import { CreatePoiDto } from '../pois/dto/create-poi.dto';
import { POIZoneUtils } from '../../utils/poi-zone.utils';
import { FiltersDto } from './dto/filter.dto';

@Injectable()
export class EnvironmentsService {
  private poiZoneUtils: POIZoneUtils;

  constructor(private prisma: PrismaService) {
    this.poiZoneUtils = new POIZoneUtils(prisma);
  }

  async finalize(id: number, finalizeEnvironmentDto: any) {
    console.log(
      `Finalizing environment ${id} with data:`,
      finalizeEnvironmentDto,
    );

    if (finalizeEnvironmentDto.type !== 'FeatureCollection') {
      throw new Error('Invalid GeoJSON format: Must be a FeatureCollection');
    }

    const { features, properties } = finalizeEnvironmentDto;

    // First, check if the environment exists and is in pending status
    const existingEnvironment = await this.prisma.environment.findUnique({
      where: { id },
      include: { map: true },
    });

    if (!existingEnvironment) {
      throw new NotFoundException(`Environment with ID ${id} not found`);
    }

    // Validate all feature geometries
    for (const feature of features) {
      this.validateGeometry(feature.geometry);
    }

    // Update the environment with new properties if needed
    await this.prisma.environment.update({
      where: { id },
      data: {
        name: properties.environment.name || existingEnvironment.name,
        address: properties.environment.address || existingEnvironment.address,
      },
    });

    console.log(`Updated Environment ${id} - no longer pending`);

    // Get or create a map if doesn't exist
    let mapId = existingEnvironment.map_id;
    if (!mapId) {
      const map = await this.prisma.map.create({
        data: { format_id: 1 },
      });
      mapId = map.id;

      // Update environment with map ID if it was created
      await this.prisma.environment.update({
        where: { id },
        data: { map_id: mapId },
      });
    }

    const envId = id;
    const userId = Number(properties.environment.userId);

    // Handle environment delimiter
    const environmentFeature = features.find(
      (f) => f.properties.type === 'environment',
    );

    if (environmentFeature) {
      // Check if delimiter already exists
      const existingDelimiter = await this.prisma.env_delimiter.findFirst({
        where: { env_id: envId },
      });

      if (existingDelimiter) {
        // Update existing delimiter
        await this.prisma.env_delimiter.update({
          where: { id: existingDelimiter.id },
          data: { coordinates: environmentFeature.geometry.coordinates },
        });
      } else {
        // Create new delimiter
        await this.prisma.env_delimiter.create({
          data: {
            env_id: envId,
            coordinates: environmentFeature.geometry.coordinates,
          },
        });
      }
      console.log('✅ Updated environment delimiter.');
    }

    // Check if user association exists, create if needed
    if (properties.environment.userId) {
      const existingAssociation = await this.prisma.env_user.findFirst({
        where: {
          user_id: userId,
          env_id: envId,
        },
      });

      if (!existingAssociation) {
        console.log(`🔗 Associating environment ${envId} with user ${userId}`);
        await this.prisma.env_user.create({
          data: {
            user_id: userId,
            env_id: envId,
          },
        });
      }
    }

    await this.prisma.zone.deleteMany({
      where: { env_id: envId },
    });

    await this.prisma.poi.deleteMany({
      where: { env_id: envId },
    });

    // Extract and create new zones and POIs
    const zones = features
      .filter((f) => f.properties.typeId != null)
      .map((f) => ({
        name: f.properties.name,
        description: f.properties.description,
        coordinates: f.geometry.coordinates,
        env_id: envId,
        map_id: mapId,
      }));

    const pois = features
      .filter((f) => f.properties.type === 'poi')
      .map((f) => ({
        name: f.properties.name,
        description: f.properties.description,
        coordinates: f.geometry.coordinates,
        image_url: f.properties.image,
        env_id: envId,
        map_id: mapId,
      }));

    console.log('*** Creating Zones:', zones);
    console.log('*** Creating POIs:', pois);

    // Bulk insert zones and POIs
    zones.length > 0 && (await this.prisma.zone.createMany({ data: zones }));
    pois.length > 0 && (await this.prisma.poi.createMany({ data: pois }));

    // Fetch inserted zones & POIs with IDs
    const insertedZones = await this.prisma.zone.findMany({
      where: { env_id: envId },
    });

    const insertedPOIs = await this.prisma.poi.findMany({
      where: { env_id: envId },
    });

    console.log('✅ Zones and POIs inserted successfully.');

    // Process POIs inside zones detection if both exist
    if (insertedPOIs.length > 0 && insertedZones.length > 0) {
      await this.poiZoneUtils.detectPOIsInsideZones(
        insertedZones,
        insertedPOIs,
      );
    }

    // Return the finalized environment with zones and POIs
    return {
      environment: await this.prisma.environment.findUnique({
        where: { id: envId },
      }),
      zones: insertedZones,
      pois: insertedPOIs,
    };
  }

  async create(createEnvironmentDto: CreateEnvironmentDto) {
    console.log(createEnvironmentDto);
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
        // user_id: Number(properties.environment.userId),
        address: properties.environment.address,
        map_id: map.id,
      },
    });

    console.log('Created Environment:', environment);

    const envId = environment.id;
    const userId = Number(properties.environment.userId);
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

    // console.log(
    //   `🔗 Associating environment ${envId} with user ${environment.user_id}`,
    // );

    // create environment -> user correspondance
    if (properties.environment.userId) {
      console.log(`🔗 Associating environment ${envId} with user ${userId}`);

      await this.prisma.env_user.create({
        data: {
          user_id: userId,
          env_id: envId,
        },
      });
    } else {
      console.log(`⚠️ Skipping association because user_id is missing.`);
    }

    // extract zones and POIs from the posted geojson
    const zones = features
      .filter((f) => f.properties.type === 'zone')
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

  //create the environment instance and attach it to the user (created by commercial)
  async createBasicEnvironment(basicEnvDto: CreateBasicEnvironmentDto) {
    const { name, description, address, isPublic, surface, userId } =
      basicEnvDto;

    console.log('🔹 Creating Basic Environment:', basicEnvDto);

    // create the map
    const map = await this.prisma.map.create({
      data: { format_id: 1 },
    });

    console.log('Created Map:', map);

    // create the environment
    const environment = await this.prisma.environment.create({
      data: {
        name,
        description,
        is_public: isPublic,
        address,
        surface,
        map_id: map.id,
      },
    });

    console.log('Created Environment:', environment);

    // create environment -> user correspondance
    if (userId) {
      console.log(
        `🔗 Associating environment ${environment.id} with user ${userId}`,
      );

      await this.prisma.env_user.create({
        data: {
          user_id: userId,
          env_id: environment.id,
        },
      });
    } else {
      console.log(`⚠️ Skipping association because user_id is missing.`);
    }

    return environment;
  }

  async update(id: string, updateEnvironmentDto: any) {
    console.log('Incoming update data:', updateEnvironmentDto);
    const envId = Number(id); // convert the id into a number
    const { features, properties } = updateEnvironmentDto;

    console.log('🔹 Starting update for environment ID:', envId);

    // determine the updated environment data
    const updateData: any = {
      name: properties.environment.name,
      address: properties.environment.address,
      is_public: properties.environment.isPublic,
      description: properties.environment.description,
    };

    console.log('Environment update data:', updateData);
    let userId: number | null = Number(properties.environment.userId);

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
        // update if user has changed
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

    // FIXED: Transform GeoJSON features into Zone and POI objects
    // Now checking for properties.type === 'zone' OR properties.typeId === 'zone'
    const newZones: CreateZoneDto[] = features
      .filter(
        (f) => f.properties.type === 'zone' || f.properties.typeId != null,
      )
      .map((f) => ({
        id: Number(f.properties.id),
        name: f.properties.name || null,
        description: f.properties.description || null,
        coordinates: f.geometry.coordinates,
        env_id: envId,
      }));

    // Check for POIs using multiple possible property identifiers
    const newPOIs: CreatePoiDto[] = features
      .filter(
        (f) => f.properties.type === 'poi' || f.properties.typeId === 'poi',
      )
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
      // Handle additions (filter out id if it's 0 or invalid)
      ...addedZones.map((zone) => {
        const { id, ...zoneData } = zone;
        return this.prisma.zone.create({
          data: {
            ...zoneData,
            env_id: envId,
          },
        });
      }),

      // Handle updates (only for zones with valid IDs)
      ...updatedZones.map((zone) => {
        if (!zone.id) {
          console.warn(
            `Attempted to update zone without ID: ${JSON.stringify(zone)}`,
          );
          return Promise.resolve(null); // Skip invalid updates
        }
        return this.prisma.zone.update({
          where: { id: zone.id },
          data: zone,
        });
      }),

      // Handle deletions
      deletedZoneIds.length > 0
        ? this.prisma.zone.deleteMany({
            where: { id: { in: deletedZoneIds.filter((id) => id > 0) } },
          })
        : Promise.resolve(null), // Skip if no deletions
    ]);

    console.log('✅ Zones updated successfully.');

    // Apply changes: POIs
    await Promise.all([
      ...addedPOIs.map((poi) => {
        const { id, ...poiData } = poi;
        return this.prisma.poi.create({
          data: {
            ...poiData,
            env_id: envId,
          },
        });
      }),
      ...updatedPOIs.map((poi) =>
        this.prisma.poi.update({
          where: { id: poi.id as number },
          data: poi,
        }),
      ),
      deletedPOIIds.length > 0
        ? this.prisma.poi.deleteMany({
            where: { id: { in: deletedPOIIds.filter((id) => id > 0) } },
          })
        : Promise.resolve(null), // Skip if no deletions
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

    // Only consider features with valid IDs for deletion
    const deletedIds: number[] = existingFeatures
      .filter((f) => f.id !== undefined && f.id !== null && f.id !== 0)
      .map((f) => f.id!);

    console.log('📌 Initial Deleted IDs:', deletedIds);

    for (const newFeature of newFeatures) {
      // Treat features with no ID or ID=0 as new
      if (!newFeature.id || newFeature.id === 0) {
        console.log('➕ Adding new feature (no ID):', newFeature);
        added.push(newFeature);
        continue;
      }

      const existing = existingFeatures.find((f) => f.id === newFeature.id);

      if (!existing) {
        console.log(
          '❓ Feature with ID not found in existing - should not happen:',
          newFeature,
        );
        continue;
      }

      if (JSON.stringify(existing) !== JSON.stringify(newFeature)) {
        console.log('📝 Updating feature:', newFeature);
        updated.push(newFeature);
      }

      // Remove this ID from deletion list since it exists in new features
      const index = deletedIds.indexOf(newFeature.id);
      if (index > -1) {
        console.log(
          `✔️ Keeping ID ${newFeature.id}, removing from deleted list`,
        );
        deletedIds.splice(index, 1);
      }
    }

    console.log('📌 Final Deleted IDs:', deletedIds);
    console.log(
      `📊 Changes detected: ${added.length} added, ${updated.length} updated, ${deletedIds.length} to delete`,
    );

    return { added, updated, deletedIds };
  }

  async getAll(filters: FiltersDto = {}, searchValue: string = '') {
    const environments = await this.prisma.environment.findMany({
      where: {
        AND: [
          searchValue
            ? {
                OR: [
                  { name: { contains: searchValue, mode: 'insensitive' } },
                  { address: { contains: searchValue, mode: 'insensitive' } },
                ],
              }
            : {},

          filters.visibility?.length
            ? filters.visibility.includes('Public') &&
              filters.visibility.includes('Privé')
              ? {} // no filtering, show all (both selected)
              : {
                  is_public: filters.visibility.includes('Public')
                    ? true
                    : false,
                }
            : {},

          // Only include environments that HAVE at least one env_delimiter
          {
            env_delimiter: {
              some: {},
            },
          },
        ],
      },
    });

    return environments;
  }

  async getPending(filters: FiltersDto = {}, searchValue: string = '') {
    const environments = await this.prisma.environment.findMany({
      where: {
        AND: [
          searchValue
            ? {
                OR: [
                  { name: { contains: searchValue, mode: 'insensitive' } },
                  { address: { contains: searchValue, mode: 'insensitive' } },
                ],
              }
            : {},

          filters.visibility?.length
            ? filters.visibility.includes('Public') &&
              filters.visibility.includes('Privé')
              ? {} // no filtering, show all (both selected)
              : {
                  is_public: filters.visibility.includes('Public')
                    ? true
                    : false,
                }
            : {},

          // Filter for environments with no env_delimiter
          {
            env_delimiter: {
              none: {},
            },
          },
        ],
      },
    });

    return environments;
  }
  // returns one environment whose id is 'id'
  async getOne(id: string) {
    const envId = Number(id);

    const environment = await this.prisma.environment.findUnique({
      where: { id: envId },
      include: {
        zone: true,
        poi: true,
        env_user: true,
      },
    });

    if (!environment) {
      throw new NotFoundException(`Environment with ID ${envId} not found.`);
    }

    return {
      environment,
      zones: environment.zone,
      pois: environment.poi,
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
