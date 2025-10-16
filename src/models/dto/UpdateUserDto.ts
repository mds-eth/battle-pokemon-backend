import { IsString, IsEmail, IsOptional, MinLength } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: "O nome deve ser uma string" })
  public readonly name?: string;

  @IsOptional()
  @IsEmail({}, { message: "Email inválido" })
  public readonly email?: string;

  @IsOptional()
  @MinLength(6, { message: "A senha deve ter no mínimo 6 caracteres" })
  public readonly password?: string;

  constructor(data?: Partial<UpdateUserDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
