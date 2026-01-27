import { DynamicAISource } from "./data/sources/DynamicAISource";
import { GetDefinitionUseCase } from "./domain/usecases/GetDefinition";
import { SaveWordUseCase } from "./domain/usecases/SaveWord";
import { GetVocabularyListUseCase } from "./domain/usecases/GetVocabularyList";
import { ChromeStorageRepositoryImpl } from "./data/repositories/ChromeStorageRepositoryImpl";

const chromeStorageSource = {
    get: async <T>(key: string): Promise<T | undefined> => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            const res = await chrome.storage.local.get(key);
            return res[key] as T;
        }
        return undefined;
    },
    set: async (key: string, value: any) => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            await chrome.storage.local.set({ [key]: value });
        }
    },
    remove: async (key: string) => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            await chrome.storage.local.remove(key);
        }
    }
};

export const vocabularyRepository = new ChromeStorageRepositoryImpl(chromeStorageSource);

export const getDefinitionUseCase = new GetDefinitionUseCase(new DynamicAISource());
export const saveWordUseCase = new SaveWordUseCase(vocabularyRepository);
export const getVocabularyListUseCase = new GetVocabularyListUseCase(vocabularyRepository);
