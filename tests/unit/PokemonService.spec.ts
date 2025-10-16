import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PokemonService } from "../../src/services/PokemonService.js";
import { PokemonRepository } from "../../src/repositories/PokemonRepository.js";

describe("PokemonService - delete", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retorna false quando pokemon não existe", async () => {
    vi.spyOn(PokemonRepository.prototype, "findOne").mockResolvedValue(null);
    const service = new PokemonService();
    const deleted = await service.delete(999);
    expect(deleted).toBe(false);
  });

  it("retorna true quando pokemon é deletado", async () => {
    vi.spyOn(PokemonRepository.prototype, "findOne").mockResolvedValue({
      id: 1,
      name: "Pikachu",
      type: "ELETRICO",
      level: 10,
      hp: 100,
      attack: 55,
      defense: 40,
      speed: 90,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    vi.spyOn(PokemonRepository.prototype, "delete").mockResolvedValue(true);

    const service = new PokemonService();
    const deleted = await service.delete(1);
    expect(deleted).toBe(true);
  });
});
