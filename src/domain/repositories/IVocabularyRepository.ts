import { VocabularyItem } from '../entities/VocabularyItem';

export interface IVocabularyRepository {
    save(item: VocabularyItem): Promise<void>;
    getAll(): Promise<VocabularyItem[]>;
    remove(id: string): Promise<void>;
    exists(id: string): Promise<boolean>;
}
