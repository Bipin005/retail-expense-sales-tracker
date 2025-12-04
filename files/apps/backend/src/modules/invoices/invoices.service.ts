import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoicePdfService } from './services/invoice-pdf.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private pdfService: InvoicePdfService,
  ) {}

  async create(dto: CreateInvoiceDto) {
    // Generate invoice number
    const invoiceNo = this.generateInvoiceNumber(dto.storeId);

    // Calculate totals
    const { subtotal, taxTotal, discountTotal, total } = this. calculateTotals(dto. items);

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNo,
        storeId: dto.storeId,
        customerId: dto.customerId || null,
        createdById: dto.createdById,
        subtotal,
        taxTotal,
        discountTotal,
        total,
        paymentMethod: dto.paymentMethod,
        notes: dto.notes,
        items: {
          create: dto.items.map(item => ({
            productId: item.productId,
            qty: item.qty,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            taxAmount: item.taxAmount || 0,
            lineTotal: (item.unitPrice * item.qty) - (item.discount || 0) + (item.taxAmount || 0),
          })),
        },
      },
      include: { items: { include: { product: true } }, customer: true, store: true },
    });

    // Adjust stock
    for (const item of dto.items) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: { stockQty: { decrement: item.qty } },
      });

      // Log stock movement
      await this.prisma. stockMovement.create({
        data: {
          productId: item.productId,
          storeId: dto.storeId,
          qty: item.qty,
          type: 'OUT',
          referenceId: invoice.id,
        },
      });
    }

    return invoice;
  }

  async findAll(storeId: string, page: number = 1, limit: number = 20, from?: Date, to?: Date) {
    const skip = (page - 1) * limit;
    const where: any = { storeId };

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        include: { items: { include: { product: true } }, customer: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return { data: invoices, total, page, limit };
  }

  async findOne(id: string) {
    const invoice = await this. prisma.invoice.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, customer: true, store: true },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async generatePdf(id: string, format: 'A4' | 'THERMAL' = 'A4') {
    const invoice = await this.findOne(id);
    return this.pdfService.generateInvoicePdf(invoice, format);
  }

  private generateInvoiceNumber(storeId: string): string {
    const date = new Date();
    const dateStr = date.toISOString(). split('T')[0]. replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000). toString(). padStart(4, '0');
    return `INV-${dateStr}-${random}`;
  }

  private calculateTotals(items: any[]) {
    let subtotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;

    for (const item of items) {
      subtotal += item.unitPrice * item.qty;
      discountTotal += item.discount || 0;
      taxTotal += item.taxAmount || 0;
    }

    const total = subtotal - discountTotal + taxTotal;

    return { subtotal, taxTotal, discountTotal, total };
  }
}