import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles. decorator';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense. dto';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/expenses')
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Get()
  @Roles('ADMIN', 'MANAGER', 'ACCOUNTANT')
  findAll(
    @Query('storeId') storeId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('category') category?: string,
  ) {
    return this.expensesService.findAll(storeId, from, to, category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'MANAGER')
  create(@Body() dto: CreateExpenseDto) {
    return this.expensesService. create(dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  delete(@Param('id') id: string) {
    return this. expensesService.delete(id);
  }
}