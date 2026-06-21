import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentMerchant,
  type AuthMerchant,
} from '../auth/current-merchant.decorator';
import { ExperimentsService } from './experiments.service';
import { CreateVariantDto } from './dto/create-variant.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class ExperimentsController {
  constructor(private readonly experiments: ExperimentsService) {}

  @Post('products/:productId/experiments')
  start(
    @CurrentMerchant() merchant: AuthMerchant,
    @Param('productId') productId: string,
  ) {
    return this.experiments.start(merchant.id, productId);
  }

  @Get('products/:productId/experiments')
  findAllForProduct(
    @CurrentMerchant() merchant: AuthMerchant,
    @Param('productId') productId: string,
  ) {
    return this.experiments.findAllForProduct(merchant.id, productId);
  }

  @Get('experiments/:id')
  findOne(
    @CurrentMerchant() merchant: AuthMerchant,
    @Param('id') id: string,
  ) {
    return this.experiments.findOne(merchant.id, id);
  }

  @Post('experiments/:id/variants')
  addVariant(
    @CurrentMerchant() merchant: AuthMerchant,
    @Param('id') id: string,
    @Body() dto: CreateVariantDto,
  ) {
    return this.experiments.addVariant(merchant.id, id, dto);
  }
}