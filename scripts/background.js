// 记录注入状态
let injectedTabs = {};

chrome.action.onClicked.addListener(async (tab) => {
    // 如果还没有注入过脚本
    if (!injectedTabs[tab.id]) {
        try {
            // 注入脚本
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['scripts/content.js']
            });
            // 注入CSS
            await chrome.scripting.insertCSS({
                target: { tabId: tab.id },
                files: ['styles/sidebar.css']
            });
            injectedTabs[tab.id] = true;
        } catch (err) {
            console.error('Failed to inject script:', err);
            return;
        }
    }
    
    // 发送切换消息
    chrome.tabs.sendMessage(tab.id, {action: 'toggleSidebar'});
});

// 当标签页关闭时清理状态
chrome.tabs.onRemoved.addListener((tabId) => {
    delete injectedTabs[tabId];
}); 