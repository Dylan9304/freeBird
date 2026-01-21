import { IDictionaryRepository } from "../repositories/IDictionaryRepository";
import { Word } from "../entities/Word";
import { ITranslationSource } from "../../data/sources/ITranslationSource";

export class GetDefinitionUseCase {
    constructor(
        private repository: IDictionaryRepository,
        private translator: ITranslationSource
    ) { }

    async execute(word: string): Promise<Word | null> {
        const cleanWord = word.trim().toLowerCase();
        if (!cleanWord) return null;

        // Run in parallel
        const [definitionResult, translationResult] = await Promise.all([
            this.repository.getDefinition(cleanWord),
            this.translator.translate(cleanWord, 'ko')
        ]);

        if (definitionResult) {
            return {
                ...definitionResult,
                koreanMeaning: translationResult || undefined
            };
        } else if (translationResult) {
            // If no dictionary definition but translation exists, return minimal word object
            return {
                id: cleanWord,
                text: word,
                definitions: [],
                koreanMeaning: translationResult
            };
        }

        return null;
    }
}
