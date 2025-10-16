export class PokemonResponseDto {
  public readonly id!: number;
  public readonly tipo!: string;
  public readonly treinador!: string;
  public readonly nivel!: number;

  constructor(data?: Partial<PokemonResponseDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
