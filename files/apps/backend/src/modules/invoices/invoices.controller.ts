import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt. guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice. dto';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  findAll(
    @Query('storeId') storeId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.invoicesService.findAll(
      storeId,
      page,
      limit,
      from ?  new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Get(':id/pdf')
  async generatePdf(
    @Param('id') id: string,
    @Query('format') format: 'A4' | 'THERMAL' = 'A4',
    @Res() res: Response,
  ) {
    const pdf = await this.invoicesService. generatePdf(id, format);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
    });
    res. send(pdf);
  }

  @Post()
  @Roles('ADMIN', 'MANAGER', 'CASHIER')
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(dto);
  }
}