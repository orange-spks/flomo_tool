// 记录注入状态和内容脚本版本
const CONTENT_SCRIPT_VERSION = '2026-04-15-v1';
let injectedTabs = {};

// 确保background script加载
chrome.runtime.onInstalled.addListener(() => {
    console.log('Background script installed');
});

// 显示提示
function showAlert(message) {
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#666666' });
    chrome.action.setTitle({ title: message });
}

// 重置图标状态
function resetIcon() {
    chrome.action.setBadgeText({ text: '' });
    chrome.action.setTitle({ title: 'Flomo Clipper' });
}

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log('Tab updated:', tabId, changeInfo.status);
    if (changeInfo.status === 'loading') {
        // 页面开始加载时，重置该标签页的注入状态
        delete injectedTabs[tabId];
    }
    
    // 检查页面类型，更新图标状态
    if (tab.url) {
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-error://') || tab.url.startsWith('edge://')) {
            showAlert('Chrome 内置页面不支持使用此插件');
        } else {
            resetIcon();
        }
    }
});

chrome.action.onClicked.addListener(async (tab) => {
    console.log('Action clicked, initial tab:', tab);
    
    // 重新获取最新的tab状态
    try {
        tab = await chrome.tabs.get(tab.id);
        console.log('Updated tab status:', tab.status);
    } catch (error) {
        console.error('Failed to get tab:', error);
        return;
    }

    // 检查页面类型
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-error://') || tab.url.startsWith('edge://')) {
        showAlert('Chrome 内置页面不支持使用此插件');
        return;
    }

    // 检查页面状态
    if (tab.status !== 'complete') {
        console.log('Page not complete, showing notification');
        showAlert('请等待页面加载完成后再试');
        return;
    }

    // 检查是否已注入脚本（检查版本号，确保代码更新后能重新注入）
    const needsInjection = !injectedTabs[tab.id] || injectedTabs[tab.id] !== CONTENT_SCRIPT_VERSION;
    if (needsInjection) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['scripts/content.js']
            });
            await chrome.scripting.insertCSS({
                target: { tabId: tab.id },
                files: ['styles/sidebar.css']
            });
            injectedTabs[tab.id] = CONTENT_SCRIPT_VERSION;
            resetIcon();
        } catch (error) {
            console.error('Failed to inject script:', error);
            showAlert('插件加载失败，请刷新页面重试');
            return;
        }
    }

    // 发送消息给content script
    try {
        console.log('[Flomo BG] Sending toggleSidebar message to tab', tab.id);
        await chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
        console.log('[Flomo BG] Message sent successfully');
    } catch (error) {
        console.error('[Flomo BG] Failed to send message:', error);
        showAlert('操作失败，请刷新页面重试');
    }
});

// 清理注入状态
chrome.tabs.onRemoved.addListener((tabId) => {
    delete injectedTabs[tabId];
});

