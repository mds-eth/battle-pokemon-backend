import {
  CreatePokemonDto,
  POKEMON_TYPES,
} from "../models/dto/CreatePokemonDto.js";
import { UpdatePokemonDto } from "../models/dto/UpdatePokemonDto.js";
import { PokemonResponseDto } from "../models/dto/PokemonResponseDto.js";
import { BattleResponseDto } from "../models/dto/BattleResponseDto.js";
import { PokemonRepository } from "../repositories/PokemonRepository.js";
import { BaseService } from "./BaseService.js";
import { Pokemon } from "../types/index.js";
import { AppLogger } from "../utils/Logger.js";

export class PokemonService extends BaseService<
  Pokemon,
  CreatePokemonDto,
  UpdatePokemonDto
> {
  private pokemonRepository: PokemonRepository;
  private logger: AppLogger;

  constructor() {
    const pokemonRepository = new PokemonRepository();
    super(pokemonRepository);
    this.pokemonRepository = pokemonRepository;
    this.logger = new AppLogger("PokemonService");
  }

  public async create(data: CreatePokemonDto): Promise<PokemonResponseDto> {
    this.logger.methodStart("create", {
      tipo: data.tipo,
      treinador: data.treinador,
    });

    try {
      if (!POKEMON_TYPES.includes(data.tipo as any)) {
        this.logger.warn("Invalid Pokemon type provided", { tipo: data.tipo });
        throw new Error(
          `Tipo de pokémon inválido. Deve ser um dos: ${POKEMON_TYPES.join(
            ", "
          )}`
        );
      }

      this.logger.debug("Creating new Pokemon in database via DTO", data);
      const pokemon = await this.pokemonRepository.create(data);

      const response = new PokemonResponseDto({
        id: pokemon.id,
        tipo: pokemon.type,
        treinador: pokemon.name,
        nivel: pokemon.level,
      });

      this.logger.methodEnd("create", { pokemonId: pokemon.id });
      return response;
    } catch (error) {
      this.logger.methodError("create", error);
      throw error;
    }
  }

  public async findAll(): Promise<PokemonResponseDto[]> {
    this.logger.methodStart("findAll");

    try {
      const pokemons = await this.pokemonRepository.findAll();
      const response = pokemons.map(
        (pokemon) =>
          new PokemonResponseDto({
            id: pokemon.id,
            tipo: pokemon.type,
            treinador: pokemon.name,
            nivel: pokemon.level,
          })
      );

      this.logger.methodEnd("findAll", { count: pokemons.length });
      return response;
    } catch (error) {
      this.logger.methodError("findAll", error);
      throw error;
    }
  }

  public async findOne(id: number): Promise<PokemonResponseDto | null> {
    this.logger.methodStart("findOne", { id });

    try {
      const pokemon = await this.pokemonRepository.findOne(id);
      if (!pokemon) {
        this.logger.warn("Pokemon not found", { id });
        return null;
      }

      const response = new PokemonResponseDto({
        id: pokemon.id,
        tipo: pokemon.type,
        treinador: pokemon.name,
        nivel: pokemon.level,
      });

      this.logger.methodEnd("findOne", { pokemonId: pokemon.id });
      return response;
    } catch (error) {
      this.logger.methodError("findOne", error);
      throw error;
    }
  }

  public async update(id: number, data: UpdatePokemonDto): Promise<void> {
    this.logger.methodStart("update", { id, treinador: data.treinador });

    try {
      const pokemon = await this.pokemonRepository.findOne(id);
      if (!pokemon) {
        this.logger.warn("Pokemon not found for update", { id });
        throw new Error("Pokemon não encontrado");
      }

      await this.pokemonRepository.update(id, data);

      this.logger.methodEnd("update", { pokemonId: id });
    } catch (error) {
      this.logger.methodError("update", error);
      throw error;
    }
  }

  public async delete(id: number): Promise<boolean> {
    this.logger.methodStart("delete", { id });

    try {
      const pokemon = await this.pokemonRepository.findOne(id);
      if (!pokemon) {
        this.logger.warn("Pokemon not found for deletion", { id });
        return false;
      }

      const deleted = await this.pokemonRepository.delete(id);
      this.logger.methodEnd("delete", { pokemonId: id });
      return deleted;
    } catch (error) {
      this.logger.methodError("delete", error);
      throw error;
    }
  }

  public async battle(
    pokemonAId: number,
    pokemonBId: number
  ): Promise<BattleResponseDto> {
    this.logger.methodStart("battle", { pokemonAId, pokemonBId });

    try {
      const pokemonA = await this.pokemonRepository.findOne(pokemonAId);
      const pokemonB = await this.pokemonRepository.findOne(pokemonBId);

      if (!pokemonA || !pokemonB) {
        this.logger.warn("One or both Pokemon not found for battle", {
          pokemonAId,
          pokemonBId,
        });
        throw new Error("Um ou ambos os Pokémons não foram encontrados");
      }

      this.logger.info("Battle starting", {
        pokemonA: {
          id: pokemonA.id,
          type: pokemonA.type,
          level: pokemonA.level,
        },
        pokemonB: {
          id: pokemonB.id,
          type: pokemonB.type,
          level: pokemonB.level,
        },
      });

      const totalLevel = pokemonA.level + pokemonB.level;
      const pokemonAWinChance = pokemonA.level / totalLevel;

      const random = Math.random();
      const pokemonAWins = random < pokemonAWinChance;

      let winner: Pokemon;
      let loser: Pokemon;

      if (pokemonAWins) {
        winner = pokemonA;
        loser = pokemonB;
      } else {
        winner = pokemonB;
        loser = pokemonA;
      }

      this.logger.info("Battle result determined", {
        winner: { id: winner.id, type: winner.type },
        loser: { id: loser.id, type: loser.type },
        random,
        pokemonAWinChance,
      });

      const newWinnerLevel = winner.level + 1;
      const newLoserLevel = loser.level - 1;

      await this.pokemonRepository.update(winner.id, {
        level: newWinnerLevel,
      } as any);

      let finalLoser: Pokemon;
      if (newLoserLevel <= 0) {
        this.logger.info("Pokemon died in battle, deleting", {
          pokemonId: loser.id,
        });
        await this.pokemonRepository.delete(loser.id);
        finalLoser = { ...loser, level: 0 };
      } else {
        await this.pokemonRepository.update(loser.id, {
          level: newLoserLevel,
        } as any);
        finalLoser = { ...loser, level: newLoserLevel };
      }

      const response = new BattleResponseDto({
        vencedor: {
          id: winner.id,
          tipo: winner.type,
          treinador: winner.name,
          nivel: newWinnerLevel,
        },
        perdedor: {
          id: finalLoser.id,
          tipo: finalLoser.type,
          treinador: finalLoser.name,
          nivel: finalLoser.level,
        },
      });

      this.logger.methodEnd("battle", {
        winnerId: winner.id,
        loserId: loser.id,
        winnerNewLevel: newWinnerLevel,
        loserNewLevel: finalLoser.level,
      });

      return response;
    } catch (error) {
      this.logger.methodError("battle", error);
      throw error;
    }
  }
}
