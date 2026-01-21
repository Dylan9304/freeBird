import { handleDoubleClick, handleSentenceClick } from './interactionHandlers';

// Setup Event Listeners
document.addEventListener('dblclick', handleDoubleClick);

document.addEventListener('click', (event) => {
    handleSentenceClick(event);
}, true); // Capture phase to ensure we catch it before others if needed, or bubble.

console.log('English Assistant Content Script Initialized');
