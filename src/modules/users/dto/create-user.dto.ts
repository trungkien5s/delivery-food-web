import { Prop } from "@nestjs/mongoose";
import { IsEmail, IsEmpty, IsNotEmpty } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty({message: "Tên không được để trống"})
    name: string;

    @IsNotEmpty({message: "Email không được để trống"})
    @IsEmail({},{message: "Email không đúng định dạng"})
    email: string;
    
    @IsNotEmpty({message: "Mật khẩu không được để trống"})
    password: string;

    @IsNotEmpty({message: "Số điện thoại không được để trống"})
    phone: string;

    address: string;
    image: string;    
}
