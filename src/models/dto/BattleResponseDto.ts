export class BattleResponseDto {
  public readonly vencedor!: {
    id: number;
    tipo: string;
    treinador: string;
    nivel: number;
  };
  
  public readonly perdedor!: {
    id: number;
    tipo: string;
    treinador: string;
    nivel: number;
  };

  constructor(data?: Partial<BattleResponseDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}