import React, { useEffect, useState } from 'react';
import { Save, ExternalLink, Zap } from 'lucide-react';

export const Options: React.FC = () => {
    const [groqApiKey, setGroqApiKey] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const result = await chrome.storage.local.get(['groqApiKey']);
        if (result.groqApiKey) setGroqApiKey(result.groqApiKey as string);
    };

    const handleSave = async () => {
        await chrome.storage.local.set({ groqApiKey });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-8 flex justify-center">
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">Configure your English Learning Assistant</p>
                </div>

                <div className="bg-card border rounded-lg p-6 space-y-6 shadow-sm">
                    <div className="flex items-center gap-2 pb-4 border-b">
                        <Zap className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold">AI Provider</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Groq API Key</label>
                            <input
                                type="password"
                                value={groqApiKey}
                                onChange={(e) => setGroqApiKey(e.target.value)}
                                placeholder="gsk_..."
                                className="w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 space-y-3">
                            <h3 className="font-semibold text-sm flex items-center gap-2 text-orange-600">
                                ⚡ Groq API Key 발급
                            </h3>
                            <ol className="list-decimal list-inside text-sm space-y-2 text-muted-foreground">
                                <li>
                                    <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                                        Groq Console <ExternalLink className="w-3 h-3" />
                                    </a> 접속
                                </li>
                                <li>Google/GitHub로 로그인</li>
                                <li><strong>"Create API Key"</strong> 클릭</li>
                                <li>키 복사 후 위에 붙여넣기</li>
                            </ol>
                            <p className="text-xs text-orange-600/80">
                                💡 Groq는 무료이며, 할당량이 넉넉합니다! (Llama 3.3 70B 모델 사용)
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-md flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors font-medium"
                    >
                        <Save className="w-4 h-4" />
                        {saved ? 'Saved!' : 'Save Settings'}
                    </button>

                    <p className="text-xs text-muted-foreground text-center">
                        API Key는 브라우저에 로컬 저장되며 외부로 전송되지 않습니다.
                    </p>
                </div>
            </div>
        </div>
    );
};
