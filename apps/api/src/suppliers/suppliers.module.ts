import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SuppliersController, PurchaseOrdersController } from './suppliers.controller';

@Module({
  providers: [SuppliersService],
  controllers: [SuppliersController, PurchaseOrdersController],
})
export class SuppliersModule {}
