import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import {
  Category,
  FindManyCategoryArgs,
  FindUniqueCategoryArgs,
  CreateOneCategoryArgs,
  UpdateOneCategoryArgs,
  DeleteOneCategoryArgs,
} from '@/@generated/graphql';
import { CategoriesService } from './categories.service';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { CategoryEventPayload } from '@/types/graphql/category-event-payload';
import { Prisma } from '@generated/prisma';
import { AdminOnly } from '@/utils/decorators';

@Resolver(() => Category)
export class CategoriesResolver {
  constructor(
    private readonly categoriesService: CategoriesService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @AdminOnly()
  @Mutation(() => Category)
  async createCategory(@Args() args: CreateOneCategoryArgs) {
    const category = await this.categoriesService.create({
      data: args.data as unknown as Prisma.CategoryCreateInput,
    });

    await this.pubSub.publish('categoryEvents', {
      categoryEvents: { type: 'CREATED', category },
    });

    return category;
  }

  @AdminOnly()
  @Mutation(() => Category)
  async updateCategory(@Args() args: UpdateOneCategoryArgs) {
    const category = await this.categoriesService.update({
      where: args.where,
      data: args.data as unknown as Prisma.CategoryUpdateInput,
    });

    await this.pubSub.publish('categoryEvents', {
      categoryEvents: { type: 'UPDATED', category },
    });

    return category;
  }

  @AdminOnly()
  @Mutation(() => Category)
  async removeCategory(@Args() args: DeleteOneCategoryArgs) {
    const category = await this.categoriesService.remove(args);

    await this.pubSub.publish('categoryEvents', {
      categoryEvents: { type: 'REMOVED', category },
    });

    return category;
  }

  @Query(() => [Category])
  categories(@Args() args: FindManyCategoryArgs) {
    return this.categoriesService.findMany(args);
  }

  @Query(() => Category, { nullable: true })
  category(@Args() args: FindUniqueCategoryArgs) {
    return this.categoriesService.findOne(args);
  }

  @Subscription(() => CategoryEventPayload, {
    name: 'categoryEvents',
    description: 'Fires whenever a category is created, updated, or removed',
  })
  categoryEvents() {
    return this.pubSub.asyncIterableIterator('categoryEvents');
  }
}
