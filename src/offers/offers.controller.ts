import { Controller, Get, Param, NotFoundException, BadRequestException } from '@nestjs/common';
import { OffersService } from './offers.service';
import { ParseIntPipe } from '@nestjs/common';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  /**
   * Récupérer les environnements d'un utilisateur donné
   * @param userId ID de l'utilisateur
   */
  @Get('user-environments/:userId')
  async getUserEnvironments(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const result = await this.offersService.getUserEnvironments(userId);

      // Si le résultat est vide mais sans erreur
      if (Array.isArray(result) && result.length === 0) {
        throw new NotFoundException(
          `Aucun environnement trouvé pour l'utilisateur avec l'ID ${userId}`,
        );
      }

      return result;
    } catch (error) {
      console.error('Error in getUserEnvironments:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        `Erreur lors de la récupération des environnements: ${error.message}`,
      );
    }
  }

  /**
   * Calculer le prix de chaque environnement pour un utilisateur donné
   * @param userId ID de l'utilisateur
   */
  @Get('user-environments-pricing/:userId')
  async calculateEnvironmentPricing(@Param('userId', ParseIntPipe) userId: number) {
    try {
      return await this.offersService.calculateEnvironmentPricing(userId);
    } catch (error) {
      console.error('Error in calculateEnvironmentPricing:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        `Une erreur s'est produite lors du calcul des prix pour l'utilisateur avec l'ID ${userId}: ${error.message}`,
      );
    }
  }
}