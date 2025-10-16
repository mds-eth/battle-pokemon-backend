import { PrismaClient } from '@prisma/client';

export abstract class BaseRepository<T, CreateData, UpdateData> {
  protected readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  abstract create(data: CreateData): Promise<T>;
  abstract findAll(): Promise<T[]>;
  abstract findOne(id: number): Promise<T | null>;
  abstract update(id: number, data: UpdateData): Promise<T | null>;
  abstract delete(id: number): Promise<boolean>;

  protected async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}