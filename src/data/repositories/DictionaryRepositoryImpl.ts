import { IDictionaryRepository } from "@/domain/repositories/IDictionaryRepository";
import { Word } from "@/domain/entities/Word";
import { IDictionarySource } from "../sources/IDictionarySource";

export class DictionaryRepositoryImpl implements IDictionaryRepository {
    constructor(private source: IDictionarySource) { }

    async getDefinition(word: string): Promise<Word | null> {
        const responses = await this.source.fetchWord(word);

        if (!responses || responses.length === 0) {
            return null;
        }

        const data = responses[0];

        // Logic to find best phonetic (one with text)
        const phoneticText = data.phonetics.find(p => p.text)?.text;
        const audio = data.phonetics.find(p => p.audio && p.audio.length > 0)?.audio;

        // Mapping definitions
        const definitions = data.meanings.flatMap(m =>
            m.definitions.map(d => ({
                meaning: d.definition,
                example: d.example,
                partOfSpeech: m.partOfSpeech
            }))
        );

        return {
            id: data.word,
            text: data.word,
            phonetic: phoneticText,
            audioUrl: audio,
            definitions: definitions
        };
    }
}
