import { BaseRepository } from "./BaseRepository.js";
import { CreatePokemonDto } from "../models/dto/CreatePokemonDto.js";
import { UpdatePokemonDto } from "../models/dto/UpdatePokemonDto.js";
import { Pokemon } from "../types/index.js";
import { AppLogger } from "../utils/Logger.js";

export class PokemonRepository extends BaseRepository<
  Pokemon,
  CreatePokemonDto,
  UpdatePokemonDto
> {
  private logger: AppLogger;

  constructor() {
    super();
    this.logger = new AppLogger("PokemonRepository");
  }

  public async create(data: CreatePokemonDto): Promise<Pokemon> {
    this.logger.methodStart("create", {
      treinador: data.treinador,
      tipo: data.tipo,
    });
    this.logger.databaseQuery("pokemon.create", {
      treinador: data.treinador,
      tipo: data.tipo,
    });

    try {
      const initialStats = this.getInitialStats(data.tipo);
      const pokemon = await this.prisma.pokemon.create({
        data: {
          name: data.treinador,
          type: data.tipo,
          level: 1,
          hp: initialStats.hp,
          attack: initialStats.attack,
          defense: initialStats.defense,
          speed: initialStats.speed,
        },
      });
      this.logger.methodEnd("create", { pokemonId: pokemon.id });
      return pokemon as Pokemon;
    } catch (error) {
      this.logger.databaseError("pokemon.create", error);
      throw error;
    }
  }

  public async findAll(): Promise<Pokemon[]> {
    this.logger.methodStart("findAll");
    this.logger.databaseQuery("pokemon.findMany");

    try {
      const pokemons = await this.prisma.pokemon.findMany();
      this.logger.methodEnd("findAll", { count: pokemons.length });
      return pokemons as Pokemon[];
    } catch (error) {
      this.logger.databaseError("pokemon.findMany", error);
      throw error;
    }
  }

  public async findOne(id: number): Promise<Pokemon | null> {
    this.logger.methodStart("findOne", { id });
    this.logger.databaseQuery("pokemon.findUnique", { id });

    try {
      const pokemon = await this.prisma.pokemon.findUnique({
        where: { id },
      });

      if (!pokemon) {
        this.logger.warn("Pokemon not found in database", { id });
      } else {
        this.logger.methodEnd("findOne", { pokemonId: pokemon.id });
      }

      return pokemon as Pokemon | null;
    } catch (error) {
      this.logger.databaseError("pokemon.findUnique", error);
      throw error;
    }
  }

  public async update(
    id: number,
    data: UpdatePokemonDto
  ): Promise<Pokemon | null> {
    this.logger.methodStart("update", { id, fields: Object.keys(data) });

    try {
      this.logger.databaseQuery("pokemon.findUnique", { id });
      const existingPokemon = await this.prisma.pokemon.findUnique({
        where: { id },
      });

      if (!existingPokemon) {
        this.logger.warn("Pokemon not found for update", { id });
        return null;
      }

      this.logger.databaseQuery("pokemon.update", {
        id,
        fields: Object.keys(data),
      });
      const updatedPokemon = await this.prisma.pokemon.update({
        where: { id },
        data: {
          ...(data.treinador && { name: data.treinador }),
          ...((data as any).level && { level: (data as any).level }),
        },
      });

      this.logger.methodEnd("update", { pokemonId: updatedPokemon.id });
      return updatedPokemon as Pokemon;
    } catch (error) {
      this.logger.databaseError("pokemon.update", error);
      throw error;
    }
  }

  public async delete(id: number): Promise<boolean> {
    this.logger.methodStart("delete", { id });

    try {
      this.logger.databaseQuery("pokemon.findUnique", { id });
      const pokemon = await this.prisma.pokemon.findUnique({
        where: { id },
      });

      if (!pokemon) {
        this.logger.warn("Pokemon not found for deletion", { id });
        return false;
      }

      this.logger.databaseQuery("pokemon.delete", { id });
      await this.prisma.pokemon.delete({
        where: { id },
      });

      this.logger.methodEnd("delete", { pokemonId: id });
      return true;
    } catch (error) {
      this.logger.databaseError("pokemon.delete", error);
      throw error;
    }
  }

  private getInitialStats(tipo: string): {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  } {
    const stats = {
      pikachu: { hp: 35, attack: 55, defense: 40, speed: 90 },
      charizard: { hp: 78, attack: 84, defense: 78, speed: 100 },
      mewtwo: { hp: 106, attack: 110, defense: 90, speed: 130 },
    } as const;

    return (
      stats[tipo as keyof typeof stats] || {
        hp: 50,
        attack: 50,
        defense: 50,
        speed: 50,
      }
    );
  }
}
