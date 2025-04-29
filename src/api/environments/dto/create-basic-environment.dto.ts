import { IsString, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';

export class CreateBasicEnvironmentDto {
  @IsString()
  name: string; // Nom de l'environnement

  @IsOptional()
  @IsString()
  description?: string; // Description de l'environnement (optionnel)

  @IsOptional()
  @IsString()
  address?: string; // Adresse de l'environnement (optionnel)

  @IsOptional()
  @IsNumber()
  userId?: number; // ID de l'utilisateur associé (optionnel)

  @IsBoolean()
  isPublic: boolean; // Indique si l'environnement est public ou privé

  @IsOptional()
  @IsNumber()
  @Min(0)
  surface?: number; // Surface de l'environnement (optionnel, en m²)
}