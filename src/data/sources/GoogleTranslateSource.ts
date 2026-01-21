import { ITranslationSource } from "./ITranslationSource";

export class GoogleTranslateSource implements ITranslationSource {
    async translate(text: string, targetLang: string = 'ko'): Promise<string | null> {
        try {
            // Unofficial Google Translate API endpoint often used by extensions
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
            const response = await fetch(url);

            if (!response.ok) return null;

            const data = await response.json();
            // data format: [[["translatedText", "originalText", ...], ...], ...]
            if (data && data[0] && data[0][0] && data[0][0][0]) {
                return data[0][0][0];
            }
            return null;
        } catch (error) {
            console.error("Translation failed:", error);
            return null;
        }
    }
}
