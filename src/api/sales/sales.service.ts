import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface MarketPenetrationData {
  region: string;
  penetration: number;
  totalCustomers: number;
  potentialMarket: number;
}

export interface MonthlyProductsData {
  totalProducts: number;
  month: string;
}

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
            city: true,
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
  async addPurchase(userId: number, deviceId: number, hasPublicAccess: boolean) {
    return this.prisma.purchase_history.create({
      data: {
        user_id: userId,
        device_id: deviceId,
        public : hasPublicAccess,
      },
    });
  }

  async getSalesStatistics() {
    const [totalPurchases, publicCount, privateCount, uniqueUsers, uniqueDevices] = await Promise.all([
      this.prisma.purchase_history.count(),
      this.prisma.purchase_history.count({ where: { public: true } }),
      this.prisma.purchase_history.count({ where: { public: false } }),
      this.prisma.purchase_history.findMany({
        select: { user_id: true },
        distinct: ['user_id'],
      }),
      this.prisma.purchase_history.findMany({
        select: { device_id: true },
        distinct: ['device_id'],
      }),
    ]);

    return {
      totalPurchases,
      publicPurchases: publicCount,
      privatePurchases: privateCount,
      uniqueUsers: uniqueUsers.length,
      uniqueDeviceTypes: uniqueDevices.length,
    };
}

async getPrivatePurchasesPrice(month: Date) {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOfNextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);

  const environments = await this.prisma.environment.findMany({
    where: {
      is_public: false,
      created_at: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
    },
    select: {
      surface: true,
    },
  });

  const pricing = await this.prisma.pricing.findFirst({
    where: { attribute: 'surface' },
    select: {
      price: true,
    },
  });

  if (!pricing) {
    throw new Error('Pricing information not found');
  }

  const unitPrice = pricing.price;
  if (typeof unitPrice !== 'number') {
    throw new Error('Unit price is not a valid number');
  }

  const totalSurface = environments.reduce((sum, environment) => {
    const surface = environment.surface;
    if (surface != null) {
      sum += surface;
    }
    return sum;
  }, 0);

  return totalSurface * unitPrice;
}

async getDevicePurchasesPrice(month: Date) {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOfNextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);

  const devices = await this.prisma.purchase_history.findMany({
    where: {
      date: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
    },
    select: {
      device: {
        select: {
          price: true,
        },
      },
    },
  });

  const totalPrice = devices.reduce((sum, purchase) => {
    const device = purchase.device;
    if (device != null && typeof device.price === 'number') {
      sum += device.price;
    }
    return sum;
  }, 0);

  return totalPrice;
}

async getPublicAccessPurchasesPrice(month: Date) {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOfNextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);

  const nb_public = await this.prisma.purchase_history.count({
    where: {
      date: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
      public: true,
    },
  });

  const public_pricing = await this.prisma.pricing.findFirst({
    where: { attribute: 'public' },
    select: {
      price: true,
    },
  });
  if (!public_pricing ) {
    throw new Error('Public pricing not found');
  }
  if (typeof public_pricing.price !== 'number') {
    throw new Error('Public pricing is not a valid number');
  }
  if (nb_public == null) {
    throw new Error('Number of public purchases is not a valid number');
  }
  if (typeof nb_public !== 'number') {
    throw new Error('Number of public purchases is not a valid number');
  }
  const totalPrice = nb_public * public_pricing.price;
  return totalPrice;
}


async getMonthlyRevenue(month: Date) {

  const [privateRevenue, publicRevenue, deviceRevenue] = await Promise.all([
    this.getPrivatePurchasesPrice(month),
    this.getPublicAccessPurchasesPrice(month),
    this.getDevicePurchasesPrice(month),
  ]);

  return {
    privateRevenue,
    publicRevenue,
    deviceRevenue,
    totalRevenue: privateRevenue + publicRevenue + deviceRevenue,
  };
}

async getDailySalesCount(month: Date) {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOfNextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);

  const sales = await this.prisma.purchase_history.groupBy({
    by: ['date'],
    where: {
      date: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
    },
    _count: true,
  });

  return sales.map(sale => ({
    date: sale.date.toISOString().split('T')[0], 
    count: sale._count,
  }));
}

async getMonthlySalesCount(year: number) {
  const startOfYear = new Date(year, 0, 1);
  const startOfNextYear = new Date(year + 1, 0, 1);

  const sales = await this.prisma.purchase_history.findMany({
    where: {
      date: {
        gte: startOfYear,
        lt: startOfNextYear,
      },
    },
    select: {
      date: true,
    },
  });

  const monthlyCount = Array(12).fill(0);
  for (const sale of sales) {
    const month = sale.date.getMonth();
    monthlyCount[month]++;
  }

  return monthlyCount.map((count, index) => ({
    month: index + 1, 
    count,
  }));
}

async getYearlySalesCount() {
  const sales = await this.prisma.purchase_history.findMany({
    select: {
      date: true,
    },
  });

  const yearlyCount: Record<number, number> = {};
  for (const sale of sales) {
    const year = sale.date.getFullYear();
    yearlyCount[year] = (yearlyCount[year] || 0) + 1;
  }

  return Object.entries(yearlyCount).map(([year, count]) => ({
    year: Number(year),
    count,
  }));
}


async getSalesCountByDeviceType() {
    const results = await this.prisma.device_type.findMany({
      select: {
        type: true,
        device: {
          select: {
            purchase_history: {
              select: {
                id: true, 
              },
            },
          },
        },
      },
    });

    const salesCount = results.map(deviceType => ({
      model: deviceType.type,
      sales: deviceType.device.reduce((total, device) => total + device.purchase_history.length, 0),
    }));

    return salesCount;
  }

  async getSalesCountByRegion() {
  const results = await this.prisma.user.findMany({
    where: {
      purchase_history: {
        some: {}, // users ayant au moins un achat
      },
    },
    select: {
      city: true,
      purchase_history: {
        select: {
          id: true,
        },
      },
    },
  });

  const citySalesMap = new Map<string | null, number>();

  for (const user of results) {
    const currentSales = citySalesMap.get(user.city) || 0;
    citySalesMap.set(user.city, currentSales + user.purchase_history.length);
  }

  const salesByRegion = Array.from(citySalesMap.entries())
    .map(([city, sales]) => ({ city, sales }))
    .filter(entry => entry.sales > 0); 

  return salesByRegion;
}

async getCOGS(month: Date) {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOfNextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);

  const expenses = await this.prisma.expense.findMany({
    where: {
      date: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
      category: 'COGS',
    },
    select: {
      amount: true,
    },
  });

  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

async getExpenses(month: Date) {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOfNextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);

  const expenses = await this.prisma.expense.findMany({
    where: {
      date: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
      category: {
        not: 'COGS',
      },
    },
    select: {
      amount: true,
    },
  });

  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

async calculateGrossMargin(month: Date) {
  const [revenue, cogs] = await Promise.all([
    this.getMonthlyRevenue(month),
    this.getCOGS(month),
  ]);

  return {
    revenue: revenue.totalRevenue,
    cogs,
    grossMargin: revenue.totalRevenue - cogs,
  };
}

async calculateNetMargin(month: Date) {
  const [grossMarginData, expenses] = await Promise.all([
    this.calculateGrossMargin(month),
    this.getExpenses(month),
  ]);

  const netProfit = grossMarginData.grossMargin - expenses;
  const netMarginPercentage = (netProfit / grossMarginData.revenue) * 100;

  return {
    revenue: grossMarginData.revenue,
    cogs: grossMarginData.cogs,
    grossMargin: grossMarginData.grossMargin,
    expenses,
    netProfit,
    netMarginPercentage,
  };
}

async getMarketPenetrationByRegion(month: Date): Promise<MarketPenetrationData[]> {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  // Récupérer les ventes par ville pour le mois donné
  const salesByCity = await this.prisma.purchase_history.groupBy({
    by: ['user_id'],
    where: {
      date: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    },
    _count: {
      _all: true
    }
  });

  // Récupérer les villes des utilisateurs
  const userIds = salesByCity.map(sale => sale.user_id).filter((id): id is number => id !== null);
  const users = await this.prisma.user.findMany({
    where: {
      id: {
        in: userIds
      }
    },
    select: {
      id: true,
      city: true
    }
  });

  // Récupérer les données de marché potentiel
  const marketPotentials = await this.prisma.market_potentiel.findMany({
    select: {
      city: true,
      potential_value: true
    }
  });

  // Créer un map des ventes par ville
  const salesByCityMap = new Map<string, number>();
  users.forEach(user => {
    if (user.city) {
      const currentSales = salesByCityMap.get(user.city) || 0;
      const userSales = salesByCity.find(sale => sale.user_id === user.id)?._count._all || 0;
      salesByCityMap.set(user.city, currentSales + userSales);
    }
  });

  // Créer un map des marchés potentiels par ville
  const potentialMarketMap = new Map(
    marketPotentials.map(mp => [
      mp.city,
      mp.potential_value ? Number(mp.potential_value) : 1000000
    ])
  );

  // Calculer le taux de pénétration pour chaque ville
  return Array.from(salesByCityMap.entries()).map(([city, totalCustomers]) => {
    const potentialMarket = potentialMarketMap.get(city) || 1000000; // Valeur par défaut si la ville n'est pas dans la table
    const penetration = (Number(totalCustomers) / Number(potentialMarket)) * 100;

    return {
      region: city,
      penetration: Number(penetration.toFixed(1)),
      totalCustomers,
      potentialMarket: Number(potentialMarket)
    };
  });
}

async getMonthlyProductsSold(month: Date): Promise<MonthlyProductsData> {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  // Compter le nombre total de produits vendus pour le mois donné
  const totalProducts = await this.prisma.purchase_history.count({
    where: {
      date: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  });

  // Formater le mois pour l'affichage
  const monthString = month.toLocaleDateString('fr-DZ', {
    month: 'long',
    year: 'numeric'
  });

  return {
    totalProducts,
    month: monthString
  };
}
}
