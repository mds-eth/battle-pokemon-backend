import { IsString, IsNotEmpty } from "class-validator";

export class UpdatePokemonDto {
  @IsNotEmpty({ message: "O nome do treinador é obrigatório" })
  @IsString({ message: "O nome do treinador deve ser uma string" })
  public readonly treinador!: string;

  constructor(data?: Partial<UpdatePokemonDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
