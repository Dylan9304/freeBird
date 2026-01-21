export interface IStorageSource {
    get<T>(key: string): Promise<T | undefined>;
    set(key: string, value: any): Promise<void>;
    remove(key: string): Promise<void>;
}
