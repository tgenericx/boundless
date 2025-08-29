import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import {
  Category,
  FindManyCategoryArgs,
  FindUniqueCategoryArgs,
  CreateOneCategoryArgs,
  UpdateOneCategoryArgs,
  DeleteOneCategoryArgs,
} from 'src/@generated/graphql';
import { CategoriesService } from './categories.service';
import { Inject, UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { CategoryEventPayload } from 'src/types/graphql/category-event-payload';
import { GqlAuthGuard } from 'src/utils/guards';

@Resolver(() => Category)
export class CategoriesResolver {
  constructor(
    private readonly categoriesService: CategoriesService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Category)
  async createCategory(@Args() args: CreateOneCategoryArgs) {
    const category = await this.categoriesService.create(args);
    await this.pubSub.publish('categoryEvents', {
      categoryEvents: { type: 'CREATED', category },
    });
    return category;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Category)
  async updateCategory(@Args() args: UpdateOneCategoryArgs) {
    const category = await this.categoriesService.update(args);
    await this.pubSub.publish('categoryEvents', {
      categoryEvents: { type: 'UPDATED', category },
    });
    return category;
  }

  @UseGuards(GqlAuthGuard)
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
