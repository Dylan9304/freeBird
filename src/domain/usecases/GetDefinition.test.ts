import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetDefinitionUseCase } from './GetDefinition';
import { IDictionaryRepository } from '../repositories/IDictionaryRepository';
import { Word } from '../entities/Word';

describe('GetDefinitionUseCase', () => {
    let useCase: GetDefinitionUseCase;
    let mockRepo: IDictionaryRepository;

    beforeEach(() => {
        mockRepo = {
            getDefinition: vi.fn()
        };
        const mockTranslator = {
            translate: vi.fn().mockResolvedValue('테스트')
        };
        useCase = new GetDefinitionUseCase(mockRepo, mockTranslator);
    });

    it('should return definition from repository', async () => {
        const mockWord: Word = {
            id: 'test',
            text: 'test',
            definitions: []
        };

        vi.mocked(mockRepo.getDefinition).mockResolvedValue(mockWord);

        const result = await useCase.execute('test');

        expect(mockRepo.getDefinition).toHaveBeenCalledWith('test');
        expect(result).toEqual({ ...mockWord, koreanMeaning: '테스트' });
    });

    it('should trim and lowercase the input word', async () => {
        await useCase.execute('  Test  ');
        expect(mockRepo.getDefinition).toHaveBeenCalledWith('test');
    });
});
