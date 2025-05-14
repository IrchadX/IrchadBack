// src/auth/guards/gateway-roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GATEWAY_ROLES_KEY } from '@/guards/gateway-roles.guard';

@Injectable()
export class GatewayRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.get<string[]>(GATEWAY_ROLES_KEY, context.getHandler()) ||
      [];

    // If no roles are required, allow access
    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const roles = request.headers['x-user-roles']?.split(',') || [];

    // Check if user has any of the required roles
    const hasRole = requiredRoles.some((role) => roles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException(
        `Requires roles: ${requiredRoles.join(', ')}`,
      );
    }
    return true;
  }
}
