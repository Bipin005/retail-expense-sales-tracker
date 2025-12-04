import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        storeId: dto.storeId,
        categoryId: dto.categoryId,
        amount: dto.amount,
        date: dto.date,
        notes: dto.notes,
        receiptUrl: dto.receiptUrl,
      },
      include: { category: true },
    });
  }

  async findAll(storeId: string, from?: string, to?: string, category?: string) {
    const where: any = { storeId };

    if (from || to) {
      where.date = {};
      if (from) where.date. gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    if (category) {
      where.categoryId = category;
    }

    return this.prisma.expense.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const expense = await this. prisma.expense.findUnique({
      where: { id },
      include: { category: true },
    });

    if (! expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  async delete(id: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return this.prisma.expense.delete({ where: { id } });
  }
}