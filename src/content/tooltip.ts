const TOOLTIP_ID = 'freebird-tooltip';
const FREE_DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

let tooltipElement: HTMLDivElement | null = null;
let currentWord: string = '';
let abortController: AbortController | null = null;

function createTooltipElement(): HTMLDivElement {
    const existing = document.getElementById(TOOLTIP_ID);
    if (existing) {
        return existing as HTMLDivElement;
    }

    const tooltip = document.createElement('div');
    tooltip.id = TOOLTIP_ID;
    
    const shadow = tooltip.attachShadow({ mode: 'open' });
    
    const style = document.createElement('style');
    style.textContent = `
        .freebird-container {
            position: fixed;
            z-index: 2147483647;
            background: #1a1a2e;
            color: #eaeaea;
            padding: 10px 14px;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            max-width: 300px;
            pointer-events: auto;
            opacity: 0;
            transform: translateY(8px);
            transition: opacity 0.15s ease, transform 0.15s ease;
        }
        .freebird-container.visible {
            opacity: 1;
            transform: translateY(0);
        }
        .freebird-word {
            font-weight: 600;
            font-size: 16px;
            color: #fff;
            margin-bottom: 4px;
        }
        .freebird-phonetic {
            font-size: 12px;
            color: #a0a0a0;
            margin-left: 6px;
            font-weight: normal;
        }
        .freebird-meaning {
            color: #4fd1c5;
            font-size: 14px;
            line-height: 1.4;
        }
        .freebird-pos {
            display: inline-block;
            background: rgba(79, 209, 197, 0.2);
            color: #4fd1c5;
            padding: 1px 6px;
            border-radius: 4px;
            font-size: 11px;
            margin-right: 6px;
        }
        .freebird-loading {
            color: #a0a0a0;
            font-style: italic;
        }
        .freebird-error {
            color: #fc8181;
        }
        .freebird-hint {
            margin-top: 8px;
            font-size: 11px;
            color: #666;
            border-top: 1px solid #333;
            padding-top: 6px;
        }
        .freebird-arrow {
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid #1a1a2e;
        }
    `;

    const container = document.createElement('div');
    container.className = 'freebird-container';
    container.innerHTML = '<div class="freebird-arrow"></div>';

    shadow.appendChild(style);
    shadow.appendChild(container);
    document.body.appendChild(tooltip);

    return tooltip;
}

function getContainer(): HTMLDivElement | null {
    if (!tooltipElement?.shadowRoot) return null;
    return tooltipElement.shadowRoot.querySelector('.freebird-container');
}

interface DictionaryResponse {
    word: string;
    phonetic?: string;
    phonetics?: { text?: string; audio?: string }[];
    meanings?: {
        partOfSpeech: string;
        definitions: { definition: string; example?: string }[];
    }[];
}

async function fetchQuickDefinition(word: string): Promise<{ meaning: string; phonetic?: string; partOfSpeech?: string } | null> {
    if (abortController) {
        abortController.abort();
    }
    abortController = new AbortController();

    try {
        const response = await fetch(`${FREE_DICTIONARY_API}${encodeURIComponent(word)}`, {
            signal: abortController.signal
        });

        if (!response.ok) return null;

        const data: DictionaryResponse[] = await response.json();
        if (!data?.[0]?.meanings?.[0]?.definitions?.[0]) return null;

        const entry = data[0];
        const firstMeaning = entry.meanings?.[0];
        if (!firstMeaning) return null;
        const phonetic = entry.phonetic || entry.phonetics?.find(p => p.text)?.text;

        return {
            meaning: firstMeaning.definitions[0].definition,
            phonetic,
            partOfSpeech: firstMeaning.partOfSpeech
        };
    } catch (error) {
        if ((error as Error).name === 'AbortError') return null;
        console.error('FreeBird: Dictionary fetch failed', error);
        return null;
    }
}

function positionTooltip(rect: DOMRect): void {
    const container = getContainer();
    if (!container) return;

    const MARGIN = 8;
    const tooltipWidth = 280;
    const tooltipHeight = container.offsetHeight || 80;

    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    let top = rect.top - tooltipHeight - MARGIN;

    if (left < MARGIN) left = MARGIN;
    if (left + tooltipWidth > window.innerWidth - MARGIN) {
        left = window.innerWidth - tooltipWidth - MARGIN;
    }
    
    if (top < MARGIN) {
        top = rect.bottom + MARGIN;
        const arrow = container.querySelector('.freebird-arrow') as HTMLElement;
        if (arrow) {
            arrow.style.bottom = 'auto';
            arrow.style.top = '-6px';
            arrow.style.borderTop = 'none';
            arrow.style.borderBottom = '6px solid #1a1a2e';
        }
    }

    container.style.left = `${left}px`;
    container.style.top = `${top + window.scrollY}px`;
    container.style.width = `${tooltipWidth}px`;
}

export async function showTooltip(word: string, rect: DOMRect): Promise<void> {
    if (currentWord === word) return;
    currentWord = word;

    tooltipElement = createTooltipElement();
    const container = getContainer();
    if (!container) return;

    container.innerHTML = `
        <div class="freebird-word">${word}</div>
        <div class="freebird-loading">Loading...</div>
        <div class="freebird-arrow"></div>
    `;

    positionTooltip(rect);
    requestAnimationFrame(() => container.classList.add('visible'));

    const result = await fetchQuickDefinition(word);

    if (currentWord !== word) return;

    if (result) {
        container.innerHTML = `
            <div class="freebird-word">
                ${word}
                ${result.phonetic ? `<span class="freebird-phonetic">${result.phonetic}</span>` : ''}
            </div>
            <div class="freebird-meaning">
                ${result.partOfSpeech ? `<span class="freebird-pos">${result.partOfSpeech}</span>` : ''}
                ${result.meaning}
            </div>
            <div class="freebird-hint">Double-click for AI analysis</div>
            <div class="freebird-arrow"></div>
        `;
    } else {
        container.innerHTML = `
            <div class="freebird-word">${word}</div>
            <div class="freebird-error">Definition not found</div>
            <div class="freebird-hint">Double-click for AI analysis</div>
            <div class="freebird-arrow"></div>
        `;
    }

    positionTooltip(rect);
}

export function hideTooltip(): void {
    const container = getContainer();
    if (container) {
        container.classList.remove('visible');
    }
    currentWord = '';
    if (abortController) {
        abortController.abort();
        abortController = null;
    }
}
