import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  create(merchantId: string, dto: CreateProductDto) {
    return this.prisma.product.create({
      data: { ...dto, merchantId },
    });
  }

  findAll(merchantId: string) {
    return this.prisma.product.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(merchantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, merchantId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(merchantId: string, id: string, dto: UpdateProductDto) {
    await this.findOne(merchantId, id);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(merchantId: string, id: string) {
    await this.findOne(merchantId, id);
    await this.prisma.product.delete({ where: { id } });
    return { deleted: true };
  }
}