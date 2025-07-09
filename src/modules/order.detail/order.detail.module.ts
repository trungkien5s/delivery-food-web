import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderDetail, OrderDetailSchema } from './schemas/order.detail.schema';
import { OrderDetailsController } from './order.detail.controller';
import { OrderDetailsService } from './order.detail.service';


@Module({
  imports: [MongooseModule.forFeature([{ name: OrderDetail.name, schema: OrderDetailSchema }])],
  controllers: [OrderDetailsController],
  providers: [OrderDetailsService],
})
export class OrderDetailsModule {}
