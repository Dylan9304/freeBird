import { Word } from "../../domain/entities/Word";

export interface PageSummary {
    topic: string;
    summary: string;
    keyThemes: string[];
    learningTip: string;
}

export interface IAIAssistantSource {
    analyzeWordWithContext(word: string, sentence: string): Promise<Word | null>;
    generatePageSummary?(pageTitle: string, words: string[], sentences: string[]): Promise<PageSummary | null>;
}
