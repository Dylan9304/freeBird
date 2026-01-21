export interface ITranslationSource {
    translate(text: string, targetLang: string): Promise<string | null>;
}
