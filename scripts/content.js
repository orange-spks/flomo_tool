// 创建和插入侧边栏
function createSidebar() {
    try {
        // 检查是否已存在侧边栏
        if (document.querySelector('.flomo-sidebar')) {
            return;
        }

        const sidebar = document.createElement('div');
        sidebar.className = 'flomo-sidebar';
        sidebar.style.display = 'none';
        
        // 创建侧边栏内容
        sidebar.innerHTML = `
            <button class="close-btn" id="closeBtn" aria-label="关闭"></button>
            <div class="sidebar-container">
                <div class="input-sections">
                    <div class="input-group">
                        <label>📝 标题</label>
                        <textarea id="title" class="title-input"></textarea>
                    </div>

                    <div class="input-group">
                        <label>🔗 链接</label>
                        <textarea id="link" readonly></textarea>
                    </div>

                    <div class="input-group">
                        <label>📌 原文摘要 <button id="aiSummaryBtn" class="ai-summary-btn">AI总结</button></label>
                        <textarea id="summary" placeholder="请粘贴原文摘要"></textarea>
                    </div>

                    <div class="input-group">
                        <label>💭 个人感想</label>
                        <textarea id="thoughts" placeholder="请输入您的感想"></textarea>
                    </div>
                </div>
                
                <div class="button-section">
                    <button id="submitBtn">提交到 Flomo</button>
                    <div id="message" class="message"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(sidebar);
        initializeSidebar();

        // 添加点击外部关闭功能
        document.addEventListener('click', (event) => {
            const sidebar = document.querySelector('.flomo-sidebar');
            // 如果点击的是侧边栏内部或侧边栏不可见，则不处理
            if (!sidebar || 
                sidebar.style.display === 'none' || 
                sidebar.contains(event.target) || 
                event.target.closest('.flomo-toast')) {
                return;
            }
            toggleSidebar();
        });

        // 添加关闭按钮点击事件
        const closeBtn = document.querySelector('#closeBtn');
        closeBtn.addEventListener('click', (event) => {
            event.stopPropagation();  // 防止触发外部点击事件
            toggleSidebar();
        });

    } catch (error) {
        console.error('Failed to create sidebar:', error);
        showToast('创建侧边栏失败，请刷新页面重试');
    }
}

// 初始化侧边栏功能
function initializeSidebar() {
    const titleInput = document.querySelector('#title');
    const linkInput = document.querySelector('#link');
    const submitBtn = document.querySelector('#submitBtn');
    const aiSummaryBtn = document.querySelector('#aiSummaryBtn');
    const summaryTextarea = document.querySelector('#summary');

    // 设置当前页面标题和链接
    const pageTitle = document.title;
    const pageUrl = window.location.href;
    
    titleInput.value = `《${pageTitle.trim()}》`;
    linkInput.value = pageUrl;

    // 初始化自动调整高度
    initializeAutoResize();

    // AI总结按钮点击事件
    aiSummaryBtn.addEventListener('click', async () => {
        try {
            // 更新按钮状态
            aiSummaryBtn.disabled = true;
            aiSummaryBtn.textContent = '生成中...';
            
            // 调用API生成总结
            const summary = await generateSummary();
            
            // 更新摘要框内容并触发自适应高度
            summaryTextarea.value = summary;
            smoothResizeTextarea(summaryTextarea);
            
            // 显示成功消息
            showMessage('AI总结完成！', 'success');
        } catch (error) {
            showMessage('AI总结失败：' + error.message, 'error');
        } finally {
            // 恢复按钮状态
            aiSummaryBtn.disabled = false;
            aiSummaryBtn.textContent = 'AI总结';
        }
    });

    // 提交按钮点击事件
    submitBtn.addEventListener('click', async () => {
        const title = document.querySelector('#title').value;
        const link = document.querySelector('#link').value;
        const summary = document.querySelector('#summary').value;
        const thoughts = document.querySelector('#thoughts').value;

        // 新的内容格式，使用emoji和更紧凑的布局
        const content = `📝原文：${title}（${link}）\n📌摘要：${summary}\n💭感想：${thoughts}`;

        try {
            const response = await fetch('https://flomoapp.com/iwh/ODcyOTY/8ed3b45bc8b3e51b9d02234f876acf51/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content })
            });

            if (response.ok) {
                showToast('笔记已保存到 Flomo');
                clearInputs();
            } else {
                showToast('保存失败：' + response.statusText);
            }
        } catch (error) {
            showToast('保存失败：' + error.message);
        }
    });
}

// 显示消息
function showMessage(text, type) {
    const messageDiv = document.querySelector('#message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// 显示toast提示
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'flomo-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 清空输入
function clearInputs() {
    document.querySelector('#summary').value = '';
    document.querySelector('#thoughts').value = '';
}

// 检查URL是否有效
function isValidUrl() {
    const url = window.location.href;
    
    // 检查是否是 Flomo 的编辑页面
    if (url.includes('flomoapp.com/mine') || url.includes('flomoapp.com/edit')) {
        showToast('当前页面无法使用此功能');
        return false;
    }
    
    // 检查是否是有效的网页
    if (url === 'about:blank' || 
        url === 'chrome://newtab/' || 
        !url.startsWith('http')) {
        showToast('您未打开任何有效页面哦');
        return false;
    }

    return true;
}

// 切换侧边栏显示状态
function toggleSidebar() {
    try {
        if (!isValidUrl()) {
            return;
        }

        let sidebar = document.querySelector('.flomo-sidebar');
        if (!sidebar) {
            createSidebar();
            sidebar = document.querySelector('.flomo-sidebar');
        }
        
        if (!sidebar) {
            throw new Error('无法创建侧边栏');
        }

        sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
    } catch (error) {
        console.error('Failed to toggle sidebar:', error);
        showToast('操作失败，请刷新页面重试');
    }
}

// 监听插件图标点击
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleSidebar') {
        toggleSidebar();
    }
});

// 确保消息监听器已经设置
console.log('Content script loaded and listening for messages'); 

// 平滑调整文本框高度
function smoothResizeTextarea(textarea) {
    // 保存当前滚动位置
    const scrollPos = window.scrollY;
    
    // 临时设置高度为auto来获取实际内容高度
    textarea.style.height = 'auto';
    const targetHeight = Math.max(36, textarea.scrollHeight); // 最小高度36px
    
    // 使用requestAnimationFrame实现平滑过渡
    requestAnimationFrame(() => {
        textarea.style.transition = 'height 0.2s ease';
        textarea.style.height = targetHeight + 'px';
        
        // 恢复滚动位置
        window.scrollTo(0, scrollPos);
        
        // 过渡完成后清除transition
        setTimeout(() => {
            textarea.style.transition = '';
        }, 200);
    });
}

// 初始化自动调整高度
function initializeAutoResize() {
    const textareas = document.querySelectorAll('textarea');
    
    textareas.forEach(textarea => {
        // 初始调整
        smoothResizeTextarea(textarea);
        
        // 监听输入事件
        textarea.addEventListener('input', () => {
            smoothResizeTextarea(textarea);
        });
        
        // 监听值变化（用于AI生成内容时）
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                    smoothResizeTextarea(textarea);
                }
            });
        });
        
        observer.observe(textarea, { attributes: true });
    });
}

// AI总结相关常量
const DEEPSEEK_API_KEY = 'REDACTED_API_KEY';
const SYSTEM_PROMPT = `你是一个专业的网页内容总结助手，请你对输入的网页内容进行总结，要求：
1. 总结控制在100字以内
2. 保持结构清晰，突出重点
3. 使用客观的语言
4. 根据内容类型采取不同的总结策略：
   - 如果是文章：突出核心观点
   - 如果是教程/指南：突出关键步骤
   - 如果是产品介绍：描述其主要功能和特点
   - 如果是首页/着陆页：简要描述网站/产品的主要用途
5. 去除所有营销和推广相关的内容
请直接输出总结内容，不要添加任何其他解释或说明。`;

// 获取页面主要内容
function getMainContent() {
    // 移除不需要的元素
    const elementsToRemove = [
        'header', 'nav', 'footer', 'aside', 
        '[role="banner"]', '[role="navigation"]', '[role="complementary"]',
        '[class*="menu"]', '[class*="sidebar"]', '[class*="footer"]', '[class*="header"]',
        '[class*="nav"]', '[class*="ad"]', '[class*="social"]'
    ];
    
    // 创建页面副本以避免修改原页面
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = document.body.innerHTML;
    
    // 移除不需要的元素
    elementsToRemove.forEach(selector => {
        const elements = tempDiv.querySelectorAll(selector);
        elements.forEach(el => el.remove());
    });
    
    // 获取主要内容
    const mainContent = document.title + '\n\n' + tempDiv.textContent;
    
    // 清理文本
    return mainContent
        .replace(/\\s+/g, ' ')  // 合并空白字符
        .replace(/\\n\\s*\\n/g, '\\n')  // 移除多余换行
        .trim()
        .slice(0, 4000);  // 限制长度以适应API
}

// 调用DeepSeek API
async function generateSummary() {
    const content = getMainContent();
    
    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT
                    },
                    {
                        "role": "user",
                        "content": content
                    }
                ],
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`API调用失败: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('AI总结失败:', error);
        throw error;
    }
}