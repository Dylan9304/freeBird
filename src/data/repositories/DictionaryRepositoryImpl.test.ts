import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DictionaryRepositoryImpl } from './DictionaryRepositoryImpl';
import { IDictionarySource, FreeDictionaryResponse } from '../sources/IDictionarySource';
import { Word } from '@/domain/entities/Word';

describe('DictionaryRepositoryImpl', () => {
    let repository: DictionaryRepositoryImpl;
    let mockSource: IDictionarySource;

    beforeEach(() => {
        mockSource = {
            fetchWord: vi.fn(),
        };
        repository = new DictionaryRepositoryImpl(mockSource);
    });

    it('should return a Word when source returns valid data', async () => {
        const mockData: FreeDictionaryResponse = {
            word: 'hello',
            phonetics: [{ text: 'həˈləʊ', audio: 'url' }],
            meanings: [
                {
                    partOfSpeech: 'noun',
                    definitions: [{ definition: 'greeting', example: 'Hello there' }]
                }
            ]
        };

        // Mocking the return value
        vi.mocked(mockSource.fetchWord).mockResolvedValue([mockData]);

        const result = await repository.getDefinition('hello');

        expect(mockSource.fetchWord).toHaveBeenCalledWith('hello');
        expect(result).toEqual<Word>({
            id: 'hello',
            text: 'hello',
            phonetic: 'həˈləʊ',
            audioUrl: 'url',
            definitions: [
                { meaning: 'greeting', example: 'Hello there', partOfSpeech: 'noun' }
            ]
        });
    });

    it('should return null when source returns null (404)', async () => {
        vi.mocked(mockSource.fetchWord).mockResolvedValue(null);
        const result = await repository.getDefinition('unknown');
        expect(result).toBeNull();
    });
});
