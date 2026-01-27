import React, { useEffect, useState } from 'react';
import { VocabularyItem } from '@/domain/entities/VocabularyItem';
import { PageGroup, IVocabularyRepository } from '@/domain/repositories/IVocabularyRepository';
import { PageSummary } from '@/data/sources/IAIAssistantSource';
import { DynamicAISource } from '@/data/sources/DynamicAISource';
import { Loader2, List, Layers, ChevronRight, ChevronDown, ExternalLink, Sparkles, Bot, StickyNote, Lightbulb, RefreshCw } from 'lucide-react';

type ViewMode = 'all' | 'byPage';

interface Props {
    repository: IVocabularyRepository;
}

const aiSource = new DynamicAISource();

export const VocabularyView: React.FC<Props> = ({ repository }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('all');
    const [items, setItems] = useState<VocabularyItem[]>([]);
    const [pageGroups, setPageGroups] = useState<PageGroup[]>([]);
    const [selectedPage, setSelectedPage] = useState<PageGroup | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [repository]);

    const loadData = async () => {
        setLoading(true);
        const [allItems, groups] = await Promise.all([
            repository.getAll(),
            repository.getGroupedByPage()
        ]);
        setItems(allItems);
        setPageGroups(groups);
        setLoading(false);
    };

    if (loading) {
        return <Loader2 className="animate-spin mx-auto mt-4" />;
    }

    if (items.length === 0) {
        return (
            <div className="text-center text-muted-foreground mt-8 p-4">
                <p>No words saved yet.</p>
                <p className="text-sm mt-2">Double-click on any English word while browsing to analyze and save it.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex border-b bg-secondary/30">
                <button
                    onClick={() => { setViewMode('all'); setSelectedPage(null); }}
                    className={`flex-1 py-2 px-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                        viewMode === 'all'
                            ? 'border-b-2 border-primary text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <List className="w-3.5 h-3.5" />
                    All Words
                </button>
                <button
                    onClick={() => { setViewMode('byPage'); setSelectedPage(null); }}
                    className={`flex-1 py-2 px-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                        viewMode === 'byPage'
                            ? 'border-b-2 border-primary text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <Layers className="w-3.5 h-3.5" />
                    By Page
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                {viewMode === 'all' && <AllWordsView items={items} />}
                {viewMode === 'byPage' && !selectedPage && (
                    <PageListView groups={pageGroups} onSelectPage={setSelectedPage} />
                )}
                {viewMode === 'byPage' && selectedPage && (
                    <PageDetailView group={selectedPage} onBack={() => setSelectedPage(null)} />
                )}
            </div>
        </div>
    );
};

const AllWordsView: React.FC<{ items: VocabularyItem[] }> = ({ items }) => (
    <div className="space-y-3 p-4">
        {items.map(item => (
            <WordCard key={item.id} item={item} showSource />
        ))}
    </div>
);

const PageListView: React.FC<{ groups: PageGroup[]; onSelectPage: (g: PageGroup) => void }> = ({ groups, onSelectPage }) => (
    <div className="space-y-2 p-4">
        {groups.map(group => (
            <button
                key={group.url}
                onClick={() => onSelectPage(group)}
                className="w-full text-left border rounded-lg p-3 bg-card hover:border-primary transition-colors group"
            >
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {group.title || 'Untitled Page'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                            {new URL(group.url).hostname}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                            {group.items.length} words
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                </div>
                <div className="text-[10px] text-muted-foreground mt-2">
                    Last saved: {new Date(group.lastSavedAt).toLocaleDateString()}
                </div>
            </button>
        ))}
    </div>
);

const PageDetailView: React.FC<{ group: PageGroup; onBack: () => void }> = ({ group, onBack }) => {
    const [summary, setSummary] = useState<PageSummary | null>(null);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryError, setSummaryError] = useState(false);

    const generateSummary = async () => {
        setSummaryLoading(true);
        setSummaryError(false);
        try {
            const words = group.items.map(i => i.text);
            const sentences = group.items.map(i => i.context.sentence);
            const result = await aiSource.generatePageSummary(group.title, words, sentences);
            if (result) {
                setSummary(result);
            } else {
                setSummaryError(true);
            }
        } catch {
            setSummaryError(true);
        } finally {
            setSummaryLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b bg-secondary/30">
                <button
                    onClick={onBack}
                    className="text-xs text-primary hover:underline flex items-center gap-1 mb-2"
                >
                    ← Back to pages
                </button>
                <div className="font-medium text-sm truncate">{group.title || 'Untitled Page'}</div>
                <a
                    href={group.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-1"
                >
                    <span className="truncate">{new URL(group.url).hostname}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
                {!summary && !summaryLoading && (
                    <button
                        onClick={generateSummary}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center justify-center gap-2 hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">AI로 페이지 내용 요약하기</span>
                    </button>
                )}

                {summaryLoading && (
                    <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">AI가 분석 중...</span>
                    </div>
                )}

                {summaryError && (
                    <div className="text-center text-sm text-destructive py-2">
                        요약 생성에 실패했습니다. API 키를 확인해주세요.
                    </div>
                )}

                {summary && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-4 space-y-3 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                            <Sparkles className="w-4 h-4" />
                            <span className="font-semibold text-sm">AI 페이지 요약</span>
                        </div>
                        
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">주제</div>
                            <div className="text-sm font-medium">{summary.topic}</div>
                        </div>
                        
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">요약</div>
                            <div className="text-sm">{summary.summary}</div>
                        </div>
                        
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">핵심 주제</div>
                            <div className="flex flex-wrap gap-1.5">
                                {summary.keyThemes.map((theme, i) => (
                                    <span key={i} className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                                        {theme}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <div className="bg-white/50 dark:bg-black/20 rounded-md p-2.5">
                            <div className="text-xs text-muted-foreground mb-1">💡 학습 팁</div>
                            <div className="text-sm">{summary.learningTip}</div>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {group.items.map(item => (
                        <WordCard key={item.id} item={item} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const WordCard: React.FC<{ item: VocabularyItem; showSource?: boolean }> = ({ item, showSource }) => {
    const [expanded, setExpanded] = useState(false);

    const getDifficultyColor = (level: string) => {
        switch (level) {
            case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
            case 'intermediate': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'advanced': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'expert': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="border rounded-lg shadow-sm bg-card overflow-hidden">
            <div
                onClick={() => setExpanded(!expanded)}
                className="p-3 cursor-pointer hover:bg-secondary/30 transition-colors"
            >
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-lg">{item.text}</span>
                            {item.phonetic && <span className="text-xs text-muted-foreground">{item.phonetic}</span>}
                            <span className="flex items-center gap-0.5 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full border border-purple-200">
                                <Bot className="w-2.5 h-2.5" />
                                <span>AI</span>
                            </span>
                            {item.difficulty && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${getDifficultyColor(item.difficulty.level)}`}>
                                    {item.difficulty.level}
                                </span>
                            )}
                        </div>
                        {item.koreanMeaning && (
                            <div className="text-sm text-primary font-medium mt-0.5">{item.koreanMeaning}</div>
                        )}
                    </div>
                    <div className="shrink-0 text-muted-foreground">
                        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                </div>
                <div className="text-xs text-muted-foreground italic truncate mt-1">"{item.context.sentence}"</div>
                <div className="flex justify-between items-center mt-2">
                    {showSource && (
                        <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded truncate max-w-[60%]">
                            {item.context.title}
                        </span>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto">
                        {new Date(item.context.date).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {expanded && (
                <div className="border-t p-3 space-y-3 bg-secondary/10">
                    {item.contextMeaning && (
                        <div className="p-2.5 border rounded-lg bg-primary/5 space-y-1">
                            <div className="flex items-center gap-1.5 text-primary font-semibold text-xs">
                                <StickyNote className="w-3.5 h-3.5" />
                                <span>문맥 속 의미</span>
                            </div>
                            <p className="text-sm text-foreground">{item.contextMeaning}</p>
                        </div>
                    )}

                    {item.definitions && item.definitions.length > 0 && (
                        <div className="space-y-2">
                            {item.definitions.map((def, idx) => (
                                <div key={idx} className="p-2.5 border rounded-lg bg-card">
                                    <span className="italic text-[10px] font-semibold text-primary px-1.5 py-0.5 bg-primary/10 rounded mr-2">
                                        {def.partOfSpeech}
                                    </span>
                                    <span className="text-sm">{def.meaning}</span>
                                    {def.example && (
                                        <div className="mt-1.5 text-xs text-muted-foreground border-l-2 pl-2 border-primary/20">
                                            "{def.example}"
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {item.nuance && (
                        <div className="p-2.5 border rounded-lg bg-card space-y-1">
                            <div className="flex items-center gap-1.5 text-amber-600 font-semibold text-xs">
                                <Lightbulb className="w-3.5 h-3.5" />
                                <span>뉘앙스</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.nuance}</p>
                        </div>
                    )}

                    {item.similarWords && item.similarWords.length > 0 && (
                        <div className="p-2.5 border rounded-lg bg-card space-y-1.5">
                            <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-xs">
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>유의어</span>
                            </div>
                            <div className="space-y-1.5">
                                {item.similarWords.map((sim, idx) => (
                                    <div key={idx} className="text-sm flex gap-2 items-baseline">
                                        <span className="font-semibold text-foreground shrink-0">{sim.word}</span>
                                        <span className="text-muted-foreground text-xs">{sim.nuance}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {item.difficulty?.description && (
                        <div className="text-xs text-muted-foreground">
                            📊 난이도: {item.difficulty.description}
                        </div>
                    )}

                    <button
                        onClick={(e) => { e.stopPropagation(); window.open(item.context.url, '_blank'); }}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                        원문 페이지 열기 <ExternalLink className="w-3 h-3" />
                    </button>
                </div>
            )}
        </div>
    );
};
