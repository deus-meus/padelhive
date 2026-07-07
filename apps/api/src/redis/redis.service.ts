import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  public readonly isEnabled: boolean;

  private publisher: Redis | null = null;
  private subscriber: Redis | null = null;

  constructor() {
    this.isEnabled = Boolean(process.env.REDIS_URL);

    if (this.isEnabled) {
      const redisUrl = process.env.REDIS_URL!;
      
      // Create publisher connection
      this.publisher = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        lazyConnect: false,
      });
      this.publisher.on('error', (err) => {
        this.logger.error(`Redis publisher error: ${err.message}`);
      });

      // Create subscriber connection
      this.subscriber = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        lazyConnect: false,
      });
      this.subscriber.on('error', (err) => {
        this.logger.error(`Redis subscriber error: ${err.message}`);
      });
    }
  }

  async onModuleDestroy() {
    try {
      if (this.publisher) {
        await this.publisher.quit();
      }
    } catch (err) {
      this.logger.error(`Failed to quit publisher: ${err}`);
    }

    try {
      if (this.subscriber) {
        await this.subscriber.quit();
      }
    } catch (err) {
      this.logger.error(`Failed to quit subscriber: ${err}`);
    }
  }

  async publish(channel: string, payload: string): Promise<void> {
    if (!this.isEnabled || !this.publisher) {
      return;
    }

    try {
      await this.publisher.publish(channel, payload);
    } catch (err) {
      this.logger.error(`Failed to publish message to channel ${channel}: ${err}`);
    }
  }

  async subscribe(channel: string, handler: (message: string) => void): Promise<void> {
    if (!this.isEnabled || !this.subscriber) {
      return;
    }

    try {
      await this.subscriber.subscribe(channel);
      this.subscriber.on('message', (chan, message) => {
        if (chan === channel) {
          handler(message);
        }
      });
    } catch (err) {
      this.logger.error(`Failed to subscribe to channel ${channel}: ${err}`);
    }
  }

  getPublisher(): Redis | null {
    return this.publisher;
  }
}
