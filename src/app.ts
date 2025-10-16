import express, { Application } from "express";
import cors from "cors";
import { routes } from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { requestLogger } from "./middlewares/requestLogger.js";

export class App {
  private app: Application;
  private port: number;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.initializeMiddlewares();
    this.initializeSwagger();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(requestLogger);
  }

  private initializeSwagger(): void {
    const swaggerPath = path.resolve(process.cwd(), "src/config/swagger.json");
    const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, "utf-8"));
    this.app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument)
    );
  }

  private initializeRoutes(): void {
    this.app.use("/api", routes);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }

  public getApp(): Application {
    return this.app;
  }

  public getPort(): number {
    return this.port;
  }
}
