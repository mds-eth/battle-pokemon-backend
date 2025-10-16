import "reflect-metadata";
import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { App } from "../../src/app.js";

// Mock the actual repository used by services/controllers
vi.mock("../../src/repositories/PokemonRepository.js", () => {
  // Define in-factory class to avoid hoisting issues
  class MockPokemonRepository {
    private store: any[] = [];
    constructor(initial: any[] = []) {
      this.store = [...initial];
    }
    async findAll() {
      return this.store;
    }
    async findOne(id: number) {
      return this.store.find((p) => p.id === id) ?? null;
    }
    async create(data: any) {
      const nextId = this.store.length
        ? Math.max(...this.store.map((p) => p.id)) + 1
        : 1;
      const entity = {
        id: nextId,
        name: data.treinador ?? "",
        type: data.tipo ?? "",
        level: data.nivel ?? 1,
        hp: 50,
        attack: 50,
        defense: 50,
        speed: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.store.push(entity);
      return entity;
    }
    async update(id: number, data: any) {
      const idx = this.store.findIndex((p) => p.id === id);
      if (idx === -1) return null;
      this.store[idx] = { ...this.store[idx], ...data, updatedAt: new Date() };
      return this.store[idx];
    }
    async delete(id: number) {
      const idx = this.store.findIndex((p) => p.id === id);
      if (idx === -1) return false;
      this.store.splice(idx, 1);
      return true;
    }
  }

  const instance = new MockPokemonRepository([
    {
      id: 1,
      name: "Pikachu",
      type: "ELETRICO",
      level: 10,
      hp: 100,
      attack: 55,
      defense: 40,
      speed: 90,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  return {
    PokemonRepository: class {
      findAll = instance.findAll.bind(instance);
      findOne = instance.findOne.bind(instance);
      create = instance.create.bind(instance);
      update = instance.update.bind(instance);
      delete = instance.delete.bind(instance);
    },
  };
});

describe("PokemonRoutes integration", () => {
  let app: App;
  let server: ReturnType<typeof request>;

  beforeEach(() => {
    app = new App(0);
    server = request(app.getApp());
  });

  it("GET /api/pokemons retorna lista", async () => {
    const res = await server.get("/api/pokemons");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("DELETE /api/pokemons/:id deleta existente com 204", async () => {
    const res = await server.delete("/api/pokemons/1");
    expect(res.status).toBe(204);
  });

  it("DELETE /api/pokemons/:id com id inválido retorna 400", async () => {
    const res = await server.delete("/api/pokemons/abc");
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ message: "ID inválido" });
  });

  it("DELETE /api/pokemons/:id inexistente retorna 404", async () => {
    const res = await server.delete("/api/pokemons/999");
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ message: "Pokemon não encontrado" });
  });
});
