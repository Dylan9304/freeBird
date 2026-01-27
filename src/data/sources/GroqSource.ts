import { IAIAssistantSource, PageSummary } from "./IAIAssistantSource";
import { Word } from "../../domain/entities/Word";

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export class GroqSource implements IAIAssistantSource {
    private async getApiKey(): Promise<string | null> {
        const result = await chrome.storage.local.get(['groqApiKey']);
        const key = (result.groqApiKey as string) || null;
        console.log('GroqSource: API Key found:', key ? `${key.substring(0, 10)}...` : 'null');
        return key;
    }

    private async callGroq(prompt: string): Promise<string> {
        const apiKey = await this.getApiKey();
        if (!apiKey) {
            throw new Error('Groq API key not found');
        }

        console.log('GroqSource: Calling Groq API...');
        
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 2000,
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('GroqSource: API error response:', errorText);
            throw new Error(`Groq API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('GroqSource: API success');
        return data.choices?.[0]?.message?.content || '';
    }

    async analyzeWordWithContext(word: string, sentence: string): Promise<Word | null> {
        const apiKey = await this.getApiKey();
        if (!apiKey) {
            console.warn('GroqSource: No API key found');
            return null;
        }

        try {
            console.log('GroqSource: Analyzing word with Groq');
            
            const prompt = `You are an English vocabulary expert helping Korean learners understand English words in context.

Analyze the word "${word}" in this sentence: "${sentence}"

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
    "id": "${word}",
    "text": "${word}",
    "phonetic": "IPA phonetic transcription",
    "definitions": [
        {
            "partOfSpeech": "noun/verb/adjective/adverb/etc",
            "meaning": "Clear, concise definition relevant to this context",
            "example": "A natural example sentence"
        }
    ],
    "koreanMeaning": "가장 적절한 한국어 번역 (문맥에 맞게)",
    "difficulty": {
        "level": "beginner|intermediate|advanced|expert",
        "description": "난이도 설명 (예: '일상 회화에서 자주 사용', 'TOEFL/GRE 수준', '전문 용어')"
    },
    "nuance": "이 단어의 뉘앙스와 어감을 한국어로 상세히 설명. 단순한 뜻 번역이 아닌, 이 단어가 주는 느낌, 어떤 상황에서 쓰이는지, 격식/비격식 여부 등을 포함",
    "similarWords": [
        {
            "word": "유사어1",
            "nuance": "이 유사어와 원래 단어의 뉘앙스 차이를 한국어로 설명"
        },
        {
            "word": "유사어2", 
            "nuance": "이 유사어와 원래 단어의 뉘앙스 차이를 한국어로 설명"
        }
    ],
    "contextMeaning": "이 문맥에서 이 단어가 구체적으로 어떤 의미로 쓰였는지 한국어로 설명"
}

Important:
- difficulty.level must be exactly one of: beginner, intermediate, advanced, expert
- Include 2-3 similar words with nuance comparisons
- All Korean explanations should be natural and helpful for learners
- Return ONLY the JSON, no other text`;

            const text = await this.callGroq(prompt);
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(jsonStr);

            return { ...data, source: 'ai' } as Word;
        } catch (error) {
            console.error("Groq analysis failed:", error);
            return null;
        }
    }

    async generatePageSummary(pageTitle: string, words: string[], sentences: string[]): Promise<PageSummary | null> {
        const apiKey = await this.getApiKey();
        if (!apiKey) {
            return null;
        }

        try {
            const prompt = `You are an English learning assistant helping Korean learners understand the context of vocabulary they saved from a webpage.

Page title: "${pageTitle}"
Words saved: ${words.join(', ')}
Sentences where words appeared:
${sentences.map((s, i) => `${i + 1}. "${s}"`).join('\n')}

Based on these words and sentences, provide a brief summary of what this page was about and how these words relate to the content.

Return ONLY a valid JSON object (no markdown, no code blocks) with this structure:
{
    "topic": "페이지의 주제를 한 문장으로 (한국어)",
    "summary": "이 페이지가 어떤 내용인지 2-3문장으로 요약 (한국어). 저장된 단어들이 어떤 맥락에서 나왔는지 설명.",
    "keyThemes": ["핵심 주제1", "핵심 주제2", "핵심 주제3"],
    "learningTip": "이 페이지의 단어들을 효과적으로 기억하기 위한 학습 팁 (한국어)"
}`;

            const text = await this.callGroq(prompt);
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr) as PageSummary;
        } catch (error) {
            console.error("Groq page summary failed:", error);
            return null;
        }
    }
}
