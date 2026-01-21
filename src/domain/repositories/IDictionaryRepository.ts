import { Word } from '../entities/Word';

export interface IDictionaryRepository {
    getDefinition(word: string): Promise<Word | null>;
}
