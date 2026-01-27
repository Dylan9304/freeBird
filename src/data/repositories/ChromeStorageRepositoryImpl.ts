import { IVocabularyRepository, PageGroup } from "@/domain/repositories/IVocabularyRepository";
import { VocabularyItem } from "@/domain/entities/VocabularyItem";
import { IStorageSource } from "../sources/IStorageSource";

export class ChromeStorageRepositoryImpl implements IVocabularyRepository {
    private readonly DB_KEY = 'vocab_db';

    constructor(private storage: IStorageSource) { }

    private async getDB(): Promise<Record<string, VocabularyItem>> {
        const data = await this.storage.get<Record<string, VocabularyItem>>(this.DB_KEY);
        return data || {};
    }

    async save(item: VocabularyItem): Promise<void> {
        const db = await this.getDB();
        db[item.id] = item;
        await this.storage.set(this.DB_KEY, db);
    }

    async getAll(): Promise<VocabularyItem[]> {
        const db = await this.getDB();
        return Object.values(db).sort((a, b) => b.savedAt - a.savedAt);
    }

    async remove(id: string): Promise<void> {
        const db = await this.getDB();
        if (db[id]) {
            delete db[id];
            await this.storage.set(this.DB_KEY, db);
        }
    }

    async exists(id: string): Promise<boolean> {
        const db = await this.getDB();
        return !!db[id];
    }

    async getGroupedByPage(): Promise<PageGroup[]> {
        const items = await this.getAll();
        const groupMap = new Map<string, PageGroup>();
        
        for (const item of items) {
            const url = item.context.url;
            if (!groupMap.has(url)) {
                groupMap.set(url, {
                    url,
                    title: item.context.title,
                    items: [],
                    lastSavedAt: item.savedAt
                });
            }
            const group = groupMap.get(url)!;
            group.items.push(item);
            if (item.savedAt > group.lastSavedAt) {
                group.lastSavedAt = item.savedAt;
            }
        }
        
        return Array.from(groupMap.values()).sort((a, b) => b.lastSavedAt - a.lastSavedAt);
    }

    async getByUrl(url: string): Promise<VocabularyItem[]> {
        const items = await this.getAll();
        return items.filter(item => item.context.url === url);
    }
}
