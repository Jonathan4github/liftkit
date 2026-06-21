import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentMerchant,
  type AuthMerchant,
} from '../auth/current-merchant.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Post()
  create(
    @CurrentMerchant() merchant: AuthMerchant,
    @Body() dto: CreateProductDto,
  ) {
    return this.products.create(merchant.id, dto);
  }

  @Get()
  findAll(@CurrentMerchant() merchant: AuthMerchant) {
    return this.products.findAll(merchant.id);
  }

  @Get(':id')
  findOne(
    @CurrentMerchant() merchant: AuthMerchant,
    @Param('id') id: string,
  ) {
    return this.products.findOne(merchant.id, id);
  }

  @Patch(':id')
  update(
    @CurrentMerchant() merchant: AuthMerchant,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.products.update(merchant.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentMerchant() merchant: AuthMerchant,
    @Param('id') id: string,
  ) {
    return this.products.remove(merchant.id, id);
  }
}