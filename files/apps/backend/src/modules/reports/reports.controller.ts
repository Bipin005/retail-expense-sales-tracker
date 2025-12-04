import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ReportsService } from './reports. service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('sales')
  @Roles('ADMIN', 'MANAGER', 'ACCOUNTANT')
  salesReport(@Query('storeId') storeId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.reportsService.salesReport(storeId, new Date(from), new Date(to));
  }

  @Get('expenses')
  @Roles('ADMIN', 'MANAGER', 'ACCOUNTANT')
  expensesReport(@Query('storeId') storeId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.reportsService.expensesReport(storeId, new Date(from), new Date(to));
  }

  @Get('profit-loss')
  @Roles('ADMIN', 'MANAGER', 'ACCOUNTANT')
  profitLossReport(@Query('storeId') storeId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.reportsService.profitLossReport(storeId, new Date(from), new Date(to));
  }

  @Get('top-products')
  @Roles('ADMIN', 'MANAGER', 'ACCOUNTANT')
  topProducts(@Query('storeId') storeId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.reportsService.topProducts(storeId, new Date(from), new Date(to));
  }
}