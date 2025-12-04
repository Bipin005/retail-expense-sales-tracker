import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma. service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async salesReport(storeId: string, from: Date, to: Date) {
    const invoices = await this.prisma. invoice.findMany({
      where: {
        storeId,
        createdAt: { gte: from, lte: to },
      },
      include: { items: true },
    });

    const totalSales = invoices. reduce((sum, inv) => sum + parseFloat(inv.total. toString()), 0);
    const totalInvoices = invoices.length;
    const averageInvoiceValue = totalInvoices > 0 ? totalSales / totalInvoices : 0;

    return {
      totalSales,
      totalInvoices,
      averageInvoiceValue,
      data: invoices,
    };
  }

  async expensesReport(storeId: string, from: Date, to: Date) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        storeId,
        date: { gte: from, lte: to },
      },
      include: { category: true },
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0);
    const byCategory = await this.prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        storeId,
        date: { gte: from, lte: to },
      },
      _sum: { amount: true },
    });

    return {
      totalExpenses,
      byCategory,
      data: expenses,
    };
  }

  async profitLossReport(storeId: string, from: Date, to: Date) {
    const salesData =