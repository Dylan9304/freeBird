import { DictionaryRepositoryImpl } from "./data/repositories/DictionaryRepositoryImpl";
import { FreeDictionaryAPI } from "./data/sources/FreeDictionaryAPI";
import { GetDefinitionUseCase } from "./domain/usecases/GetDefinition";
import { ChromeStorageRepositoryImpl } from "./data/repositories/ChromeStorageRepositoryImpl";
import { SaveWordUseCase } from "./domain/usecases/SaveWord";
import { GetVocabularyListUseCase } from "./domain/usecases/GetVocabularyList";
import { GoogleTranslateSource } from "./data/sources/GoogleTranslateSource";

// Sources
const dictSource = new FreeDictionaryAPI();
// Mock storage for now in non-extension env, but in real app we use chrome.storage
// We need a wrapper that checks environment or just assumes extension for production code.
// Implementation of IStorageSource using chrome.storage.local
const chromeStorageSource = {
    get: async <T>(key: string): Promise<T | undefined> => {
        // Check if chrome.storage is available (e.g. in test/browser env without extension)
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

// Repositories
const dictRepo = new DictionaryRepositoryImpl(dictSource);
const storageRepo = new ChromeStorageRepositoryImpl(chromeStorageSource);

// UseCases
export const getDefinitionUseCase = new GetDefinitionUseCase(dictRepo, new GoogleTranslateSource());
export const saveWordUseCase = new SaveWordUseCase(storageRepo);
export const getVocabularyListUseCase = new GetVocabularyListUseCase(storageRepo);
