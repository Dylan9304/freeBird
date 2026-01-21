export interface FreeDictionaryResponse {
    word: string;
    phonetics: Array<{ text?: string; audio?: string }>;
    meanings: Array<{
        partOfSpeech: string;
        definitions: Array<{
            definition: string;
            example?: string;
        }>;
    }>;
}

export interface IDictionarySource {
    fetchWord(word: string): Promise<FreeDictionaryResponse[] | null>;
}
