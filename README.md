## Battle Pokémon - Backend

API para gerenciamento de Pokémons e batalhas, construída com Node.js, Express e TypeScript, usando Prisma para persistência e Vitest para testes. Inclui observabilidade de requisições com ID de correlação e documentação via Swagger UI.

### Principais Features
- CRUD de Pokémons: criar, listar, buscar por ID, atualizar e deletar.
- Batalha entre Pokémons: define vencedor/perdedor e atualiza níveis.
- Validação de DTOs com `class-validator`.
- Logger avançado de requisições e respostas com ID de correlação (`X-Request-Id`).
- Documentação da API com Swagger (`/api-docs`).
- Testes unitários e de integração com Vitest e Supertest.

### Endpoints
- `GET /api/pokemons` — lista Pokémons.
- `GET /api/pokemons/:id` — busca um Pokémon.
- `POST /api/pokemons` — cria um Pokémon.
- `PUT /api/pokemons/:id` — atualiza um Pokémon (204).
- `DELETE /api/pokemons/:id` — remove um Pokémon (204).
- `POST /api/pokemons/batalhar/:pokemonAId/:pokemonBId` — executa batalha e retorna `{ vencedor, perdedor }`.

### Tecnologias
- Runtime: Node.js + TypeScript
- Web: Express 5
- ORM: Prisma
- Validação: class-validator / class-transformer
- Logs: winston (com logger customizado e request logger)
- Docs: swagger-jsdoc + swagger-ui-express
- Testes: Vitest + Supertest

### Estrutura de Pastas
```
battle-pokemon-backend/
├── prisma/                # schema e migrations
├── src/
│   ├── app.ts             # configuração do express e middlewares
│   ├── server.ts          # bootstrap do servidor e conexão Prisma
│   ├── config/            # swagger
│   ├── controllers/       # controladores (PokemonController)
│   ├── middlewares/       # errorHandler, requestLogger
│   ├── models/dto/        # DTOs de entrada/saída
│   ├── repositories/      # acesso a dados via Prisma
│   ├── routes/            # rotas express
│   ├── services/          # regras de negócio (PokemonService)
│   ├── types/             # types/interfaces
│   └── utils/             # Logger
├── tests/                 # unit e integration
├── tsconfig.json
└── vitest.config.ts
```

### Requisitos
- Node.js 18+ (recomendado 20+)
- Banco PostgreSQL acessível (via `DATABASE_URL`)

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do backend com:
```
DATABASE_URL="postgresql://user:password@localhost:5432/battle_pokemon?schema=public"
PORT=3000
NODE_ENV=development
```

### Como Rodar
1) Instalar dependências:
```
npm install
```
2) Rodar migrations (e opcionalmente abrir o Prisma Studio):
```
npm run migrate
# opcional
npm run studio
```
3) Subir em desenvolvimento:
```
npm run dev
# Server em http://localhost:3000
# Swagger: http://localhost:3000/api-docs
```

### Testes
- Rodar todos os testes:
```
npm test
```
- Unitários apenas:
```
npm run test:unit
```
- Integração apenas:
```
npm run test:integration
```

### Observabilidade (Logs)
- Cada requisição recebe/propaga `X-Request-Id`.
- Logs de entrada: método, URL, headers (sanitizados), IP, body.
- Logs de saída: status, duração, tamanho, body (em dev/test).
- Erros incluem `requestId` no payload e nos logs.

---

## Dicas
- Se estiver sem Postgres local, é possível usar um container rapidamente:
```
docker run --name pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=battle_pokemon -p 5432:5432 -d postgres:16
```
- Depois, aponte o `DATABASE_URL` para esse container e rode as migrations.