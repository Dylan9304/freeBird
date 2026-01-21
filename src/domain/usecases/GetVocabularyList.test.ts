import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetVocabularyListUseCase } from './GetVocabularyList';
import { IVocabularyRepository } from '../repositories/IVocabularyRepository';

describe('GetVocabularyListUseCase', () => {
    let useCase: GetVocabularyListUseCase;
    let mockRepo: IVocabularyRepository;

    beforeEach(() => {
        mockRepo = {
            save: vi.fn(),
            getAll: vi.fn(),
            remove: vi.fn(),
            exists: vi.fn(),
        };
        useCase = new GetVocabularyListUseCase(mockRepo);
    });

    it('should return all items', async () => {
        const mockItems = [{ id: '1' } as any];
        vi.mocked(mockRepo.getAll).mockResolvedValue(mockItems);

        const result = await useCase.execute();
        expect(result).toBe(mockItems);
        expect(mockRepo.getAll).toHaveBeenCalled();
    });
});
