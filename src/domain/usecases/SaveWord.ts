import { IVocabularyRepository } from '../repositories/IVocabularyRepository';
import { Word } from '../entities/Word';
import { ContextInfo, VocabularyItem } from '../entities/VocabularyItem';

export class SaveWordUseCase {
    constructor(private repository: IVocabularyRepository) { }

    async execute(word: Word, context: ContextInfo): Promise<void> {
        const item: VocabularyItem = {
            ...word,
            context,
            savedAt: Date.now()
        };
        await this.repository.save(item);
    }
}
