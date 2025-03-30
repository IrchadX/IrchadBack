import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  // Get all purchase history
  async getPurchaseHistory() {
    return this.prisma.purchase_history.findMany({
      include: {
        user: {
          select: {
            first_name: true,
            family_name: true,
            city : true,
          },
        },
        device: {
          select: {
            device_type: true,
          },
        },
      },
    });
  }

  // Add a new purchase to the history
  async addPurchase(userId: number, deviceId: number) {
    return this.prisma.purchase_history.create({
      data: {
        user_id: userId,
        device_id: deviceId,
      },
    });
  }

  // Get sales statistics (e.g., total purchases)
  async getSalesStatistics() {
    
  }
}