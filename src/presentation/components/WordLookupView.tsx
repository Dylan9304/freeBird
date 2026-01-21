import React, { useEffect, useState } from 'react';
import { GetDefinitionUseCase } from '@/domain/usecases/GetDefinition';
import { SaveWordUseCase } from '@/domain/usecases/SaveWord';
import { Word } from '@/domain/entities/Word';
import { Loader2, Volume2, Star, Check } from 'lucide-react';

interface Props {
    word?: string;
    context?: any;
    useCase: GetDefinitionUseCase;
    saveUseCase?: SaveWordUseCase;
}

export const WordLookupView: React.FC<Props> = ({ word, context, useCase, saveUseCase }) => {
    const [data, setData] = useState<Word | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!word) {
            setData(null);
            return;
        }
        setSaved(false);
        const fetch = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await useCase.execute(word);
                if (result) {
                    setData(result);
                } else {
                    setError('Definition not found.');
                    setData(null);
                }
            } catch (e) {
                setError('Error fetching definition.');
                setData(null);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [word, useCase]);

    const handleSave = async () => {
        if (!data || !saveUseCase || !context) return;
        try {
            await saveUseCase.execute(data, context);
            setSaved(true);
        } catch (error) {
            console.error("Failed to save", error);
        }
    };

    if (!word) return <div className="p-4 text-center text-muted-foreground">Double click a word to lookup</div>;
    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
    if (!data) return null;

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">{data.text}</h2>
                    <div className="flex items-center gap-2">
                        {data.phonetic && <span className="text-muted-foreground">{data.phonetic}</span>}
                        {data.koreanMeaning && <span className="text-primary font-semibold">{data.koreanMeaning}</span>}
                    </div>
                </div>
                <div className="flex gap-2">
                    {saveUseCase && context && (
                        <button
                            onClick={handleSave}
                            disabled={saved}
                            className={`p-2 rounded-full transition-colors ${saved ? 'bg-green-100 text-green-600' : 'hover:bg-secondary text-muted-foreground'}`}
                            title="Save to Vocabulary"
                        >
                            {saved ? <Check className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                        </button>
                    )}
                    {data.audioUrl && (
                        <button
                            onClick={() => new Audio(data.audioUrl).play()}
                            className="p-2 rounded-full hover:bg-secondary"
                        >
                            <Volume2 className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {data.definitions.map((def, idx) => (
                    <div key={idx} className="p-3 border rounded-lg bg-card text-left">
                        <span className="italic text-xs font-semibold text-primary px-2 py-1 bg-primary/10 rounded mr-2">
                            {def.partOfSpeech}
                        </span>
                        <span className="text-sm">{def.meaning}</span>
                        {def.example && (
                            <div className="mt-2 text-xs text-muted-foreground border-l-2 pl-2 border-primary/20">
                                "{def.example}"
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
