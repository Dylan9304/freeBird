import { IVocabularyRepository } from '../repositories/IVocabularyRepository';
import { VocabularyItem } from '../entities/VocabularyItem';

export class GetVocabularyListUseCase {
    constructor(private repository: IVocabularyRepository) { }

    async execute(): Promise<VocabularyItem[]> {
        return this.repository.getAll();
    }
}
