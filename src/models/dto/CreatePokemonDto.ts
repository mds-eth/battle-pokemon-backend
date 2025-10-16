import { IsString, IsNotEmpty, IsIn } from "class-validator";

export const POKEMON_TYPES = ["charizard", "mewtwo", "pikachu"] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

export class CreatePokemonDto {
  @IsNotEmpty({ message: "O tipo do pokémon é obrigatório" })
  @IsString({ message: "O tipo do pokémon deve ser uma string" })
  @IsIn(POKEMON_TYPES, {
    message: `Tipo de pokémon inválido. Deve ser um dos: ${POKEMON_TYPES.join(
      ", "
    )}`,
  })
  public readonly tipo!: PokemonType;

  @IsNotEmpty({ message: "O nome do treinador é obrigatório" })
  @IsString({ message: "O nome do treinador deve ser uma string" })
  public readonly treinador!: string;

  constructor(data?: Partial<CreatePokemonDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
