export interface Definition {
    meaning: string;
    example?: string;
    partOfSpeech: string;
}

export interface SimilarWord {
    word: string;
    nuance: string;
}

export interface DifficultyInfo {
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    description: string;
}

export interface Word {
    id: string;
    text: string;
    phonetic?: string;
    audioUrl?: string;
    definitions: Definition[];
    koreanMeaning?: string;
    source?: 'ai' | 'dictionary';
    difficulty?: DifficultyInfo;
    nuance?: string;
    similarWords?: SimilarWord[];
    contextMeaning?: string;
}
