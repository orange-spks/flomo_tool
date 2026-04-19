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

// ---------- 辅助阅读（已注释停用） ----------
// 原逻辑：在 background 中请求 AI 接口，避免 content 跨域；含分片、多模型、并发、流式传输等
// 恢复时取消下方块注释即可
/*
const HELP_READ_ARTICLE_MARKER = '### 待处理文章内容：';
const HELP_READ_MAX_CHARS = 2000;
const HELP_READ_PARAGRAPHS_PER_CHUNK = 4;
const HELP_READ_FALLBACK_SEGMENT_LEN = 500;

function splitArticleIntoChunks(articleText) {
    const byDoubleNewline = articleText.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
    let segments;
    if (byDoubleNewline.length > 1) {
        segments = byDoubleNewline;
    } else {
        segments = [];
        for (let i = 0; i < articleText.length; i += HELP_READ_FALLBACK_SEGMENT_LEN) {
            segments.push(articleText.slice(i, i + HELP_READ_FALLBACK_SEGMENT_LEN));
        }
    }
    if (segments.length <= 1) return [articleText];
    const chunks = [];
    let current = [];
    let currentLen = 0;
    for (const seg of segments) {
        const addLen = currentLen + (current.length ? 2 : 0) + seg.length;
        if (current.length > 0 && addLen > HELP_READ_MAX_CHARS) {
            chunks.push(current.join('\n\n'));
            current = [seg];
            currentLen = seg.length;
        } else {
            current.push(seg);
            currentLen = addLen;
        }
    }
    if (current.length) chunks.push(current.join('\n\n'));
    return chunks;
}

function parseHelpReadRaw(raw) {
    let s = raw.replace(/^[\s\S]*?```(?:json)?\s*(?:)/, '').replace(/\s*```[\s\S]*$/, '').trim();
    s = s.replace(/,(\s*[}\]])/g, '$1');
    const tryParse = (str) => {
        try {
            return JSON.parse(str);
        } catch (e) {
            return null;
        }
    };
    let parsed = tryParse(s);
    if (parsed) return parsed;
    s = s.replace(/([\s,{])([a-zA-Z_][a-zA-Z0-9_]*)(\s*):/g, '$1"$2"$3:');
    parsed = tryParse(s);
    if (parsed) return parsed;
    const match = s.match(/\{\s*"article_analysis"\s*:\s*\[[\s\S]*\](?=\s*\})/);
    if (match) {
        parsed = tryParse(match[0] + ' }');
        if (parsed) return parsed;
    }
    throw new Error('JSON 解析失败');
}

const HELP_READ_PROVIDERS = {
    ark: {
        url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
        model: 'ep-20260201233119-8vf6f',
        storageKey: 'ARK_API_KEY',
    },
    deepseek: {
        url: 'https://api.deepseek.com/chat/completions',
        model: 'deepseek-chat',
        storageKey: 'DEEPSEEK_API_KEY',
    },
    zhipu: {
        url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        model: 'glm-4-flash',
        storageKey: 'ZHIPU_API_KEY',
    },
};

const DEFAULT_HELP_READ_PROVIDER = 'deepseek';
const HELP_READ_CONCURRENCY = 3;
const HELP_READ_TIMEOUT = 30000;
const HELP_READ_MAX_RETRIES = 2;
const HELP_READ_RETRY_DELAY = 1000;

function getHelpReadRequestOptions(providerId, systemContent, userContent) {
    const p = HELP_READ_PROVIDERS[providerId] || HELP_READ_PROVIDERS.ark;
    const messages = [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent },
    ];
    const body = {
        model: p.model,
        messages,
        stream: false,
        max_tokens: 4096,
    };
    return { url: p.url, body };
}

async function fetchWithTimeout(url, options, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('请求超时');
        }
        throw error;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function callHelpReadAPIWithRetry(systemContent, userContent, apiKey, providerId = DEFAULT_HELP_READ_PROVIDER, retryCount = 0) {
    try {
        const { url, body } = getHelpReadRequestOptions(providerId, systemContent, userContent);
        const apiRes = await fetchWithTimeout(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
        }, HELP_READ_TIMEOUT);

        if (!apiRes.ok) throw new Error(`API 调用失败: ${apiRes.status}`);
        const data = await apiRes.json();
        const raw = data.choices?.[0]?.message?.content ?? '';
        const parsed = parseHelpReadRaw(raw);
        if (!Array.isArray(parsed.article_analysis)) throw new Error('返回格式无效：缺少 article_analysis 数组');
        parsed.article_analysis.forEach((p) => {
            if (typeof p.paragraph_summary !== 'string' || !Array.isArray(p.sentences)) {
                throw new Error('返回格式无效：段落需含 paragraph_summary 与 sentences');
            }
        });
        return parsed.article_analysis;
    } catch (error) {
        if (retryCount < HELP_READ_MAX_RETRIES && (
            error.message.includes('超时') ||
            error.message.includes('失败') ||
            error.message.includes('network')
        )) {
            await delay(HELP_READ_RETRY_DELAY * (retryCount + 1));
            return callHelpReadAPIWithRetry(systemContent, userContent, apiKey, providerId, retryCount + 1);
        }
        throw error;
    }
}

async function callHelpReadAPI(systemContent, userContent, apiKey, providerId = DEFAULT_HELP_READ_PROVIDER) {
    return callHelpReadAPIWithRetry(systemContent, userContent, apiKey, providerId);
}

class ConcurrencyLimiter {
    constructor(maxConcurrency) {
        this.maxConcurrency = maxConcurrency;
        this.running = 0;
        this.queue = [];
    }

    async acquire() {
        if (this.running < this.maxConcurrency) {
            this.running++;
            return;
        }
        return new Promise(resolve => this.queue.push(resolve));
    }

    release() {
        this.running--;
        if (this.queue.length > 0) {
            const next = this.queue.shift();
            this.running++;
            next();
        }
    }
}

async function callHelpReadAPIWithLimit(limiter, systemContent, userContent, apiKey, providerId) {
    await limiter.acquire();
    try {
        return await callHelpReadAPIWithRetry(systemContent, userContent, apiKey, providerId);
    } finally {
        limiter.release();
    }
}

function mergeArticleAnalysis(arrays) {
    const merged = [];
    let paragraphId = 1;
    arrays.forEach((arr) => {
        arr.forEach((block) => {
            merged.push({
                ...block,
                paragraph_id: paragraphId++
            });
        });
    });
    return merged;
}

async function sendProgressToContentScript(tabId, progress, partialResults = null, error = null, chunkIndex = null) {
    try {
        await chrome.tabs.sendMessage(tabId, {
            action: 'helpReadProgress',
            progress,
            partialResults,
            error,
            chunkIndex
        });
    } catch (e) {
        console.log('发送进度消息失败:', e.message);
    }
}

async function processHelpReadAnalysis(request, sender, sendResponse) {
    const { articleText, apiKey: requestApiKey, streamResults = false } = request;
    const tabId = sender?.tab?.id;

    try {
        const url = chrome.runtime.getURL('prompt_help_read.txt');
        const res = await fetch(url);
        if (!res.ok) throw new Error('加载辅助阅读提示词失败');
        const template = await res.text();
        const idx = template.indexOf(HELP_READ_ARTICLE_MARKER);
        const systemContent = idx >= 0 ? template.slice(0, idx).trim() : template;

        const stored = await chrome.storage.local.get([
            'HELP_READ_PROVIDER',
            'ARK_API_KEY',
            'DEEPSEEK_API_KEY',
            'ZHIPU_API_KEY',
        ]);
        const providerId = stored.HELP_READ_PROVIDER || DEFAULT_HELP_READ_PROVIDER;
        const provider = HELP_READ_PROVIDERS[providerId] || HELP_READ_PROVIDERS.ark;
        const apiKey = requestApiKey || stored[provider.storageKey];
        if (!apiKey) {
            const hint = `请设置当前模型的 API Key：chrome.storage.local.set({ ${provider.storageKey}: "你的key" })；或切换模型：chrome.storage.local.set({ HELP_READ_PROVIDER: "ark" | "deepseek" | "zhipu" })`;
            throw new Error('未配置 API Key。' + hint);
        }

        let articleAnalysis;
        if (articleText.length <= HELP_READ_MAX_CHARS) {
            const userContent = HELP_READ_ARTICLE_MARKER + '\n' + articleText;
            articleAnalysis = await callHelpReadAPIWithRetry(systemContent, userContent, apiKey, providerId);
        } else {
            const chunks = splitArticleIntoChunks(articleText);
            const totalChunks = chunks.length;

            if (streamResults && tabId) {
                await sendProgressToContentScript(tabId, {
                    total: totalChunks,
                    completed: 0,
                    percentage: 0,
                    status: 'processing'
                });

                const limiter = new ConcurrencyLimiter(HELP_READ_CONCURRENCY);
                const results = new Array(totalChunks);
                const completedChunks = new Set();

                const chunkPromises = chunks.map(async (chunk, index) => {
                    const userContent = HELP_READ_ARTICLE_MARKER + '\n' + chunk;
                    const result = await callHelpReadAPIWithLimit(limiter, systemContent, userContent, apiKey, providerId);
                    results[index] = result;
                    completedChunks.add(index);

                    await sendProgressToContentScript(tabId, {
                        total: totalChunks,
                        completed: completedChunks.size,
                        percentage: Math.round((completedChunks.size / totalChunks) * 100),
                        status: 'processing'
                    }, result, null, index);

                    return result;
                });

                await Promise.all(chunkPromises);

                articleAnalysis = mergeArticleAnalysis(results);

                await sendProgressToContentScript(tabId, {
                    total: totalChunks,
                    completed: totalChunks,
                    percentage: 100,
                    status: 'completed'
                }, articleAnalysis, null, null);
            } else {
                const limiter = new ConcurrencyLimiter(HELP_READ_CONCURRENCY);
                const promises = chunks.map(chunk => {
                    const userContent = HELP_READ_ARTICLE_MARKER + '\n' + chunk;
                    return callHelpReadAPIWithLimit(limiter, systemContent, userContent, apiKey, providerId);
                });
                const results = await Promise.all(promises);
                articleAnalysis = mergeArticleAnalysis(results);
            }
        }
        sendResponse({ articleAnalysis });
    } catch (e) {
        if (streamResults && tabId) {
            await sendProgressToContentScript(tabId, { status: 'error' }, null, e.message || String(e));
        }
        sendResponse({ error: e.message || String(e) });
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action !== 'fetchHelpReadAnalysis') return false;
    processHelpReadAnalysis(request, sender, sendResponse);
    return true;
});
*/