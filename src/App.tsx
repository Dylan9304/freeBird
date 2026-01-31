import { useEffect, useState } from 'react';
import { WordLookupView } from './presentation/components/WordLookupView';
import { VocabularyView } from './presentation/components/VocabularyView';
import { getDefinitionUseCase, saveWordUseCase, vocabularyRepository } from './di';
import { Book, Search } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'vocab'>('search');
  const [currentWord, setCurrentWord] = useState<string>('');
  const [currentContext, setCurrentContext] = useState<any>(null);

  useEffect(() => {
    // Check for pending lookup in session storage (for cold start)
    const checkPendingLookup = async () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.session) {
        const data = await chrome.storage.session.get('pendingLookup') as { pendingLookup?: { word: string; context: any } };
        if (data.pendingLookup) {
          console.log('App: Found pending lookup', data.pendingLookup);
          setCurrentWord(data.pendingLookup.word);
          setCurrentContext(data.pendingLookup.context);
          setActiveTab('search');
          // Clear it after using
          await chrome.storage.session.remove('pendingLookup');
        }
      }
    };

    checkPendingLookup();

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
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 p-3 flex justify-center items-center gap-2 ${activeTab === 'search' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
        >
          <Search className="w-4 h-4" />
          <span className="text-sm font-medium">Lookup</span>
        </button>
        <button
          onClick={() => setActiveTab('vocab')}
          className={`flex-1 p-3 flex justify-center items-center gap-2 ${activeTab === 'vocab' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
        >
          <Book className="w-4 h-4" />
          <span className="text-sm font-medium">My Book</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'search' ? (
          <WordLookupView
            word={currentWord}
            context={currentContext}
            useCase={getDefinitionUseCase}
            saveUseCase={saveWordUseCase}
          />
        ) : (
          <VocabularyView repository={vocabularyRepository} />
        )}
      </div>
    </div>
  );
}

export default App;
