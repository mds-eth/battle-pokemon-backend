export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pokemon Battle API",
      version: "1.0.0",
      description: "API para gerenciamento de batalhas de Pokémon",
    },
    servers: [
      {
        url: "https://d02c3b94a890.ngrok-free.app/api",
        description: "Servidor de desenvolvimento",
      },
    ],
    components: {
      schemas: {
        Pokemon: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "ID único do Pokémon",
            },
            tipo: {
              type: "string",
              enum: ["pikachu", "charizard", "mewtwo"],
              description: "Tipo do Pokémon",
            },
            treinador: {
              type: "string",
              description: "Nome do treinador",
            },
            nivel: {
              type: "integer",
              description: "Nível do Pokémon",
            },
          },
        },
        CreatePokemon: {
          type: "object",
          required: ["tipo", "treinador"],
          properties: {
            tipo: {
              type: "string",
              enum: ["pikachu", "charizard", "mewtwo"],
              description: "Tipo do Pokémon",
            },
            treinador: {
              type: "string",
              description: "Nome do treinador",
            },
          },
        },
        UpdatePokemon: {
          type: "object",
          properties: {
            treinador: {
              type: "string",
              description: "Nome do treinador",
            },
          },
        },
        BattleResult: {
          type: "object",
          properties: {
            vencedor: {
              $ref: "#/components/schemas/Pokemon",
            },
            perdedor: {
              $ref: "#/components/schemas/Pokemon",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Mensagem de erro",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  property: {
                    type: "string",
                  },
                  constraints: {
                    type: "object",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};
