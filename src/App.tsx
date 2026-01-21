import { useEffect, useState } from 'react';
import { WordLookupView } from './presentation/components/WordLookupView';
import { VocabularyView } from './presentation/components/VocabularyView';
import { getDefinitionUseCase, getVocabularyListUseCase, saveWordUseCase } from './di';
import { Book, Search } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'vocab'>('search');
  const [currentWord, setCurrentWord] = useState<string>('');
  const [currentContext, setCurrentContext] = useState<any>(null); // Use proper type if possible

  useEffect(() => {
    // Listen for messages from Background
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'VIEW_UPDATE' && message.payload?.word) {
          setCurrentWord(message.payload.word);
          setCurrentContext(message.payload.context);
          setActiveTab('search');
        }
      });
    }
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-background text-foreground">
      {/* Header/Nav */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 p-3 flex justify-center items-center gap-2 ${activeTab === 'search' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
        >
          <Search className="w-4 h-4" />
          <span className="text-sm font-medium">Lookup</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('vocab');
            // Force refresh vocab list logic if needed, 
            // but VocabularyView fetches on mount. 
            // Maybe we need key to force re-render or internal refresh.
          }}
          className={`flex-1 p-3 flex justify-center items-center gap-2 ${activeTab === 'vocab' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
        >
          <Book className="w-4 h-4" />
          <span className="text-sm font-medium">My Book</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'search' ? (
          <WordLookupView
            word={currentWord}
            context={currentContext}
            useCase={getDefinitionUseCase}
            saveUseCase={saveWordUseCase} // Connect Save Capability
          />
        ) : (
          <VocabularyView useCase={getVocabularyListUseCase} />
        )}
      </div>
    </div>
  );
}

export default App;
