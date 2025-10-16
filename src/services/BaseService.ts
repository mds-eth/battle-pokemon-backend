import { BaseRepository } from "../repositories/BaseRepository.js";

export abstract class BaseService<T, CreateDto, UpdateDto> {
  protected repository: BaseRepository<T, CreateDto, UpdateDto>;

  constructor(repository: BaseRepository<T, CreateDto, UpdateDto>) {
    this.repository = repository;
  }

  public async delete(id: number): Promise<boolean> {
    return this.repository.delete(id);
  }

  public abstract create(data: CreateDto): Promise<any>;
  public abstract update(id: number, data: UpdateDto): Promise<any>;
  public abstract findAll(): Promise<any[]>;
  public abstract findOne(id: number): Promise<any>;
}
