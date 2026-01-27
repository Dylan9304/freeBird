import { VocabularyItem } from '../entities/VocabularyItem';

export interface PageGroup {
    url: string;
    title: string;
    items: VocabularyItem[];
    lastSavedAt: number;
}

export interface IVocabularyRepository {
    save(item: VocabularyItem): Promise<void>;
    getAll(): Promise<VocabularyItem[]>;
    remove(id: string): Promise<void>;
    exists(id: string): Promise<boolean>;
    getGroupedByPage(): Promise<PageGroup[]>;
    getByUrl(url: string): Promise<VocabularyItem[]>;
}
