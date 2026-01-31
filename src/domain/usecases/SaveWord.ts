import { IVocabularyRepository } from '../repositories/IVocabularyRepository';
import { Word } from '../entities/Word';
import { ContextInfo, VocabularyItem } from '../entities/VocabularyItem';

export class SaveWordUseCase {
    constructor(private repository: IVocabularyRepository) { }

    async execute(word: Word, context: ContextInfo): Promise<void> {
        const item: VocabularyItem = {
            ...word,
            id: Date.now().toString(36) + Math.random().toString(36).substring(2),
            context,
            savedAt: Date.now()
        };
        await this.repository.save(item);
    }
}
