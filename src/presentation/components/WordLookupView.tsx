import React, { useEffect, useState } from 'react';
import { GetDefinitionUseCase } from '@/domain/usecases/GetDefinition';
import { SaveWordUseCase } from '@/domain/usecases/SaveWord';
import { Word } from '@/domain/entities/Word';
import { Loader2, Volume2, Check, Bot, StickyNote, Lightbulb, RefreshCw } from 'lucide-react';

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
                console.log('WordLookupView: Fetching word:', word, 'context:', context);
                const result = await useCase.execute(word, context?.sentence);
                if (result) {
                    setData(result);
                    console.log('WordLookupView: Got result, saveUseCase:', !!saveUseCase, 'context:', !!context);
                    if (saveUseCase && context) {
                        console.log('WordLookupView: Saving to vocabulary...');
                        await saveUseCase.execute(result, context);
                        console.log('WordLookupView: Saved successfully');
                        setSaved(true);
                    }
                } else {
                    setError('API key를 확인해주세요. Settings에서 Groq API Key를 입력하세요.');
                    setData(null);
                }
            } catch (e) {
                console.error('WordLookupView: Error:', e);
                setError('API 오류가 발생했습니다. Settings에서 API Key를 확인해주세요.');
                setData(null);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [word, context, useCase, saveUseCase]);

    const getDifficultyColor = (level: string) => {
        switch (level) {
            case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
            case 'intermediate': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'advanced': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'expert': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (!word) return <div className="p-4 text-center text-muted-foreground">Double click a word to lookup</div>;
    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
    if (!data) return null;

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold">{data.text}</h2>
                    <div className="flex flex-wrap items-center gap-2">
                        {data.phonetic && <span className="text-muted-foreground">{data.phonetic}</span>}
                        {data.koreanMeaning && <span className="text-primary font-semibold">{data.koreanMeaning}</span>}
                        
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[10px] sm:text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                                <Bot className="w-3 h-3" />
                                <span>AI</span>
                            </span>
                            
                            {data.difficulty && (
                                <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(data.difficulty.level)}`}>
                                    {data.difficulty.level.charAt(0).toUpperCase() + data.difficulty.level.slice(1)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {saved && (
                        <span className="p-2 text-green-600" title="Saved to Vocabulary">
                            <Check className="w-5 h-5" />
                        </span>
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
                {data.contextMeaning && (
                    <div className="p-3 border rounded-lg bg-primary/5 text-left space-y-2">
                        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                            <StickyNote className="w-4 h-4" />
                            <span>Context Meaning</span>
                        </div>
                        <p className="text-sm text-foreground">{data.contextMeaning}</p>
                    </div>
                )}

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

                {data.nuance && (
                    <div className="p-3 border rounded-lg bg-card text-left space-y-2">
                        <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm">
                            <Lightbulb className="w-4 h-4" />
                            <span>Nuance</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{data.nuance}</p>
                    </div>
                )}

                {data.similarWords && data.similarWords.length > 0 && (
                    <div className="p-3 border rounded-lg bg-card text-left space-y-2">
                        <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                            <RefreshCw className="w-4 h-4" />
                            <span>Similar Words</span>
                        </div>
                        <div className="space-y-2">
                            {data.similarWords.map((sim, idx) => (
                                <div key={idx} className="text-sm grid grid-cols-[1fr,auto,2fr] gap-2 items-baseline">
                                    <span className="font-semibold text-foreground">{sim.word}</span>
                                    <span className="text-muted-foreground text-xs">vs</span>
                                    <span className="text-muted-foreground">{sim.nuance}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
