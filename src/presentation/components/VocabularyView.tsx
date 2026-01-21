import React, { useEffect, useState } from 'react';
import { GetVocabularyListUseCase } from '@/domain/usecases/GetVocabularyList';
import { VocabularyItem } from '@/domain/entities/VocabularyItem';
import { Loader2 } from 'lucide-react';

interface Props {
    useCase: GetVocabularyListUseCase;
}

export const VocabularyView: React.FC<Props> = ({ useCase }) => {
    const [items, setItems] = useState<VocabularyItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        useCase.execute().then(setItems).finally(() => setLoading(false));
    }, [useCase]);

    if (loading) return <Loader2 className="animate-spin mx-auto mt-4" />;
    if (items.length === 0) return <div className="text-center text-muted-foreground mt-4">No words saved yet.</div>;

    return (
        <div className="space-y-4 p-4">
            {items.map(item => (
                <div key={item.id} className="border p-3 rounded-lg shadow-sm bg-card">
                    <div className="font-bold text-lg">{item.text}</div>
                    <div className="text-xs text-muted-foreground italic truncate my-1">"{item.context.sentence}"</div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-muted-foreground bg-secondary px-1 rounded">{item.context.title}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(item.context.date).toLocaleDateString()}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};
