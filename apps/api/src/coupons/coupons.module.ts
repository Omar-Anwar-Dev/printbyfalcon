import { Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CouponsController, AdminCouponsController } from './coupons.controller';

@Module({
  providers: [CouponsService],
  controllers: [CouponsController, AdminCouponsController],
  exports: [CouponsService],
})
export class CouponsModule {}
