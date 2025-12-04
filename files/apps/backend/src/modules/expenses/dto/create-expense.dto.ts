import { IsString, IsNumber, IsUUID, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateExpenseDto {
  @IsUUID()
  storeId: string;

  @IsUUID()
  categoryId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;
}