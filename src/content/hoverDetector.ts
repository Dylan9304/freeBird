import { showTooltip, hideTooltip } from './tooltip';

let currentPoint: { x: number; y: number } | null = null;
let hoverTimeout: ReturnType<typeof setTimeout> | null = null;
let lastWord: string = '';
let isTooltipVisible = false;

const HOVER_DELAY = 100;

// 영문자 단어 검증: 최소 2글자, 하이픈/아포스트로피 허용
const ENGLISH_WORD_PATTERN = /^[a-zA-Z][a-zA-Z'-]*[a-zA-Z]$|^[a-zA-Z]{2}$/;
const WORD_CHAR_PATTERN = /[a-zA-Z'-]/;

function getWordAtPoint(x: number, y: number): { word: string; range: Range } | null {
    const range = document.caretRangeFromPoint(x, y);
    if (!range) return null;

    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return null;

    const textContent = node.textContent || '';
    const offset = range.startOffset;

    let start = offset;
    let end = offset;

    const isWordChar = (char: string) => WORD_CHAR_PATTERN.test(char);

    while (start > 0 && isWordChar(textContent[start - 1])) {
        start--;
    }

    while (end < textContent.length && isWordChar(textContent[end])) {
        end++;
    }

    const word = textContent.slice(start, end).trim();

    if (word.length < 2 || !ENGLISH_WORD_PATTERN.test(word)) {
        return null;
    }

    try {
        const wordRange = document.createRange();
        wordRange.setStart(node, start);
        wordRange.setEnd(node, end);
        return { word: word.toLowerCase(), range: wordRange };
    } catch {
        return null;
    }
}

function isInputElement(element: Element | null): boolean {
    if (!element) return false;
    const tagName = element.tagName.toLowerCase();
    return (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        element.getAttribute('contenteditable') === 'true'
    );
}

function shouldIgnoreElement(element: Element | null): boolean {
    if (!element) return false;
    if (element.closest('#freebird-tooltip')) return true;
    if (isInputElement(element)) return true;
    return false;
}

function handleMouseMove(event: MouseEvent): void {
    const target = event.target as Element;
    
    if (shouldIgnoreElement(target)) {
        cancelHover();
        return;
    }

    currentPoint = { x: event.clientX, y: event.clientY };

    if (hoverTimeout) {
        clearTimeout(hoverTimeout);
    }

    hoverTimeout = setTimeout(() => {
        if (currentPoint) {
            processHover(currentPoint.x, currentPoint.y);
        }
    }, HOVER_DELAY);
}

async function processHover(x: number, y: number): Promise<void> {
    const result = getWordAtPoint(x, y);
    
    if (!result) {
        if (isTooltipVisible) {
            hideTooltip();
            isTooltipVisible = false;
            lastWord = '';
        }
        return;
    }

    const { word, range } = result;

    if (word === lastWord && isTooltipVisible) {
        return;
    }

    lastWord = word;
    const rect = range.getBoundingClientRect();
    showTooltip(word, rect);
    isTooltipVisible = true;
}

function cancelHover(): void {
    if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
    }
}

function handleMouseOut(event: MouseEvent): void {
    const relatedTarget = event.relatedTarget as Element | null;
    if (relatedTarget?.closest('#freebird-tooltip')) {
        return;
    }
    cancelHover();
}

function handleScroll(): void {
    hideTooltip();
    isTooltipVisible = false;
    lastWord = '';
    cancelHover();
}

function handleClick(event: MouseEvent): void {
    const target = event.target as Element;
    if (!target.closest('#freebird-tooltip')) {
        hideTooltip();
        isTooltipVisible = false;
        lastWord = '';
    }
}

export function initHoverDetector(): void {
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseout', handleMouseOut, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    document.addEventListener('click', handleClick, { passive: true });
}

export function cleanupHoverDetector(): void {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseout', handleMouseOut);
    document.removeEventListener('scroll', handleScroll);
    document.removeEventListener('click', handleClick);
    cancelHover();
    hideTooltip();
}
