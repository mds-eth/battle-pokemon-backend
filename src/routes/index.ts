import { Router } from "express";
import { PokemonRoutes } from "./pokemon.routes.js";

const routes: Router = Router();
const pokemonRoutes = new PokemonRoutes();

routes.use("/pokemons", pokemonRoutes.router);

export { routes };
