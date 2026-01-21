import { IDictionarySource, FreeDictionaryResponse } from "./IDictionarySource";

export class FreeDictionaryAPI implements IDictionarySource {
    private readonly BASE_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";

    async fetchWord(word: string): Promise<FreeDictionaryResponse[] | null> {
        try {
            const response = await fetch(`${this.BASE_URL}/${encodeURIComponent(word)}`);

            if (response.status === 404) {
                return null;
            }

            if (!response.ok) {
                throw new Error(`Dictionary API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data as FreeDictionaryResponse[];
        } catch (error) {
            console.error("Failed to fetch definition:", error);
            return null;
        }
    }
}
