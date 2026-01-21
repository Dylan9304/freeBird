import { handleMessage } from './messageHandler';

chrome.runtime.onMessage.addListener((message, sender) => {
    handleMessage(message, sender).catch(console.error);
    // Return true if we want to send async response, but we are not using sendResponse yet.
});

// Context Menu Setup
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'lookup-word',
        title: 'Lookup Definition',
        contexts: ['selection']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'lookup-word' && info.selectionText && tab?.windowId) {
        // Treat context menu click same as Double Click Lookup
        // But we need to open sidePanel manually
        chrome.sidePanel.open({ windowId: tab.windowId });
        setTimeout(() => {
            chrome.runtime.sendMessage({
                type: 'VIEW_UPDATE',
                payload: { word: info.selectionText }
            });
        }, 500);
    }
});

console.log('Background Service Worker Initialized');
