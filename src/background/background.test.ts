import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleMessage } from './messageHandler';
import { MessageType } from '@/domain/messages';

const mockOpenSidePanel = vi.fn();
const mockRuntimeSendMessage = vi.fn();
const mockSpeak = vi.fn();
const mockGetVoices = vi.fn((cb) => cb([
    { voiceName: 'Google US English', lang: 'en-US' },
    { voiceName: 'Samantha', lang: 'en-US' }
]));

(globalThis as any).chrome = {
    sidePanel: {
        open: mockOpenSidePanel,
        setOptions: vi.fn(),
    },
    runtime: {
        sendMessage: mockRuntimeSendMessage,
    },
    tts: {
        speak: mockSpeak,
        getVoices: mockGetVoices
    }
};

describe('Background Message Handler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should open side panel and broadcast word on LOOKUP', async () => {
        const sender = { tab: { id: 1, windowId: 100 } };
        const message = { type: MessageType.LOOKUP, payload: { word: 'test' } };

        // We cannot await the setTimeout inside handleMessage easily unless we just wait for the promise of open to resolve
        // handleMessage is async.
        await handleMessage(message, sender as any);

        expect(mockOpenSidePanel).toHaveBeenCalledWith({ windowId: 100 });

        // Advance timer to trigger the broadcast
        vi.advanceTimersByTime(1000);

        expect(mockRuntimeSendMessage).toHaveBeenCalledWith({
            type: 'VIEW_UPDATE',
            payload: { word: 'test' }
        });
    });

    it('should handle TTS message', async () => {
        const message = { type: MessageType.TTS, payload: { text: 'Hello world' } };
        await handleMessage(message, {} as any);

        expect(mockSpeak).toHaveBeenCalledWith('Hello world', expect.objectContaining({
            voiceName: 'Google US English'
        }));
    });
});
