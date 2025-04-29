import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('commercial')
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
  async calculateEnvironmentPricing(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
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

  @Get ('user-public-access/:userId')
  async getUserPublicEnvironments(@Param('userId', ParseIntPipe) userId: number) {
    try {
      return await this.offersService.getUserAccess(userId);
    } catch (error) {
      console.error('Error in getUserPublicEnvironments:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        `Une erreur s'est produite lors de la récupération des environnements publics pour l'utilisateur avec l'ID ${userId}: ${error.message}`,
      );
    }
  }

  /**
   * Calculer le prix de chaque environnement pour un utilisateur donné
   * @param userId ID de l'utilisateur
   */
  @Get('user-device/:userId')
  async getUserDevice(@Param('userId', ParseIntPipe) userId: number) {
    try {
      return await this.offersService.getUserDevice(userId);
    } catch (error) {
      console.error('Error in getUserDevice:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        `Une erreur s'est produite lors de lrécupération du dispositif de l'utilisateur avec l'ID ${userId}: ${error.message}`,
      );
    }
  }

  /**
   * @param body Contient les environnements, le booléen pour l'accès public et le device
   * @returns Le prix total calculé
   */
  @Post('estimate-total-price')
  async estimateTotalPrice(@Body() body: any): Promise<number> {
    const { environments, includePublicAccess, device } = body;

    // Validation des données d'entrée
    if (!Array.isArray(environments)) {
      throw new BadRequestException('Environments doit être un tableau.');
    }

    if (typeof includePublicAccess !== 'boolean') {
      throw new BadRequestException(
        'includePublicAccess doit être un booléen.',
      );
    }

    if (typeof device !== 'object' || device === null) {
      throw new BadRequestException('Device doit être un objet valide.');
    }

    // Appeler le service pour calculer le prix total
    return await this.offersService.estimateTotalPrice(
      environments,
      includePublicAccess,
      device,
    );
  }
}
