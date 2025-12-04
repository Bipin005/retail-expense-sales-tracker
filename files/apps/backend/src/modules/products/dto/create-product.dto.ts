import { IsString, IsNumber, IsUUID, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  sku: string;

  @IsString()
  name: string;

  @IsString()
  barcode: string;

  @IsNumber()
  @Min(0)
  costPrice: number;

  @IsNumber()
  @Min(0)
  sellPrice: number;

  @IsNumber()
  @Min(0)
  taxRate: number;

  @IsNumber()
  @Min(0)
  reorderLevel: number;

  @IsUUID()
  categoryId: string;

  @IsUUID()
  storeId: string;

  @IsOptional()
  @IsString()
  description?: string;
}