import { IsString, IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
  @IsUUID()
  productId: string;

  @Type(() => Number)
  qty: number;

  @Type(() => Number)
  unitPrice: number;

  @Type(() => Number)
  @IsOptional()
  discount?: number;

  @Type(() => Number)
  @IsOptional()
  taxAmount?: number;
}

export class CreateInvoiceDto {
  @IsUUID()
  storeId: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsUUID()
  createdById: string;

  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}