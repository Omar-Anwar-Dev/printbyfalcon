import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { SearchModule } from './search/search.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './users/users.module';
import { SupportModule } from './support/support.module';
import { CouponsModule } from './coupons/coupons.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { BannersModule } from './banners/banners.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AddressesModule } from './addresses/addresses.module';
import { CacheModule } from './common/cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule,
    ThrottlerModule.forRoot([
      // Generous default for storefront browsing (100 products × navbar refetch
      // on focus can burn 100/min fast). Only auth routes need the tight lock.
      { name: 'default', ttl: 60_000, limit: 600 },
      { name: 'auth', ttl: 15 * 60_000, limit: 5 },
    ]),
    PrismaModule,
    HealthModule,
    AuthModule,
    UploadModule,
    // SearchModule MUST come before ProductsModule
    // so GET /products/search is registered before GET /products/:slug
    SearchModule,
    CategoriesModule,
    BrandsModule,
    ProductsModule,
    CartModule,
    WishlistModule,
    OrdersModule,
    PaymentsModule,
    NotificationsModule,
    AdminModule,
    UsersModule,
    SupportModule,
    CouponsModule,
    SuppliersModule,
    BannersModule,
    AnalyticsModule,
    AddressesModule,
  ],
  providers: [
    // Apply rate limiting globally to every route (per-IP)
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}