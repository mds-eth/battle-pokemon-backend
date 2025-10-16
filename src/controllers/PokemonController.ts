import { Request, Response } from "express";
import { CreatePokemonDto } from "../models/dto/CreatePokemonDto.js";
import { UpdatePokemonDto } from "../models/dto/UpdatePokemonDto.js";
import { PokemonService } from "../services/PokemonService.js";
import { BaseController } from "./BaseController.js";
import { AppLogger } from "../utils/Logger.js";

export class PokemonController extends BaseController {
  private pokemonService: PokemonService;
  private logger: AppLogger;

  constructor() {
    super();
    this.pokemonService = new PokemonService();
    this.logger = new AppLogger("PokemonController");
  }

  public async create(req: Request, res: Response): Promise<Response> {
    this.logger.methodStart("create", req.body);

    try {
      const createPokemonDto = new CreatePokemonDto(req.body);
      const errors = await this.validateDto(createPokemonDto);

      if (errors.length > 0) {
        this.logger.warn("Validation errors in create", { errors });
        return this.sendValidationError(res, errors);
      }

      const pokemon = await this.pokemonService.create(createPokemonDto);
      this.logger.methodEnd("create", { pokemonId: pokemon.id });
      return this.sendSuccess(res, pokemon, 201);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      this.logger.methodError("create", error);
      return this.sendError(res, errorMessage);
    }
  }

  public async findAll(_req: Request, res: Response): Promise<Response> {
    this.logger.methodStart("findAll");

    try {
      const pokemons = await this.pokemonService.findAll();
      this.logger.methodEnd("findAll", { count: pokemons.length });
      return this.sendSuccess(res, pokemons);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      this.logger.methodError("findAll", error);
      return this.sendError(res, errorMessage);
    }
  }

  public async findOne(req: Request, res: Response): Promise<Response> {
    this.logger.methodStart("findOne", { id: req.params.id });

    try {
      const id = this.parseId(req);
      const pokemon = await this.pokemonService.findOne(id);

      if (!pokemon) {
        this.logger.warn("Pokemon not found", { id });
        return this.sendError(res, "Pokemon não encontrado", 404);
      }

      this.logger.methodEnd("findOne", { pokemonId: pokemon.id });
      return this.sendSuccess(res, pokemon);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      this.logger.methodError("findOne", error);
      if (errorMessage === "ID inválido") {
        return this.sendError(res, errorMessage, 400);
      }
      return this.sendError(res, errorMessage);
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    this.logger.methodStart("update", { id: req.params.id, body: req.body });

    try {
      const id = this.parseId(req);
      const updatePokemonDto = new UpdatePokemonDto(req.body);
      const errors = await this.validateDto(updatePokemonDto);

      if (errors.length > 0) {
        this.logger.warn("Validation errors in update", { errors });
        return this.sendValidationError(res, errors);
      }

      await this.pokemonService.update(id, updatePokemonDto);
      this.logger.methodEnd("update", { pokemonId: id });
      return res.status(204).send();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      this.logger.methodError("update", error);
      if (errorMessage === "Pokemon não encontrado") {
        return this.sendError(res, errorMessage, 404);
      }
      if (errorMessage === "ID inválido") {
        return this.sendError(res, errorMessage, 400);
      }
      return this.sendError(res, errorMessage);
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    this.logger.methodStart("delete", { id: req.params.id });

    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) {
        this.logger.warn("Invalid ID provided for deletion", {
          id: req.params.id,
        });
        res.status(400).json({ message: "ID inválido" });
        return;
      }

      const deleted = await this.pokemonService.delete(id);

      if (!deleted) {
        this.logger.warn("Pokemon not found for deletion", { id });
        res.status(404).json({ message: "Pokemon não encontrado" });
        return;
      }

      this.logger.methodEnd("delete", { pokemonId: id });
      res.status(204).send();
    } catch (error) {
      this.logger.methodError("delete", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  public async battle(req: Request, res: Response): Promise<Response> {
    this.logger.methodStart("battle", {
      pokemonAId: req.params.pokemonAId,
      pokemonBId: req.params.pokemonBId,
    });

    try {
      const pokemonAId = parseInt(req.params.pokemonAId as string);
      const pokemonBId = parseInt(req.params.pokemonBId as string);

      if (isNaN(pokemonAId) || isNaN(pokemonBId)) {
        this.logger.warn("Invalid Pokemon IDs provided for battle", {
          pokemonAId: req.params.pokemonAId,
          pokemonBId: req.params.pokemonBId,
        });
        return this.sendError(res, "IDs de Pokemon inválidos", 400);
      }

      if (pokemonAId === pokemonBId) {
        this.logger.warn("Same Pokemon ID provided for battle", {
          pokemonId: pokemonAId,
        });
        return this.sendError(
          res,
          "Um Pokemon não pode batalhar contra si mesmo",
          400
        );
      }

      const battleResult = await this.pokemonService.battle(
        pokemonAId,
        pokemonBId
      );

      this.logger.methodEnd("battle", {
        winnerId: battleResult.vencedor.id,
        loserId: battleResult.perdedor.id,
      });
      return this.sendSuccess(res, battleResult);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      this.logger.methodError("battle", error);
      if (
        error instanceof Error &&
        error.message.includes("não foram encontrados")
      ) {
        return this.sendError(res, error.message, 404);
      }
      return this.sendError(res, errorMessage);
    }
  }
}
