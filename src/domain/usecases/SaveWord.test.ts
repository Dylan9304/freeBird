import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SaveWordUseCase } from './SaveWord';
import { IVocabularyRepository } from '../repositories/IVocabularyRepository';
import { Word } from '../entities/Word';
import { ContextInfo } from '../entities/VocabularyItem';

describe('SaveWordUseCase', () => {
    let useCase: SaveWordUseCase;
    let mockRepo: IVocabularyRepository;

    beforeEach(() => {
        mockRepo = {
            save: vi.fn(),
            getAll: vi.fn(),
            remove: vi.fn(),
            exists: vi.fn(),
            getGroupedByPage: vi.fn(),
            getByUrl: vi.fn(),
        };
        useCase = new SaveWordUseCase(mockRepo);
    });

    it('should create a VocabularyItem and save it', async () => {
        const mockWord: Word = {
            id: 'test',
            text: 'test',
            definitions: []
        };
        const mockContext: ContextInfo = {
            sentence: 'Context sentence',
            url: 'http://test.com',
            title: 'Title',
            date: '2023-01-01'
        };

        // Mock Date.now()
        const now = 123456789;
        vi.spyOn(Date, 'now').mockReturnValue(now);

        await useCase.execute(mockWord, mockContext);

        expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({
            ...mockWord,
            id: expect.any(String),
            context: mockContext,
            savedAt: now
        }));
    });
});
