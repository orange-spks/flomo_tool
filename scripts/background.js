// 记录注入状态
let injectedTabs = {};

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading') {
        // 页面开始加载时，重置该标签页的注入状态
        delete injectedTabs[tabId];
    }
});

chrome.action.onClicked.addListener(async (tab) => {
    // 检查页面类型
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-error://')) {
        // 在不支持的页面上，我们需要创建一个临时标签来显示提示
        await chrome.tabs.create({ 
            url: `data:text/html,<html><body><script>alert("Chrome 内置页面不支持使用此插件")</script></body></html>`,
            active: false 
        });
        return;
    }

    // 检查页面状态
    if (tab.status !== 'complete') {
        await chrome.tabs.create({ 
            url: `data:text/html,<html><body><script>alert("请等待页面加载完成后再试")</script></body></html>`,
            active: false 
        });
        return;
    }

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
            // 创建一个临时标签来显示错误提示
            await chrome.tabs.create({ 
                url: `data:text/html,<html><body><script>alert("无法在当前页面使用此插件，请尝试刷新页面或在其他页面使用")</script></body></html>`,
                active: false 
            });
            return;
        }
    }
    
    // 发送切换消息
    try {
        await chrome.tabs.sendMessage(tab.id, {action: 'toggleSidebar'});
    } catch (err) {
        console.error('Failed to send message:', err);
        // 如果消息发送失败，可能需要重新注入
        delete injectedTabs[tab.id];
        // 提示用户刷新重试
        await chrome.tabs.create({ 
            url: `data:text/html,<html><body><script>alert("操作失败，请刷新页面后重试")</script></body></html>`,
            active: false 
        });
    }
});

// 当标签页关闭时清理状态
chrome.tabs.onRemoved.addListener((tabId) => {
    delete injectedTabs[tabId];
}); 