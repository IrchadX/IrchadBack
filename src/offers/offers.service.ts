import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} introuvable`);
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
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} introuvable`);
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
      throw new NotFoundException('Tarif unitaire non défini dans la table pricing');
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
}