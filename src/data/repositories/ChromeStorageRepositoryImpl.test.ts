import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChromeStorageRepositoryImpl } from './ChromeStorageRepositoryImpl';
import { IStorageSource } from '../sources/IStorageSource';
import { VocabularyItem } from '@/domain/entities/VocabularyItem';

describe('ChromeStorageRepositoryImpl', () => {
    let repository: ChromeStorageRepositoryImpl;
    let mockStorage: IStorageSource;
    const DB_KEY = 'vocab_db';

    beforeEach(() => {
        mockStorage = {
            get: vi.fn(),
            set: vi.fn(),
            remove: vi.fn(),
        };
        repository = new ChromeStorageRepositoryImpl(mockStorage);
    });

    const mockItem: VocabularyItem = {
        id: 'test',
        text: 'test',
        definitions: [],
        context: { sentence: 'test sentence', url: 'http://test.com', title: 'Test', date: '2023-01-01' },
        savedAt: 12345
    };

    it('should save a new item', async () => {
        // Initial state: empty or undefined
        vi.mocked(mockStorage.get).mockResolvedValue(undefined);

        await repository.save(mockItem);

        expect(mockStorage.get).toHaveBeenCalledWith(DB_KEY);
        expect(mockStorage.set).toHaveBeenCalledWith(DB_KEY, { [mockItem.id]: mockItem });
    });

    it('should get all items list', async () => {
        const db = { 'test': mockItem };
        vi.mocked(mockStorage.get).mockResolvedValue(db);

        const items = await repository.getAll();
        expect(items).toEqual([mockItem]);
    });

    it('should return empty list if storage is null', async () => {
        vi.mocked(mockStorage.get).mockResolvedValue(undefined);
        const items = await repository.getAll();
        expect(items).toEqual([]);
    });

    it('should check existence', async () => {
        vi.mocked(mockStorage.get).mockResolvedValue({ 'test': mockItem });
        const exists = await repository.exists('test');
        expect(exists).toBe(true);

        const notExists = await repository.exists('other');
        expect(notExists).toBe(false);
    });

    it('should remove an item', async () => {
        vi.mocked(mockStorage.get).mockResolvedValue({ 'test': mockItem, 'keep': mockItem });

        await repository.remove('test');

        expect(mockStorage.set).toHaveBeenCalledWith(DB_KEY, { 'keep': mockItem });
    });
});
