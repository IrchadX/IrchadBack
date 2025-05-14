// src/auth/decorators/gateway-roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const GATEWAY_ROLES_KEY = 'gateway_roles';
export const GatewayRoles = (...roles: string[]) =>
  SetMetadata(GATEWAY_ROLES_KEY, roles);
