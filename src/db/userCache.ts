import { Collection } from 'discord.js';
import user from './user';

interface CachedUser {
    userId: string;
    username: string;
    publicKey: string;
    privateKey: string;
    lastUpdated: number;
}

class UserCache {
    private cache: Collection<string, CachedUser>;
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    constructor() {
        this.cache = new Collection();
    }

    async getUser(userId: string, username: string): Promise<CachedUser | null> {
        const cacheKey = `${userId}-${username}`;
        const cachedUser = this.cache.get(cacheKey);

        if (cachedUser && Date.now() - cachedUser.lastUpdated < this.CACHE_TTL) {
            return cachedUser;
        }

        const dbUser = await user.findOne({ userId, username });
        if (!dbUser) return null;

        const userData: CachedUser = {
            userId: dbUser.userId as string,
            username: dbUser.username as string,
            publicKey: dbUser.publicKey as string,
            privateKey: dbUser.privateKey as string,
            lastUpdated: Date.now()
        };

        this.cache.set(cacheKey, userData);
        return userData;
    }

    invalidateUser(userId: string, username: string): void {
        const cacheKey = `${userId}-${username}`;
        this.cache.delete(cacheKey);
    }

    clearCache(): void {
        this.cache.clear();
    }
}

export const userCache = new UserCache(); 