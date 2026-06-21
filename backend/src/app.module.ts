import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { ExperimentsModule } from './experiments/experiments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProductsModule,
    ExperimentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
