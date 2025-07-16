import { IsMongoId } from 'class-validator';

export class AssignShipperDto {
  @IsMongoId({ message: 'ShipperId không hợp lệ' })
  shipperId: string;
}
