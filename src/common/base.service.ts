import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

/**
 * BaseService provides a generic abstraction for CRUD operations.
 * It should be extended by specific entity services.
 *
 * @template TEntity - The entity type (e.g., Post, User)
 * @template TCreateInput - The Prisma create input type
 * @template TUpdateInput - The Prisma update input type
 */
@Injectable()
export abstract class BaseService<
  TEntity,
  TCreateInput = any,
  TUpdateInput = any,
  TWhereUniqueInput extends { id: string | number } = { id: string },
> {
  /**
   * @param prismaService - The Prisma service injected by NestJS DI
   */
  constructor(protected readonly prismaService: PrismaService) {}

  /**
   * Provides the Prisma delegate for the specific model (e.g., this.prismaService.post).
   * Must be implemented by subclasses.
   */
  protected abstract get delegate(): any;

  /**
   * Creates a new entity using the provided input data.
   *
   * @param data - Data used to create the entity
   * @returns A promise that resolves with the created entity
   */
  abstract create(data: TCreateInput): Promise<TEntity>;

  /**
   * Retrieves all entities based on optional filters.
   *
   * @param args - Optional arguments for filtering/pagination
   * @returns A promise that resolves with an array of entities
   */
  abstract findAll(args?: any): Promise<TEntity[]>;

  /**
   * Updates an entity based on the provided input data.
   *
   * @param args - Data used to update the entity and a unique field in the entity
   * @returns A promise that resolves with the updated entity
   */
  abstract update(args: {
    where: TWhereUniqueInput;
    data: TUpdateInput;
  }): Promise<TEntity>;

  /**
   * Retrieves a single entity by its ID.
   *
   * @param where - The unique field of the entity to retrieve
   * @returns A promise that resolves with the entity or throws if not found
   * @throws NotFoundException if no entity is found with the given unique field
   */
  async findUnique(where: TWhereUniqueInput): Promise<TEntity> {
    const entity = await this.delegate.findUnique({ where });
    if (!entity) {
      throw new NotFoundException(
        `${this.constructor.name.replace('sService', '')} not found`,
      );
    }
    return entity;
  }

  /**
   * Deletes an entity by its ID.
   *
   * @param where - The unique field of the entity to delete
   * @returns A promise that resolves with the deleted entity
   */
  async delete(where: TWhereUniqueInput): Promise<TEntity> {
    return this.delegate.delete({ where });
  }
}
