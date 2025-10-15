import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { FeedService } from './feed.service';

@Injectable()
export class FeedRepairService {
  private readonly logger = new Logger(FeedRepairService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly feedService: FeedService,
  ) {}

  async repair(limit = 200) {
    const undelivered = await this.prisma.feedDelivery.findMany({
      where: { delivered: false, attempts: { lt: 5 } },
      take: limit,
      include: { post: { select: { id: true, userId: true } } },
      orderBy: { createdAt: 'asc' },
    });

    if (!undelivered.length) {
      this.logger.log('0 undelivered posts to repair');
      return 0;
    }

    for (const row of undelivered) {
      await this.feedService.fanOutPost({
        id: row.postId,
        authorId: row.post.userId,
      });
      this.logger.log(`Requeued fanout for post ${row.postId}`);
    }

    return undelivered.length;
  }
}
