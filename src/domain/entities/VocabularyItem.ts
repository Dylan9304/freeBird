import { Word } from './Word';

export interface ContextInfo {
    sentence: string;
    url: string;
    title: string;
    date: string; // ISO string
}

export interface VocabularyItem extends Word {
    context: ContextInfo;
    savedAt: number; // Timestamp for sorting
}
