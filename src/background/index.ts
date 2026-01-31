import { handleMessage } from './messageHandler';

chrome.runtime.onMessage.addListener((message, sender) => {
    handleMessage(message, sender).catch(console.error);
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'lookup-word',
        title: 'Lookup Definition',
        contexts: ['selection']
    });

    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.action.onClicked.addListener((tab) => {
    if (tab.windowId) {
        chrome.sidePanel.open({ windowId: tab.windowId });
    }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'lookup-word' && info.selectionText && tab?.windowId) {
        chrome.sidePanel.open({ windowId: tab.windowId });
        setTimeout(() => {
            chrome.runtime.sendMessage({
                type: 'VIEW_UPDATE',
                payload: {
                    word: info.selectionText,
                    context: {
                        sentence: info.selectionText, // Use selection as sentence for now
                        url: tab?.url || '',
                        title: tab?.title || '',
                        date: new Date().toISOString()
                    }
                }
            });
        }, 500);
    }
});

console.log('Background Service Worker Initialized');
