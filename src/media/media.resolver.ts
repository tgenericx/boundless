import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import {
  Media,
  FindManyMediaArgs,
  FindUniqueMediaArgs,
  CreateOneMediaArgs,
  UpdateOneMediaArgs,
  DeleteOneMediaArgs,
} from 'src/@generated/graphql';
import { MediaService } from './media.service';
import { Inject, UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { MediaEventPayload } from 'src/types/graphql/media-event-payload';
import { GqlAuthGuard } from 'src/utils/guards';

@Resolver(() => Media)
export class MediaResolver {
  constructor(
    private readonly mediaService: MediaService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Media)
  async createMedia(@Args() args: CreateOneMediaArgs) {
    const media = await this.mediaService.create(args);
    await this.pubSub.publish('mediaEvents', {
      mediaEvents: { type: 'CREATED', media },
    });
    return media;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Media)
  async updateMedia(@Args() args: UpdateOneMediaArgs) {
    const media = await this.mediaService.update(args);
    await this.pubSub.publish('mediaEvents', {
      mediaEvents: { type: 'UPDATED', media },
    });
    return media;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Media)
  async removeMedia(@Args() args: DeleteOneMediaArgs) {
    const media = await this.mediaService.remove(args);
    await this.pubSub.publish('mediaEvents', {
      mediaEvents: { type: 'REMOVED', media },
    });
    return media;
  }

  @Query(() => [Media])
  medias(@Args() args: FindManyMediaArgs) {
    return this.mediaService.findMany(args);
  }

  @Query(() => Media, { nullable: true })
  media(@Args() args: FindUniqueMediaArgs) {
    return this.mediaService.findOne(args);
  }

  @Subscription(() => MediaEventPayload, {
    name: 'mediaEvents',
    description: 'Fires whenever a media item is created, updated, or removed',
  })
  mediaEvents() {
    return this.pubSub.asyncIterableIterator('mediaEvents');
  }
}
