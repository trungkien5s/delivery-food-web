import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { UsersModule } from '@/modules/users/users.module';
import { LikesModule } from '@/modules/likes/likes.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuItemOptionsModule } from '@/modules/menu.item.options/menu.item.options.module';
import { MenuItemsModule } from '@/modules/menu.items/menu.items.module';
import { MenusModule } from '@/modules/menus/menus.module';
import { OrderDetailsModule } from '@/modules/order.detail/order.detail.module';
import { OrdersModule } from '@/modules/orders/orders.module';
import { RestaurantsModule } from '@/modules/restaurants/restaurants.module';
import { ReviewsModule } from '@/modules/reviews/reviews.module';
import { AuthModule } from '@/auth/auth.module';
import { JwtAuthGuard } from './auth/passport/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { TransformInterceptor } from '@/core/transform.interceptor';
import { CartsModule } from './modules/carts/carts.module';
import { Cart } from './modules/carts/schemas/carts.schema';
import { CartItem } from './modules/cart.items/schemas/cart.items.schema';
import { CartItemsModule } from './modules/cart.items/cart.items.module';
import { Shipper } from './modules/shippers/schemas/shipper.schema';
import { ShipperModule } from './modules/shippers/shipper.module';

import { CategoriesModule } from './modules/categories/category.module';
import { ChatModule } from './modules/chats/chat.module';

@Module({
  imports: [
    UsersModule,
    LikesModule,
    MenuItemOptionsModule,
    MenuItemsModule,
    MenusModule,
    CartsModule,
    CartItemsModule,
    OrderDetailsModule,
    OrdersModule,
    RestaurantsModule,
    ShipperModule,
    CategoriesModule,
    ChatModule,
    ReviewsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
MailerModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    transport: {
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: configService.get<string>('MAILER_USER'),
        pass: configService.get<string>('MAILER_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    },
    defaults: {
        from: '"EatNow Support" <noreply@eatnow.com>',
    },
    template: {
      dir: process.cwd() + '/src/mail/templates',
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  }),
  inject: [ConfigService],
}),

  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: TransformInterceptor,
    }
  ],
})
export class AppModule {}
;