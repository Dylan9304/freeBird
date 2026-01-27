import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleDoubleClick, handleSentenceClick } from './interactionHandlers';
import { MessageType } from '@/domain/messages';

// Mock chrome
const mockSendMessage = vi.fn();
(globalThis as any).chrome = {
    runtime: {
        sendMessage: mockSendMessage,
    }
} as any;

describe('Content Script Interactions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('handleDoubleClick', () => {
        it('should send LOOKUP message when text is selected', () => {
            const mockSelection = {
                toString: () => ' hello ',
            };
            vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

            handleDoubleClick();

            expect(mockSendMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: MessageType.LOOKUP,
                    payload: expect.objectContaining({ word: 'hello' })
                })
            );
        });

        it('should not send message if selection is empty', () => {
            vi.spyOn(window, 'getSelection').mockReturnValue({ toString: () => '' } as any);
            handleDoubleClick();
            expect(mockSendMessage).not.toHaveBeenCalled();
        });
    });

    describe('handleSentenceClick', () => {
        it('should prioritize selected text for TTS', () => {
            const mockSelection = {
                toString: () => 'Selected Text',
            };
            vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

            const mockEvent = {
                altKey: true,
                target: {
                    textContent: 'Paragraph Text'
                }
            } as unknown as MouseEvent;

            handleSentenceClick(mockEvent);

            expect(mockSendMessage).toHaveBeenCalledWith({
                type: MessageType.TTS,
                payload: { text: 'Selected Text' }
            });
        });

        it('should fallback to target text if no selection', () => {
            vi.spyOn(window, 'getSelection').mockReturnValue({ toString: () => '' } as any);

            const mockEvent = {
                altKey: true,
                target: {
                    textContent: 'Paragraph Text'
                }
            } as unknown as MouseEvent;

            handleSentenceClick(mockEvent);

            expect(mockSendMessage).toHaveBeenCalledWith({
                type: MessageType.TTS,
                payload: { text: 'Paragraph Text' }
            });
        });

        it('should ignore click without Alt key', () => {
            const mockEvent = { altKey: false } as MouseEvent;
            handleSentenceClick(mockEvent);
            expect(mockSendMessage).not.toHaveBeenCalled();
        });
    });
});
