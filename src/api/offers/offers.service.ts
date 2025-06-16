import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupérer les environnements d'un utilisateur donné
   * @param userId ID de l'utilisateur
   */
  async getUserEnvironments(userId: number) {
    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(
        `Utilisateur avec l'ID ${userId} introuvable`,
      );
    }

    // Récupérer les environnements associés à l'utilisateur
    const environments = await this.prisma.environment.findMany({
      where: {
        env_user: {
          some: {
            user_id: userId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        surface: true,
        is_public: true,
      },
    });

    if (environments.length === 0) {
      throw new NotFoundException(
        `Aucun environnement trouvé pour l'utilisateur avec l'ID ${userId}`,
      );
    }

    return environments;
  }

  /**
   * Calculer le prix de chaque environnement pour un utilisateur donné
   * @param userId ID de l'utilisateur
   */
  async calculateEnvironmentPricing(userId: number) {
    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(
        `Utilisateur avec l'ID ${userId} introuvable`,
      );
    }

    // Récupérer les environnements associés à l'utilisateur
    const environments = await this.prisma.environment.findMany({
      where: {
        env_user: {
          some: {
            user_id: userId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        surface: true,
      },
    });

    if (environments.length === 0) {
      throw new NotFoundException(
        `Aucun environnement trouvé pour l'utilisateur avec l'ID ${userId}`,
      );
    }

    // Récupérer le tarif unitaire par mètre carré
    const pricing = await this.prisma.pricing.findFirst();
    if (!pricing || !pricing.price) {
      throw new NotFoundException(
        'Tarif unitaire non défini dans la table pricing',
      );
    }

    const unitPrice = pricing.price;

    // Calculer le prix pour chaque environnement
    return environments.map((env) => {
      const surface = env.surface || 0;
      const price = surface * unitPrice;

      return {
        ...env,
        price: price.toFixed(2), // Formater le prix avec 2 décimales
      };
    });
  }

  /**
   * Récupérer l'accès aux environnements publics d'un utilisateur donné
   * @param userId ID de l'utilisateur
   */
  async getUserAccess(userId: number) {
    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} introuvable`);
    }

    // Récupérer les informations d'accès de l'utilisateur
    const access = await this.prisma.purchase_history.findFirst({
      where: { user_id: userId },
      select: {
        public: true,
      },
    });

    if (!access) {
      throw new NotFoundException(
        `Aucun accès trouvé pour l'utilisateur avec l'ID ${userId}`,
      );
    }

    const public_pricing = await this.prisma.pricing.findFirst({
      where : {attribute : "public"},
      select : {
        price: true,
      }
    });
    if (!public_pricing || !public_pricing.price) {
      throw new NotFoundException('Tarif des environnements publics non défini dans la table pricing');
    }

    if (access.public){
      return public_pricing.price.toFixed(2);
    }else{
      return 0;
    }
  }


  /**
   * Récupérer les environnements d'un utilisateur donné
   * @param userId ID de l'utilisateur
   */

  async getUserDevice(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(
        `Utilisateur avec l'ID ${userId} introuvable`,
      );
    }

    // get the user device
    return await this.prisma.device.findMany({
      where: {
        user_id: userId,
      },
      select: {
        id: true,
        date_of_service: true,
        price: true,
        device_type: {
          select: {
            type: true,
          },
        },
      },
    });
  }

  /**
   * Calculer le prix total d'une liste d'environnements
   * @param environments Liste des environnements avec leur surface
   * @param includePublicAccess Booléen indiquant si l'accès public doit être inclus
   * @param device Objet device contenant un prix
   * @returns Le prix total calculé
   */
  async estimateTotalPrice(
    environments: { surface: number }[],
    includePublicAccess: boolean,
    device: { price?: number },
  ): Promise<number> {
    // Récupérer le tarif unitaire par mètre carré
    const surfacePricing = await this.prisma.pricing.findFirst({
      where: { attribute: 'surface' },
    });

    if (!surfacePricing || !surfacePricing.price) {
      throw new NotFoundException(
        'Tarif unitaire pour la surface non défini dans la table pricing',
      );
    }

    const unitPrice = surfacePricing.price;

    // Calculer le prix total des environnements
    const totalEnvironmentPrice = environments.reduce((sum, env) => {
      return sum + env.surface * unitPrice;
    }, 0);

    // Ajouter le prix de l'accès public si nécessaire
    let publicAccessPrice = 0;
    if (includePublicAccess) {
      const publicPricing = await this.prisma.pricing.findFirst({
        where: { attribute: 'public' },
      });

      if (!publicPricing || !publicPricing.price) {
        throw new NotFoundException(
          'Tarif pour l’accès public non défini dans la table pricing',
        );
      }

      publicAccessPrice = publicPricing.price;
    }

    // Ajouter le prix du device
    const devicePrice = device?.price || 0;

    // Calculer le prix total
    const totalPrice = totalEnvironmentPrice + publicAccessPrice + devicePrice;

    console.log(`Prix total calculé : ${totalPrice}`);
    return totalPrice;
  }
}
