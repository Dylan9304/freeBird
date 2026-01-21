export interface Definition {
    meaning: string;
    example?: string;
    partOfSpeech: string;
}

export interface Word {
    id: string; // The word text itself can act as ID
    text: string;
    phonetic?: string;
    audioUrl?: string;
    definitions: Definition[];
    koreanMeaning?: string;
}
