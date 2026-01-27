import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetDefinitionUseCase } from './GetDefinition';
import { Word } from '../entities/Word';
import { IAIAssistantSource } from '../../data/sources/IAIAssistantSource';

describe('GetDefinitionUseCase', () => {
    let useCase: GetDefinitionUseCase;
    let mockAIAssistant: IAIAssistantSource;

    beforeEach(() => {
        mockAIAssistant = {
            analyzeWordWithContext: vi.fn()
        };
        useCase = new GetDefinitionUseCase(mockAIAssistant);
    });

    it('should return AI analysis result', async () => {
        const mockWord: Word = {
            id: 'test',
            text: 'test',
            definitions: [{ partOfSpeech: 'noun', meaning: 'a test', example: 'This is a test.' }],
            koreanMeaning: '테스트',
            source: 'ai'
        };

        vi.mocked(mockAIAssistant.analyzeWordWithContext).mockResolvedValue(mockWord);

        const result = await useCase.execute('test', 'This is a test sentence.');

        expect(mockAIAssistant.analyzeWordWithContext).toHaveBeenCalledWith('test', 'This is a test sentence.');
        expect(result).toEqual(mockWord);
    });

    it('should trim and lowercase the input word', async () => {
        vi.mocked(mockAIAssistant.analyzeWordWithContext).mockResolvedValue(null);

        await useCase.execute('  Test  ', 'sentence');

        expect(mockAIAssistant.analyzeWordWithContext).toHaveBeenCalledWith('test', 'sentence');
    });

    it('should use word as context if no context provided', async () => {
        vi.mocked(mockAIAssistant.analyzeWordWithContext).mockResolvedValue(null);

        await useCase.execute('hello');

        expect(mockAIAssistant.analyzeWordWithContext).toHaveBeenCalledWith('hello', 'hello');
    });

    it('should return null for empty word', async () => {
        const result = await useCase.execute('   ');
        expect(result).toBeNull();
    });
});
