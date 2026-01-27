import { IAIAssistantSource, PageSummary } from "./IAIAssistantSource";
import { GroqSource } from "./GroqSource";
import { Word } from "../../domain/entities/Word";

export class DynamicAISource implements IAIAssistantSource {
    private groqSource = new GroqSource();

    async analyzeWordWithContext(word: string, sentence: string): Promise<Word | null> {
        return this.groqSource.analyzeWordWithContext(word, sentence);
    }

    async generatePageSummary(pageTitle: string, words: string[], sentences: string[]): Promise<PageSummary | null> {
        return this.groqSource.generatePageSummary(pageTitle, words, sentences);
    }
}
