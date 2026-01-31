import { MessageType, ExtensionMessage } from "@/domain/messages";

export const handleMessage = async (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender
) => {
    if (message.type === MessageType.LOOKUP) {
        if (sender.tab?.windowId) {
            // Store pending lookup in session storage to handle cold start
            await chrome.storage.session.set({ pendingLookup: message.payload });

            // Open Side Panel
            await chrome.sidePanel.open({ windowId: sender.tab.windowId });

            // Broadcast update for already open panel
            setTimeout(() => {
                chrome.runtime.sendMessage({
                    type: 'VIEW_UPDATE',
                    payload: message.payload
                });
            }, 500);
        }
    } else if (message.type === MessageType.TTS) {
        const text = message.payload.text;
        if (text) {
            // Get all voices
            chrome.tts.getVoices((voices) => {
                // Preferred voice filter
                let chosenVoice = voices.find(v => v.lang === 'en-US' && v.voiceName && v.voiceName.includes('Google US English'));

                // Fallback to any Google English voice
                if (!chosenVoice) {
                    chosenVoice = voices.find(v => v.lang?.startsWith('en') && v.voiceName && v.voiceName.includes('Google'));
                }

                // Fallback to any en-US voice
                if (!chosenVoice) {
                    chosenVoice = voices.find(v => v.lang === 'en-US');
                }

                const options: chrome.tts.TtsOptions = {
                    rate: 1.0,
                    lang: 'en-US',
                    voiceName: chosenVoice ? chosenVoice.voiceName : undefined
                };

                chrome.tts.speak(text, options);
            });
        }
    }
};
