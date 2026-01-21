import { MessageType } from "@/domain/messages";

export const handleDoubleClick = () => {
    const selection = window.getSelection();
    if (!selection) return;

    const text = selection.toString().trim();
    if (!text) return;

    // Attempt to get sentence context
    let sentence = text;
    if (selection.anchorNode && selection.anchorNode.parentElement) {
        const fullText = selection.anchorNode.parentElement.textContent || '';
        // Simple sentence extraction logic
        sentence = fullText.trim();
        if (sentence.length > 200) {
            sentence = sentence.substring(0, 200) + '...';
        }
    }

    const payload = {
        word: text,
        context: {
            sentence,
            url: window.location.href,
            title: document.title,
            date: new Date().toISOString()
        }
    };

    try {
        chrome.runtime.sendMessage({
            type: MessageType.LOOKUP,
            payload
        });
    } catch (error: any) {
        if (error.message && error.message.includes("Extension context invalidated")) {
            console.log("English Assistant: Extension updated. Please refresh the page.");
        } else {
            console.error(error);
        }
    }
};

export const handleSentenceClick = (event: MouseEvent) => {
    if (!event.altKey) return;

    let text = '';
    const selection = window.getSelection();

    // Prioritize selected text (Dragon/Select -> Alt+Click)
    if (selection && selection.toString().trim().length > 0) {
        text = selection.toString().trim();
    } else {
        // Fallback to clicked element text
        const target = event.target as HTMLElement;
        if (target && target.textContent) {
            text = target.textContent;
        }
    }

    if (!text) return;

    try {
        chrome.runtime.sendMessage({
            type: MessageType.TTS,
            payload: { text },
        });
    } catch (error: any) {
        if (error.message && error.message.includes("Extension context invalidated")) {
            console.log("English Assistant: Extension updated. Please refresh the page.");
        } else {
            console.error(error);
        }
    }
};
