// 内容脚本版本号：content.js 更新时需同步 bump，
// 与 content.js 中 window.__flomoContentScriptVersion 保持一致。
// 注入状态不再用内存记录（Service Worker 休眠即丢失），改为点击时 ping 检测。
const CONTENT_SCRIPT_VERSION = '2026-11-04-v2';

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

    // 注入检测：先 ping 页面中的 content script，而不是依赖内存中的 injectedTabs。
    // 原因：MV3 Service Worker 会休眠，内存状态丢失后无法知道哪些标签页已注入，
    // 盲目重复注入会导致顶层 const 重复声明、整脚本 SyntaxError。
    let pong = null;
    let hasListener = false;
    try {
        pong = await chrome.tabs.sendMessage(tab.id, { action: 'flomoPing' });
        hasListener = true; // 有监听器应答（无论新旧版本）
    } catch (e) {
        // "Receiving end does not exist" → 页面中没有 content script，需要注入
    }

    if (hasListener && !pong) {
        // 有消息监听器但不认识 flomoPing → 页面里跑的是旧版 content.js，
        // 再注入新版会与旧版顶层 const 冲突，必须让用户刷新页面
        showAlert('页面中是旧版插件代码，请刷新页面后再使用');
        return;
    }

    if (pong && pong.loaded) {
        if (pong.version !== CONTENT_SCRIPT_VERSION) {
            showAlert('插件已更新，请刷新页面后再使用');
            return;
        }
        // 已注入且版本匹配，无需重复注入
    } else {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['scripts/content.js']
            });
            // 注意：不再向页面注入 styles/sidebar.css。
            // 侧边栏样式由 Shadow DOM 内的 SHADOW_STYLE 提供，toast/浮动工具栏均为内联样式，
            // 页面级注入只会用裸选择器（如 textarea、.close-btn）污染宿主页面样式。
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

// ========== 网络请求中转 ==========
// content script 运行在页面上下文中，其 fetch 会受页面环境干扰：
// 页面 CSP connect-src、页面注册的 Service Worker 拦截、CORS 限制等，
// 都可能导致 content script 的跨域请求直接 "Failed to fetch"（如新浪财经页面）。
// 因此所有跨域请求（AI 总结、Flomo Webhook）统一由 Service Worker 代发：
// 扩展上下文不受页面 CSP/CORS 约束，也不会被页面的 Service Worker 拦截。
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action !== 'proxyFetch') return false;

    (async () => {
        try {
            const response = await fetch(request.url, {
                method: request.method || 'POST',
                headers: request.headers || {},
                body: request.body
            });
            // 响应体读取为文本再回传（消息通道只能传可序列化数据）
            const body = await response.text();
            sendResponse({
                ok: response.ok,
                status: response.status,
                statusText: response.statusText,
                body
            });
        } catch (error) {
            // 网络层错误（DNS 解析失败、连接被拒、超时等）
            sendResponse({ ok: false, networkError: error.message || '网络请求失败' });
        }
    })();

    return true; // 异步 sendResponse 必须返回 true，否则通道会提前关闭
});

