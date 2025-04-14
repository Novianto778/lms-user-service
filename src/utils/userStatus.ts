import redis from '../config/redis';

const USER_STATUS_PREFIX = 'user_status:';
const USER_STATUS_EXPIRY = 300; // 5 minutes in seconds

export class UserStatusManager {
  static async setOnline(userId: string): Promise<void> {
    const key = `${USER_STATUS_PREFIX}${userId}`;
    await redis.set(key, 'online', 'EX', USER_STATUS_EXPIRY);
  }

  static async isOnline(userId: string): Promise<boolean> {
    const key = `${USER_STATUS_PREFIX}${userId}`;
    const status = await redis.get(key);
    return status === 'online';
  }

  static async getMultipleStatus(userIds: string[]): Promise<Record<string, boolean>> {
    const pipeline = redis.pipeline();

    userIds.forEach((userId) => {
      const key = `${USER_STATUS_PREFIX}${userId}`;
      pipeline.get(key);
    });

    const results = await pipeline.exec();
    return userIds.reduce(
      (acc, userId, index) => {
        acc[userId] = results?.[index]?.[1] === 'online';
        return acc;
      },
      {} as Record<string, boolean>,
    );
  }
}
