import { Router } from "express";
import { PokemonController } from "../controllers/PokemonController.js";

export class PokemonRoutes {
  public router: Router;
  private pokemonController: PokemonController;

  constructor() {
    this.router = Router();
    this.pokemonController = new PokemonController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      "/",
      this.pokemonController.create.bind(this.pokemonController)
    );

    this.router.get(
      "/",
      this.pokemonController.findAll.bind(this.pokemonController)
    );

    this.router.get(
      "/:id",
      this.pokemonController.findOne.bind(this.pokemonController)
    );

    this.router.put(
      "/:id",
      this.pokemonController.update.bind(this.pokemonController)
    );

    this.router.delete(
      "/:id",
      this.pokemonController.delete.bind(this.pokemonController)
    );

    this.router.post(
      "/batalhar/:pokemonAId/:pokemonBId",
      this.pokemonController.battle.bind(this.pokemonController)
    );
  }
}
