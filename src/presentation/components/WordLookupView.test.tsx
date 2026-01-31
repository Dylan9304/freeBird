import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { WordLookupView } from './WordLookupView';
import { GetDefinitionUseCase } from '@/domain/usecases/GetDefinition';
import { SaveWordUseCase } from '@/domain/usecases/SaveWord';
import { Word } from '@/domain/entities/Word';

describe('WordLookupView', () => {
    it('should display definition when found', async () => {
        const mockWord: Word = {
            id: 'hello',
            text: 'hello',
            phonetic: 'həˈləʊ',
            definitions: [
                { meaning: 'greeting', partOfSpeech: 'noun' }
            ]
        };

        const mockUseCase = {
            execute: vi.fn().mockResolvedValue(mockWord)
        } as unknown as GetDefinitionUseCase;

        const mockSaveUseCase = {
            execute: vi.fn()
        } as unknown as SaveWordUseCase;

        render(<WordLookupView word="hello" useCase={mockUseCase} saveUseCase={mockSaveUseCase} context={{}} />);

        await waitFor(() => {
            expect(screen.getByText('hello')).toBeInTheDocument();
            expect(screen.getByText('greeting')).toBeInTheDocument();
        });
    });

    it('should display error when word not found', async () => {
        const mockUseCase = {
            execute: vi.fn().mockResolvedValue(null)
        } as unknown as GetDefinitionUseCase;

        render(<WordLookupView word="unknown" useCase={mockUseCase} />);

        await waitFor(() => {
            expect(screen.getByText(/API key/i)).toBeInTheDocument();
        });
    });
});
