import { Word } from "../entities/Word";
import { IAIAssistantSource } from "../../data/sources/IAIAssistantSource";

export class GetDefinitionUseCase {
    constructor(private aiAssistant: IAIAssistantSource) { }

    async execute(word: string, contextSentence?: string): Promise<Word | null> {
        const cleanWord = word.trim().toLowerCase();
        if (!cleanWord) return null;

        if (!contextSentence) {
            contextSentence = cleanWord;
        }

        return this.aiAssistant.analyzeWordWithContext(cleanWord, contextSentence);
    }
}
