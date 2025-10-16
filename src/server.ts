import "reflect-metadata";
import { App } from "./app.js";
import { PrismaClient } from "@prisma/client";

export class Server {
  private app: App;
  private prisma: PrismaClient;
  private port: number;

  constructor(port: number = Number(process.env.PORT) || 3000) {
    this.port = port;
    this.app = new App(this.port);
    this.prisma = new PrismaClient();
  }

  private async connectDatabase(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log("Database connected successfully");
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }
  }

  private async disconnectDatabase(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      console.log("Database disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting from database:", error);
    }
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      console.log(`Received ${signal}. Starting graceful shutdown...`);
      await this.disconnectDatabase();
      process.exit(0);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  }

  public async start(): Promise<void> {
    try {
      await this.connectDatabase();
      this.setupGracefulShutdown();
      this.app.listen();
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  }

  public getApp(): App {
    return this.app;
  }

  public getPrisma(): PrismaClient {
    return this.prisma;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new Server();
  server.start();
}
