import { handleDoubleClick, handleSentenceClick } from './interactionHandlers';
import { initHoverDetector } from './hoverDetector';

document.addEventListener('dblclick', handleDoubleClick);

document.addEventListener('click', (event) => {
    handleSentenceClick(event);
}, true);

initHoverDetector();

console.log('FreeBird: Content Script Initialized');
