import { Router } from "express";

export abstract class BaseRoute {
  protected router: Router;

  constructor() {
    this.router = Router();
  }

  protected abstract initializeRoutes(): void;

  public getRouter(): Router {
    return this.router;
  }

  protected bindMethod(method: Function): Function {
    return method.bind(method);
  }
}
