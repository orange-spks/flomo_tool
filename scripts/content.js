const FLOMO_WEBHOOK_STORAGE_KEY = 'FLOMO_WEBHOOK_URL';

// Shadow DOM 样式 - 完全隔离
const SHADOW_STYLE = `
    :host {
        all: initial !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
    }
    
    * {
        box-sizing: border-box !important;
    }
    
    .flomo-sidebar {
        position: fixed !important;
        top: 0 !important;
        right: 0 !important;
        width: 400px !important;
        height: 100vh !important;
        height: 100dvh !important;
        background: white !important;
        box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
        z-index: 2147483647 !important;
        padding: 28px !important;
        display: flex !important;
        flex-direction: column !important;
        font-size: 13px !important;
        line-height: 1.5 !important;
        color: #333 !important;
        overflow: hidden !important;
        pointer-events: auto !important;
    }

    .close-btn {
        position: absolute !important;
        top: 16px !important;
        right: 16px !important;
        width: 32px !important;
        height: 32px !important;
        border: none !important;
        background: rgba(0,0,0,0.05) !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        opacity: 0.6 !important;
        transition: opacity 0.2s ease, background 0.2s ease !important;
        z-index: 10000 !important;
        pointer-events: auto !important;
    }

    .close-btn:hover {
        opacity: 1 !important;
    }

    .close-btn::before,
    .close-btn::after {
        content: '' !important;
        position: absolute !important;
        width: 16px !important;
        height: 2px !important;
        background-color: #333 !important;
        border-radius: 1px !important;
    }

    .close-btn::before {
        transform: rotate(45deg) !important;
    }

    .close-btn::after {
        transform: rotate(-45deg) !important;
    }

    .sidebar-container {
        display: flex !important;
        flex-direction: column !important;
        height: 100% !important;
        overflow: hidden !important;
    }

    .input-sections {
        flex: 1 !important;
        overflow-y: auto !important;
        padding-right: 4px !important;
        margin-right: -4px !important;
    }

    .input-sections::-webkit-scrollbar {
        width: 4px !important;
    }

    .input-sections::-webkit-scrollbar-track {
        background: #f5f5f5 !important;
        border-radius: 2px !important;
    }

    .input-sections::-webkit-scrollbar-thumb {
        background: #ddd !important;
        border-radius: 2px !important;
    }

    .input-group {
        margin-bottom: 20px !important;
    }

    .input-group label {
        display: block !important;
        margin-bottom: 8px !important;
        font-weight: 600 !important;
        color: #333 !important;
        font-size: 13px !important;
    }

    textarea, .rich-editor {
        width: 100% !important;
        padding: 8px 12px !important;
        border: 1px solid #ddd !important;
        border-radius: 6px !important;
        min-height: 36px !important;
        font-size: 13px !important;
        line-height: 1.6 !important;
        transition: all 0.2s ease !important;
        background: white !important;
        outline: none !important;
        font-family: inherit !important;
        resize: none !important;
    }

    textarea:focus, .rich-editor:focus {
        border-color: rgb(48, 207, 121) !important;
        box-shadow: 0 0 0 2px rgba(48, 207, 121, 0.1) !important;
    }

    #link {
        background-color: #f0f0f0 !important;
        color: #999 !important;
        cursor: not-allowed !important;
        user-select: text !important;
        border-color: #e8e8e8 !important;
        font-size: 12px !important;
    }

    .title-input {
        font-weight: 500 !important;
    }

    .rich-editor {
        min-height: 80px !important;
        max-height: 300px !important;
        overflow-y: auto !important;
        height: auto !important;
    }

    .rich-editor:empty::before {
        content: attr(placeholder) !important;
        color: #999 !important;
        pointer-events: none !important;
    }

    .rich-editor b, .rich-editor strong {
        font-weight: 600 !important;
    }

    .rich-editor u {
        text-decoration: underline !important;
    }

    .rich-editor mark {
        background-color: #ffeb3b !important;
        padding: 2px 0 !important;
    }

    .rich-editor ul, .rich-editor ol {
        margin: 8px 0 !important;
        padding-left: 24px !important;
    }

    .rich-editor ul {
        list-style-type: disc !important;
    }

    .rich-editor ol {
        list-style-type: decimal !important;
    }

    .rich-editor li {
        margin: 4px 0 !important;
    }

    .rich-editor img {
        max-width: 100% !important;
        border-radius: 4px !important;
        margin: 8px 0 !important;
        display: block !important;
    }

    .editor-toolbar {
        display: flex !important;
        gap: 4px !important;
        margin-top: 6px !important;
        padding: 4px 6px !important;
        background: #f8f8f8 !important;
        border-radius: 4px !important;
        border: 1px solid #eee !important;
    }

    .toolbar-btn {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 28px !important;
        height: 28px !important;
        border: none !important;
        background: transparent !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        font-size: 13px !important;
        color: #666 !important;
        transition: all 0.2s ease !important;
        font-weight: 500 !important;
        font-family: inherit !important;
        padding: 0 !important;
    }

    .toolbar-btn:hover {
        background: #e8e8e8 !important;
        color: #333 !important;
    }

    .toolbar-btn.active {
        background: rgb(48, 207, 121) !important;
        color: white !important;
    }

    .toolbar-btn[data-command="bold"] {
        font-weight: 700 !important;
        font-size: 14px !important;
    }

    .toolbar-btn[data-command="underline"] {
        text-decoration: underline !important;
    }

    .toolbar-btn.upload-btn {
        font-size: 16px !important;
        font-weight: 600 !important;
        margin-left: auto !important;
        color: rgb(48, 207, 121) !important;
    }

    .toolbar-btn.upload-btn:hover {
        background: rgba(48, 207, 121, 0.1) !important;
    }

    .ai-summary-btn {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        margin-left: 8px !important;
        padding: 4px 8px !important;
        font-size: 12px !important;
        color: #fff !important;
        background-color: rgb(48, 207, 121) !important;
        border: none !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        font-family: inherit !important;
    }

    .ai-summary-btn:hover {
        background-color: rgb(39, 179, 104) !important;
    }

    .ai-summary-btn:disabled {
        background-color: #ccc !important;
        cursor: not-allowed !important;
    }

    .button-section {
        position: sticky !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        background: white !important;
        padding: 16px 0 !important;
        margin-top: 16px !important;
        border-top: 1px solid #eee !important;
        z-index: 100 !important;
        flex-shrink: 0 !important;
    }

    #submitBtn {
        display: block !important;
        width: 100% !important;
        padding: 12px !important;
        background-color: rgb(48, 207, 121) !important;
        color: white !important;
        border: none !important;
        border-radius: 6px !important;
        cursor: pointer !important;
        font-weight: 500 !important;
        font-size: 14px !important;
        transition: background-color 0.2s ease !important;
        font-family: inherit !important;
    }

    #submitBtn:hover {
        background-color: rgb(39, 179, 104) !important;
    }

    .message {
        margin-top: 16px !important;
        padding: 12px !important;
        border-radius: 6px !important;
        display: none !important;
        font-size: 13px !important;
    }

    .message.success {
        background-color: rgba(48, 207, 121, 0.1) !important;
        color: rgb(48, 207, 121) !important;
        display: block !important;
    }

    .message.error {
        background-color: #fff2f0 !important;
        color: #ff4d4f !important;
        display: block !important;
    }

    .flomo-settings {
        margin-top: 12px !important;
        padding-top: 12px !important;
        border-top: 1px solid #eee !important;
    }

    .settings-toggle {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        width: 100% !important;
        padding: 8px 12px !important;
        font-size: 13px !important;
        color: #666 !important;
        background: #f5f5f5 !important;
        border: 1px solid #e8e8e8 !important;
        border-radius: 6px !important;
        cursor: pointer !important;
        text-align: left !important;
        transition: background 0.2s ease !important;
        font-family: inherit !important;
    }

    .settings-toggle:hover {
        background: #eee !important;
    }

    .settings-arrow {
        transition: transform 0.2s ease !important;
        font-size: 12px !important;
        color: #999 !important;
    }

    .settings-toggle[aria-expanded="true"] .settings-arrow {
        transform: rotate(180deg) !important;
    }

    .settings-panel {
        margin-top: 12px !important;
    }

    .settings-hint {
        font-size: 11px !important;
        color: #999 !important;
        margin-bottom: 12px !important;
        line-height: 1.5 !important;
        background: #fafafa !important;
        padding: 8px 10px !important;
        border-radius: 4px !important;
        border: 1px solid #f0f0f0 !important;
    }

    .settings-panel label {
        display: block !important;
        margin-bottom: 6px !important;
        font-size: 12px !important;
        color: #666 !important;
        font-weight: normal !important;
    }

    .settings-panel input[type="url"] {
        width: 100% !important;
        padding: 8px 12px !important;
        border: 1px solid #ddd !important;
        border-radius: 6px !important;
        font-size: 13px !important;
        margin-bottom: 8px !important;
        font-family: inherit !important;
        outline: none !important;
    }

    .settings-panel input[type="url"]:focus {
        border-color: rgb(48, 207, 121) !important;
    }

    .save-webhook-btn {
        padding: 6px 14px !important;
        font-size: 12px !important;
        color: #fff !important;
        background-color: rgb(48, 207, 121) !important;
        border: none !important;
        border-radius: 6px !important;
        cursor: pointer !important;
        font-family: inherit !important;
    }

    .save-webhook-btn:hover {
        background-color: rgb(39, 179, 104) !important;
    }

    .rich-editor::-webkit-scrollbar {
        width: 6px !important;
    }

    .rich-editor::-webkit-scrollbar-track {
        background: #f5f5f5 !important;
        border-radius: 3px !important;
    }

    .rich-editor::-webkit-scrollbar-thumb {
        background: #ddd !important;
        border-radius: 3px !important;
    }

    .rich-editor::-webkit-scrollbar-thumb:hover {
        background: #ccc !important;
    }

    // 图片预览区域样式
    .image-preview {
        display: none !important;
        flex-wrap: wrap !important;
        gap: 8px !important;
        margin-top: 6px !important;
        padding: 6px !important;
        background: #f8f8f8 !important;
        border-radius: 4px !important;
        border: 1px solid #eee !important;
        min-height: 0 !important;
    }

    .image-thumb {
        position: relative !important;
        width: 60px !important;
        height: 60px !important;
        border-radius: 4px !important;
        overflow: hidden !important;
        border: 1px solid #ddd !important;
        flex-shrink: 0 !important;
    }

    .image-thumb img {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        display: block !important;
    }

    .image-thumb .remove-image {
        position: absolute !important;
        top: 2px !important;
        right: 2px !important;
        width: 18px !important;
        height: 18px !important;
        border: none !important;
        background: rgba(255, 59, 48, 0.9) !important;
        color: white !important;
        border-radius: 50% !important;
        cursor: pointer !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 0 !important;
        line-height: 1 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        transition: transform 0.2s ease !important;
    }

    .image-thumb .remove-image:hover {
        transform: scale(1.1) !important;
        background: rgba(255, 59, 48, 1) !important;
    }
`;

// 创建和插入侧边栏
function createSidebar() {
    console.log('[Flomo] createSidebar called');
    try {
        // 检查是否已存在侧边栏宿主
        if (document.querySelector('#flomo-sidebar-host')) {
            console.log('[Flomo] Sidebar already exists, skipping creation');
            return;
        }

        // 创建 Shadow DOM 宿主元素
        const host = document.createElement('div');
        host.id = 'flomo-sidebar-host';
        host.style.cssText = `
            all: initial !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 2147483647 !important;
            pointer-events: none !important;
        `;

        // 附加 Shadow DOM
        const shadow = host.attachShadow({ mode: 'open' });

        // 创建样式元素
        const styleEl = document.createElement('style');
        styleEl.textContent = SHADOW_STYLE;
        shadow.appendChild(styleEl);

        // 创建侧边栏容器
        const sidebar = document.createElement('div');
        sidebar.className = 'flomo-sidebar';
        sidebar.style.display = 'none';
        sidebar.style.pointerEvents = 'auto';
        
        // 创建侧边栏内容
        sidebar.innerHTML = `
            <button type="button" class="close-btn" id="closeBtn" aria-label="关闭"></button>
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
                        <div id="summary" class="rich-editor" contenteditable="true" placeholder="请粘贴原文摘要"></div>
                        <div class="image-preview" id="summary-images"></div>
                        <div class="editor-toolbar" data-target="summary">
                            <button type="button" class="toolbar-btn" data-command="bold" title="加粗 (Ctrl+B)">B</button>
                            <button type="button" class="toolbar-btn" data-command="underline" title="下划线 (Ctrl+U)">U</button>
                            <button type="button" class="toolbar-btn" data-command="hiliteColor" data-value="#ffeb3b" title="高亮">🖍</button>
                            <button type="button" class="toolbar-btn" data-command="insertUnorderedList" title="无序列表">☰</button>
                            <button type="button" class="toolbar-btn" data-command="insertOrderedList" title="有序列表">1.</button>
                            <button type="button" class="toolbar-btn upload-btn" data-target="summary" title="上传图片">+</button>
                        </div>
                    </div>

                    <div class="input-group">
                        <label>💭 个人感想</label>
                        <div id="thoughts" class="rich-editor" contenteditable="true" placeholder="请输入您的感想"></div>
                        <div class="image-preview" id="thoughts-images"></div>
                        <div class="editor-toolbar" data-target="thoughts">
                            <button type="button" class="toolbar-btn" data-command="bold" title="加粗 (Ctrl+B)">B</button>
                            <button type="button" class="toolbar-btn" data-command="underline" title="下划线 (Ctrl+U)">U</button>
                            <button type="button" class="toolbar-btn" data-command="hiliteColor" data-value="#ffeb3b" title="高亮">🖍</button>
                            <button type="button" class="toolbar-btn" data-command="insertUnorderedList" title="无序列表">☰</button>
                            <button type="button" class="toolbar-btn" data-command="insertOrderedList" title="有序列表">1.</button>
                            <button type="button" class="toolbar-btn upload-btn" data-target="thoughts" title="上传图片">+</button>
                        </div>
                    </div>

                    <div class="input-group flomo-settings">
                        <button type="button" id="settingsToggle" class="settings-toggle" aria-expanded="false"><span>⚙️ 设置</span><span class="settings-arrow">▼</span></button>
                        <div id="settingsPanel" class="settings-panel" hidden>
                            <p class="settings-hint">配置保存在浏览器本地，扩展不会自动读取项目目录下的 .env 文件。</p>
                            <label>DeepSeek API Key（用于 AI 总结功能）</label>
                            <input type="password" id="deepseekApiKey" placeholder="sk-xxxxxxxxxxxxxxxx" autocomplete="off" />
                            <button type="button" id="saveApiKeyBtn" class="save-webhook-btn" style="margin-bottom: 16px;">保存 API Key</button>

                            <label style="border-top: 1px solid #eee; padding-top: 16px; display: block;">Flomo Webhook 地址</label>
                            <input type="url" id="flomoWebhookUrl" placeholder="https://flomoapp.com/iwh/xxx/xxx/" autocomplete="off" />
                            <button type="button" id="saveWebhookBtn" class="save-webhook-btn">保存 Webhook</button>
                        </div>
                    </div>
                </div>
                
                <div class="button-section">
                    <button id="submitBtn">提交到 Flomo</button>
                    <div id="message" class="message"></div>
                </div>
            </div>
        `;
        
        shadow.appendChild(sidebar);
        document.body.appendChild(host);
        
        // 保存引用以便后续使用
        window.flomoSidebarHost = host;
        window.flomoSidebarShadow = shadow;
        
        initializeSidebar();

        // 添加点击外部关闭功能（使用命名函数以便移除）
        // 先移除可能存在的旧监听器，防止重复绑定
        if (window.flomoClickOutsideHandler) {
            document.removeEventListener('click', window.flomoClickOutsideHandler);
        }

        window.flomoClickOutsideHandler = (event) => {
            const sidebar = getSidebar();
            // 如果点击的是侧边栏内部或侧边栏不可见，则不处理
            if (!sidebar ||
                sidebar.style.display === 'none' ||
                event.target.closest('#flomo-sidebar-host') ||
                event.target.closest('.flomo-toast')) {
                return;
            }
            toggleSidebar();
        };
        document.addEventListener('click', window.flomoClickOutsideHandler);

        // 添加关闭按钮点击事件 - 直接使用 shadow.querySelector 确保能获取到元素
        const closeBtn = shadow.querySelector('#closeBtn');
        if (closeBtn) {
            // 确保按钮可点击：强制设置样式
            closeBtn.style.setProperty('pointer-events', 'auto', 'important');
            closeBtn.style.setProperty('cursor', 'pointer', 'important');

            // 移除可能存在的旧监听器，防止重复绑定
            if (closeBtn._clickHandler) {
                closeBtn.removeEventListener('click', closeBtn._clickHandler);
            }

            // 创建新的处理器并保存引用
            closeBtn._clickHandler = (event) => {
                event.stopPropagation();
                event.preventDefault();

                // 直接操作 DOM 关闭侧边栏
                const sidebarEl = shadow.querySelector('.flomo-sidebar');
                if (sidebarEl) {
                    sidebarEl.style.setProperty('display', 'none', 'important');
                }

                // 同步更新宿主 pointer-events 为 none，让页面可交互
                if (host) {
                    host.style.setProperty('pointer-events', 'none', 'important');
                }

                return false;
            };

            closeBtn.addEventListener('click', closeBtn._clickHandler);
        }

        // 阻止侧边栏内的滚轮事件冒泡到页面
        setupScrollIsolation(shadow);

    } catch (error) {
        console.error('Failed to create sidebar:', error);
        showMessage('创建侧边栏失败，请刷新页面重试', 'error');
    }
}

// 从 Shadow DOM 获取元素
function getShadowElement(selector) {
    const host = document.querySelector('#flomo-sidebar-host');
    if (!host || !host.shadowRoot) return null;
    return host.shadowRoot.querySelector(selector);
}

// 设置滚轮事件隔离 - 阻止侧边栏内的滚动冒泡到页面
function setupScrollIsolation(shadow) {
    // 获取可滚动的容器
    const inputSections = shadow.querySelector('.input-sections');
    const richEditors = shadow.querySelectorAll('.rich-editor');

    // 阻止滚轮事件冒泡的函数
    const preventWheelPropagation = (e) => {
        const element = e.currentTarget;
        const isAtTop = element.scrollTop === 0;
        const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 1;

        // 如果向上滚动但已在顶部，或向下滚动但已在底部，才阻止默认行为
        // 这样可以确保侧边栏内部仍能正常滚动
        if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
            e.preventDefault();
        }

        // 始终阻止事件冒泡到页面
        e.stopPropagation();
    };

    // 为主滚动容器添加监听
    if (inputSections) {
        inputSections.addEventListener('wheel', preventWheelPropagation, { passive: false });
        inputSections.addEventListener('touchmove', (e) => e.stopPropagation(), { passive: true });
    }

    // 为每个富文本编辑器添加监听
    richEditors.forEach(editor => {
        editor.addEventListener('wheel', (e) => {
            const isAtTop = editor.scrollTop === 0;
            const isAtBottom = editor.scrollHeight - editor.scrollTop <= editor.clientHeight + 1;

            // 如果编辑器可以滚动，阻止事件冒泡
            if (!(e.deltaY < 0 && isAtTop) && !(e.deltaY > 0 && isAtBottom)) {
                e.stopPropagation();
            }
        }, { passive: true });
    });

    // 为整个侧边栏添加滚轮监听，确保任何位置的滚轮都不会冒泡到页面
    const sidebar = shadow.querySelector('.flomo-sidebar');
    if (sidebar) {
        sidebar.addEventListener('wheel', (e) => {
            // 找到实际滚动的目标元素
            let target = e.target;
            let isScrollableTarget = false;

            // 检查目标元素或其父元素是否是可滚动区域
            while (target && target !== sidebar) {
                const isScrollable = target.scrollHeight > target.clientHeight;
                const style = getComputedStyle(target);
                const overflowY = style.overflowY;

                if (isScrollable && (overflowY === 'auto' || overflowY === 'scroll')) {
                    isScrollableTarget = true;
                    break;
                }
                target = target.parentElement;
            }

            // 如果点击的不是可滚动区域，或者可滚动区域已经滚动到边界
            if (!isScrollableTarget) {
                e.preventDefault();
            }

            e.stopPropagation();
        }, { passive: false });
    }
}

// 初始化侧边栏功能
function initializeSidebar() {
    const titleInput = getShadowElement('#title');
    const linkInput = getShadowElement('#link');
    const submitBtn = getShadowElement('#submitBtn');
    const aiSummaryBtn = getShadowElement('#aiSummaryBtn');
    const summaryTextarea = getShadowElement('#summary');

    // 设置当前页面标题和链接
    const pageTitle = document.title;
    const pageUrl = window.location.href;
    
    titleInput.value = `《${pageTitle.trim()}》`;
    linkInput.value = pageUrl;

    // 从本地存储加载配置
    chrome.storage.local.get([FLOMO_WEBHOOK_STORAGE_KEY, DEEPSEEK_API_KEY_STORAGE_KEY], (result) => {
        const webhookInput = getShadowElement('#flomoWebhookUrl');
        const apiKeyInput = getShadowElement('#deepseekApiKey');
        if (webhookInput) webhookInput.value = result[FLOMO_WEBHOOK_STORAGE_KEY] || '';
        if (apiKeyInput) apiKeyInput.value = result[DEEPSEEK_API_KEY_STORAGE_KEY] || '';
    });
    const settingsToggle = getShadowElement('#settingsToggle');
    const settingsPanel = getShadowElement('#settingsPanel');
    if (settingsToggle && settingsPanel) {
        settingsToggle.addEventListener('click', () => {
            const expanded = settingsPanel.hidden;
            settingsPanel.hidden = !expanded;
            settingsToggle.setAttribute('aria-expanded', String(!expanded));
            // 箭头方向由 CSS 根据 aria-expanded 属性自动旋转，无需额外操作
        });
    }
    // 保存 Webhook 按钮
    const saveWebhookBtn = getShadowElement('#saveWebhookBtn');
    const webhookInput = getShadowElement('#flomoWebhookUrl');
    if (saveWebhookBtn && webhookInput) {
        saveWebhookBtn.addEventListener('click', () => {
            const url = webhookInput.value.trim();
            if (!url) {
                // 输入框为空时清除 storage 中的配置，允许用户删除已保存的 Webhook
                chrome.storage.local.remove([FLOMO_WEBHOOK_STORAGE_KEY], () => {
                    showMessage('Webhook 地址已清除', 'success');
                });
                return;
            }
            if (!url.startsWith('https://flomoapp.com/iwh/')) {
                showMessage('请填写 Flomo 的 incoming webhook 地址（以 https://flomoapp.com/iwh/ 开头）', 'error');
                return;
            }
            chrome.storage.local.set({ [FLOMO_WEBHOOK_STORAGE_KEY]: url }, () => {
                showMessage('Webhook 地址已保存', 'success');
            });
        });
    }

    // 保存 API Key 按钮
    const saveApiKeyBtn = getShadowElement('#saveApiKeyBtn');
    const apiKeyInput = getShadowElement('#deepseekApiKey');
    if (saveApiKeyBtn && apiKeyInput) {
        saveApiKeyBtn.addEventListener('click', () => {
            const apiKey = apiKeyInput.value.trim();
            if (!apiKey) {
                // 输入框为空时清除 storage 中的配置
                chrome.storage.local.remove([DEEPSEEK_API_KEY_STORAGE_KEY], () => {
                    showMessage('API Key 已清除', 'success');
                });
                return;
            }
            if (!apiKey.startsWith('sk-')) {
                showMessage('API Key 格式不正确，应以 sk- 开头', 'error');
                return;
            }
            chrome.storage.local.set({ [DEEPSEEK_API_KEY_STORAGE_KEY]: apiKey }, () => {
                showMessage('API Key 已保存', 'success');
            });
        });
    }

    // 初始化自动调整高度
    initializeAutoResize();

    // 初始化富文本编辑器
    initializeRichEditors();

    // AI总结按钮点击事件
    aiSummaryBtn.addEventListener('click', async () => {
        try {
            // 更新按钮状态
            aiSummaryBtn.disabled = true;
            aiSummaryBtn.textContent = '生成中...';

            // 调用API生成总结
            const summary = await generateSummary();

            // 更新摘要框内容并触发自适应高度
            // 将纯文本转换为简单的 HTML 段落
            summaryTextarea.innerHTML = summary.split('\n').filter(p => p.trim()).map(p => `<div>${p}</div>`).join('');
            autoResizeEditor(summaryTextarea);

            // 显示成功消息
            showMessage('AI总结完成！', 'success');
        } catch (error) {
            showMessage('AI总结失败：' + error.message, 'error');

            // 如果是 API Key 未配置，自动打开设置面板
            if (error.message.includes('请先设置 DeepSeek API Key')) {
                const panel = getShadowElement('#settingsPanel');
                const toggle = getShadowElement('#settingsToggle');
                if (panel && toggle) {
                    panel.hidden = false;
                    toggle.setAttribute('aria-expanded', 'true');
                    // 聚焦到 API Key 输入框
                    const apiKeyInput = getShadowElement('#deepseekApiKey');
                    if (apiKeyInput) {
                        setTimeout(() => apiKeyInput.focus(), 100);
                    }
                }
            }
        } finally {
            // 恢复按钮状态
            aiSummaryBtn.disabled = false;
            aiSummaryBtn.textContent = 'AI总结';
        }
    });

    // 辅助阅读按钮（已注释停用）
    // const helpReadBtn = document.querySelector('#helpReadBtn');
    // if (helpReadBtn) {
    //     updateHelpReadButtonLabel(helpReadBtn);
    //     helpReadBtn.addEventListener('click', async () => {
    //         if (helpReadState.isActive) {
    //             restoreHelpRead();
    //             updateHelpReadButtonLabel(helpReadBtn);
    //             removeHelpReadProgress();
    //             showToast('已取消辅助阅读');
    //             return;
    //         }
    //         try {
    //             helpReadBtn.disabled = true;
    //             helpReadBtn.textContent = '分析中...';
    //             const articleText = getHelpReadArticleText();
    //             if (!articleText || articleText.length < 10) {
    //                 showMessage('页面正文过短，无法进行辅助阅读', 'error');
    //                 return;
    //             }
    //             const needsStreaming = articleText.length > HELP_READ_MAX_CHARS;
    //             if (needsStreaming) {
    //                 const chunks = splitArticleIntoChunks(articleText);
    //                 createHelpReadProgress();
    //                 createStreamingResultContainer(chunks.length);
    //                 const articleAnalysis = await fetchHelpReadAnalysis(articleText, true);
    //                 updateHelpReadButtonLabel(helpReadBtn);
    //                 showToast('辅助阅读已开启');
    //             } else {
    //                 const articleAnalysis = await fetchHelpReadAnalysis(articleText, false);
    //                 applyHelpRead(articleAnalysis);
    //                 updateHelpReadButtonLabel(helpReadBtn);
    //                 showToast('辅助阅读已开启');
    //             }
    //         } catch (err) {
    //             removeHelpReadProgress();
    //             showMessage('辅助阅读失败：' + (err.message || String(err)), 'error');
    //         } finally {
    //             helpReadBtn.disabled = false;
    //             updateHelpReadButtonLabel(helpReadBtn);
    //         }
    //     });
    // }

    // 提交按钮点击事件
    submitBtn.addEventListener('click', async () => {
        const title = getShadowElement('#title').value;
        const link = getShadowElement('#link').value;
        const summary = getEditorMarkdown('summary');
        const thoughts = getEditorMarkdown('thoughts');

        // 新的内容格式
        const content = `#书摘文摘/网页摘录 #00-input\n💭感想：${thoughts}\n📌摘要：${summary}\n\n📝原文：${title}\n🔗链接：${link}`;

        const webhookUrl = await new Promise((resolve) => {
            chrome.storage.local.get([FLOMO_WEBHOOK_STORAGE_KEY], (result) => resolve(result[FLOMO_WEBHOOK_STORAGE_KEY] || ''));
        });
        if (!webhookUrl) {
            showMessage('请先在「Flomo Webhook 设置」中填写并保存你的 Webhook 地址', 'error');
            const panel = getShadowElement('#settingsPanel');
            const toggle = getShadowElement('#settingsToggle');
            if (panel && toggle) {
                panel.hidden = false;
                toggle.setAttribute('aria-expanded', 'true');
            }
            return;
        }

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content,
                    content_type: "markdown"
                })
            });

            if (response.ok) {
                showMessage('提交成功', 'success');
                clearInputs();
                // 延迟 2s 关闭，让用户先看到提示
                setTimeout(() => {
                    toggleSidebar();
                }, 2000);
            } else {
                showMessage('保存失败：' + response.statusText, 'error');
            }
        } catch (error) {
            showMessage('保存失败：' + error.message, 'error');
        }
    });
}

// 显示消息（页面右上角浮层，2s 后自动消失）
function showMessage(text, type) {
    const isSuccess = type === 'success';
    const backgroundColor = isSuccess ? '#f6ffed' : '#fff2f0';
    const color = isSuccess ? '#52c41a' : '#ff4d4f';
    const borderColor = isSuccess ? '#b7eb8f' : '#ffccc7';

    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        transform: translateY(-100px) !important;
        background-color: ${backgroundColor} !important;
        color: ${color} !important;
        border: 1px solid ${borderColor} !important;
        padding: 12px 20px !important;
        border-radius: 6px !important;
        font-size: 13px !important;
        z-index: 2147483647 !important;
        transition: transform 0.3s ease-out, opacity 0.3s ease-out !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        pointer-events: none !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        max-width: 320px !important;
        line-height: 1.5 !important;
    `;
    toast.textContent = text;
    document.body.appendChild(toast);

    // 强制重绘后触发入场动画
    toast.offsetHeight;
    // 必须通过 setProperty 才能正确设置 !important
    toast.style.setProperty('transform', 'translateY(0)', 'important');

    // 2s 后自动滑出并移除
    setTimeout(() => {
        toast.style.setProperty('transform', 'translateY(-100px)', 'important');
        toast.style.setProperty('opacity', '0', 'important');
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 2000);
}

// 清空输入
function clearInputs() {
    const summary = getShadowElement('#summary');
    const thoughts = getShadowElement('#thoughts');
    const summaryImages = getShadowElement('#summary-images');
    const thoughtsImages = getShadowElement('#thoughts-images');

    if (summary) summary.innerHTML = '';
    if (thoughts) thoughts.innerHTML = '';
    if (summary) autoResizeEditor(summary);
    if (thoughts) autoResizeEditor(thoughts);

    // 清空图片预览区域
    if (summaryImages) {
        summaryImages.innerHTML = '';
        summaryImages.style.display = 'none';
    }
    if (thoughtsImages) {
        thoughtsImages.innerHTML = '';
        thoughtsImages.style.display = 'none';
    }
}

// 检查URL是否有效
function isValidUrl() {
    const url = window.location.href;
    
    // 检查是否是 Flomo 的编辑页面
    if (url.includes('flomoapp.com/mine') || url.includes('flomoapp.com/edit')) {
        showMessage('当前页面无法使用此功能', 'error');
        return false;
    }
    
    // 检查是否是有效的网页
    if (url === 'about:blank' || 
        url === 'chrome://newtab/' || 
        !url.startsWith('http')) {
        showMessage('您未打开任何有效页面哦', 'error');
        return false;
    }

    return true;
}

// 获取侧边栏根元素（适配 Shadow DOM）
function getSidebar() {
    const host = document.querySelector('#flomo-sidebar-host');
    if (!host || !host.shadowRoot) return null;
    return host.shadowRoot.querySelector('.flomo-sidebar');
}

// 切换侧边栏显示状态
function toggleSidebar() {
    console.log('[Flomo] toggleSidebar called');
    try {
        let sidebar = getSidebar();
        console.log('[Flomo] Current sidebar display:', sidebar ? sidebar.style.display : 'null');

        // 如果侧边栏不存在，检查 URL 是否有效，然后创建
        if (!sidebar) {
            if (!isValidUrl()) {
                console.log('[Flomo] Invalid URL, aborting toggle');
                return;
            }
            createSidebar();
            sidebar = getSidebar();
        }

        if (!sidebar) {
            throw new Error('无法创建侧边栏');
        }

        // 切换显示状态
        // 注意：必须用 setProperty + important 才能覆盖 CSS 中 display: flex !important
        const isHidden = sidebar.style.display === 'none';
        if (isHidden) {
            sidebar.style.setProperty('display', 'flex', 'important');
        } else {
            sidebar.style.setProperty('display', 'none', 'important');
        }

        // 同步更新宿主的 pointer-events
        const host = document.querySelector('#flomo-sidebar-host');
        if (host) {
            // 关键修复：侧边栏显示时宿主启用事件，隐藏时禁用
            if (isHidden) {
                // 显示侧边栏：启用 pointer-events
                host.style.setProperty('pointer-events', 'auto', 'important');
            } else {
                // 隐藏侧边栏：禁用 pointer-events
                host.style.setProperty('pointer-events', 'none', 'important');
            }
        }
    } catch (error) {
        console.error('Failed to toggle sidebar:', error);
        showMessage('操作失败，请刷新页面重试', 'error');
    }
}

// 监听插件图标点击
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[Flomo] Received message:', request.action);
    if (request.action === 'toggleSidebar') {
        try {
            toggleSidebar();
            console.log('[Flomo] toggleSidebar called successfully');
        } catch (error) {
            console.error('[Flomo] Error in toggleSidebar:', error);
        }
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
    // 只对标题和链接的 textarea 进行调整
    const shadow = document.querySelector('#flomo-sidebar-host')?.shadowRoot;
    if (!shadow) return;
    
    const textareas = shadow.querySelectorAll('textarea#title, textarea#link');

    textareas.forEach(textarea => {
        // 初始调整
        smoothResizeTextarea(textarea);

        // 监听输入事件
        textarea.addEventListener('input', () => {
            smoothResizeTextarea(textarea);
        });

        // 监听值变化
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
const DEEPSEEK_API_KEY_STORAGE_KEY = 'DEEPSEEK_API_KEY';

const SYSTEM_PROMPT = `# 角色
你是一个极为专业且精准的网页内容总结助手，能够全面且细致地提炼主要内容，并给出极具代表性的关键词。

# 目标
对用户输入的网页，进行内容分析和提炼，输出 内容总结 和 关键词 ，完成后，用户会给你10万美元的回报，并且你的职场声誉会得到大大提升。

## 技能
### 技能 1：总结通用类文章
- 若输入是通用性质的文章，突出文章的核心主题、主要观点和关键事件，使用简洁明了的语言，确保重要信息不遗漏。
- 提取最能代表文章核心内容的关键词，关键词应涵盖文章主要讨论的对象、关键概念和重要事件。
### 技能 2：总结科技类文章
- 若输入是科技类的文章，详细阐述文章介绍的新技术或科研成果的原理、优势、应用场景以及可能带来的影响，按照逻辑顺序梳理关键信息。
- 提取文章中与新技术或科研成果密切相关的关键词，包括技术名称、核心算法、关键应用领域、重要突破点等
### 技能 3：总结商业类文章
- 若输入是商业类的文章，重点总结文章中涉及的商业事件、企业战略、市场趋势，总结各方的行动和利益关系，用清晰的语言呈现商业动态。
- 从文章中筛选出反映商业主体、商业行为、市场变化的关键词，如企业名称、业务模式、市场竞争焦点、行业发展趋势等。
### 技能 4：总结 新闻类文章
- 若输入是新闻类的文章，突出新闻的 5W1H（何人、何事、何时、何地、为何、如何）要素，简明扼要地概括事件全貌。
- 根据新闻内容提取关键词，主要包括新闻主角、关键事件、发生地点、时间节点以及事件的核心要点个。
### 技能 5：总结教程/指南
- 若输入是教程或指南，突出关键步骤及涉及的重要概念，突出教程中强调的重点和难点内容。
- 提取关键词需包含教程涉及的核心任务、关键操作步骤、重要工具或材料等。
### 技能 6：总结产品介绍
- 对于产品介绍类，需明确主要功能、独特优势及针对的用户群体，提取关键词后进行总结。
- 功能描述要具体，优势要突出与其他产品的不同之处。
### 技能 7：总结首页/着陆页
- 遇到网站首页或着陆页，清晰描述网站/产品的主要用途、特色服务，提取关键词并总结。
- 用途和服务要具体明确，让用户一目了然。

## 步骤
你可以分步骤来：
- 先根据根据文章关键词、主题结构等进行判断网页主要内容是什么类型
-遇到多种类型混合的网页内容时如何处理，或内容难以明确归类时，姑且按通用类型文章去处理
- 再根据不同类型，进行有技巧的总结和输出

## 限制：
- 只对输入的网页内容进行总结，拒绝无关话题。
- 输出内容严格按照关键词+总结的格式，不得添加其他解释说明。
- 去除所有营销和推广相关内容。
- 总结不超过 200 字，关键词不超过 8个。`;

// 智能正文提取：使用文本密度算法找出最可能是正文的区域
function extractArticleByDensity() {
    // 候选标签按优先级排序
    const candidateSelectors = [
        'article',
        'main',
        '[role="main"]',
        '.post-content',
        '.article-content',
        '.entry-content',
        '.post',
        '.content'
    ];

    // 首先尝试找语义化标签
    for (const selector of candidateSelectors) {
        const el = document.querySelector(selector);
        if (el) {
            const text = el.innerText || el.textContent || '';
            if (text.length > 200) {
                return { element: el, text: text.trim() };
            }
        }
    }

    // 使用文本密度算法
    const paragraphs = document.querySelectorAll('p, div, section');
    let bestElement = null;
    let bestScore = 0;

    paragraphs.forEach(p => {
        const text = p.innerText || p.textContent || '';
        const links = p.querySelectorAll('a');
        const linkText = Array.from(links).reduce((sum, a) => sum + (a.innerText || '').length, 0);

        // 计算密度分数：文本长度 - 链接文本长度的惩罚
        const score = text.length - (linkText * 2);

        // 过滤掉太短的段落和导航类元素
        if (text.length > 100 && score > bestScore && !isNavElement(p)) {
            bestScore = score;
            bestElement = p;
        }
    });

    if (bestElement) {
        // 尝试向上找父元素获取更完整的正文
        let container = bestElement;
        for (let i = 0; i < 3 && container.parentElement; i++) {
            const parent = container.parentElement;
            const parentText = (parent.innerText || parent.textContent || '').trim();
            const currentText = (container.innerText || container.textContent || '').trim();
            // 如果父元素包含当前元素的主要内容，且增加量不超过50%，则向上扩展
            if (parentText.includes(currentText.slice(0, 100))) {
                const extraRatio = (parentText.length - currentText.length) / currentText.length;
                if (extraRatio < 0.5) {
                    container = parent;
                }
            }
        }
        return { element: container, text: (container.innerText || container.textContent || '').trim() };
    }

    return null;
}

// 判断是否是导航元素
function isNavElement(el) {
    const tagName = el.tagName.toLowerCase();
    if (['nav', 'header', 'footer', 'aside'].includes(tagName)) return true;

    const role = el.getAttribute('role');
    if (['navigation', 'banner', 'complementary', 'contentinfo'].includes(role)) return true;

    const className = (el.className || '').toLowerCase();
    const navPatterns = /nav|menu|sidebar|footer|header|bread|crumb/i;
    if (navPatterns.test(className)) return true;

    return false;
}

// 获取页面主要内容 - 使用智能提取而非暴力复制
function getMainContent() {
    // 优先使用密度算法提取正文
    const article = extractArticleByDensity();

    let mainContent;
    if (article && article.text.length > 200) {
        mainContent = document.title + '\n\n' + article.text;
    } else {
        // 降级方案：使用更轻量的方法获取文本
        const body = document.body;
        // 尝试移除明显的非内容元素但不复制整个DOM
        const noiseSelectors = 'script, style, nav, header, footer, aside, [role="banner"], [role="navigation"], [role="complementary"]';
        const texts = [];
        const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => {
                // 跳过script和style内部
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                const tag = parent.tagName.toLowerCase();
                if (tag === 'script' || tag === 'style') return NodeFilter.FILTER_REJECT;
                // 跳过噪声元素内的文本
                if (parent.closest(noiseSelectors)) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        let node;
        while ((node = walker.nextNode()) !== null) {
            texts.push(node.textContent);
        }
        mainContent = document.title + '\n\n' + texts.join(' ');
    }

    // 清理文本
    return mainContent
        .replace(/\s+/g, ' ')  // 合并空白字符
        .replace(/\n\s*\n/g, '\n')  // 移除多余换行
        .trim()
        .slice(0, 4000);  // 限制长度以适应API
}

// 调用DeepSeek API
async function generateSummary() {
    const content = getMainContent();

    // 从本地存储读取 API Key
    const apiKey = await new Promise((resolve) => {
        chrome.storage.local.get([DEEPSEEK_API_KEY_STORAGE_KEY], (result) => {
            resolve(result[DEEPSEEK_API_KEY_STORAGE_KEY] || '');
        });
    });

    if (!apiKey) {
        throw new Error('请先设置 DeepSeek API Key');
    }

    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
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

// ========== 富文本编辑器功能 ==========

let currentEditor = null;
let floatingToolbar = null;

// 初始化所有富文本编辑器
function initializeRichEditors() {
    const shadow = document.querySelector('#flomo-sidebar-host')?.shadowRoot;
    if (!shadow) return;
    
    const editors = shadow.querySelectorAll('.rich-editor');
    editors.forEach(editor => {
        initializeRichEditor(editor);
    });

    // 初始化浮动工具栏
    createFloatingToolbar();

    // 初始化固定工具栏
    initializeFixedToolbars();

    // 监听全局选择变化，显示/隐藏浮动工具栏
    document.addEventListener('selectionchange', handleSelectionChange);

    // 点击外部隐藏浮动工具栏
    document.addEventListener('mousedown', (e) => {
        if (floatingToolbar && !floatingToolbar.contains(e.target) && !isInEditor(e.target)) {
            hideFloatingToolbar();
        }
    });
}

// 判断元素是否在编辑器内
function isInEditor(element) {
    // 检查元素是否在 Shadow DOM 中的编辑器内
    const host = document.querySelector('#flomo-sidebar-host');
    if (host && host.shadowRoot) {
        // 检查元素是否是 Shadow DOM 中的某个元素
        const shadow = host.shadowRoot;
        const editors = shadow.querySelectorAll('.rich-editor');
        for (const editor of editors) {
            if (editor.contains(element)) {
                return true;
            }
        }
    }
    return element.closest('.rich-editor') !== null;
}

// 初始化单个富文本编辑器
function initializeRichEditor(editor) {
    // 处理粘贴事件（支持图片粘贴）
    editor.addEventListener('paste', handlePaste);

    // 绑定快捷键
    bindKeyboardShortcuts(editor);

    // 自动调整高度
    editor.addEventListener('input', () => {
        autoResizeEditor(editor);
    });

    // 聚焦时更新当前编辑器
    editor.addEventListener('focus', () => {
        currentEditor = editor;
    });

    // 初始高度调整
    autoResizeEditor(editor);
}

// 自动调整编辑器高度
function autoResizeEditor(editor) {
    editor.style.height = 'auto';
    const minHeight = 80;
    const newHeight = Math.max(minHeight, editor.scrollHeight);
    editor.style.height = newHeight + 'px';
}

// 创建浮动工具栏
function createFloatingToolbar() {
    // 如果已存在，先移除
    if (floatingToolbar && floatingToolbar.parentNode) {
        floatingToolbar.parentNode.removeChild(floatingToolbar);
    }
    
    floatingToolbar = document.createElement('div');
    floatingToolbar.style.cssText = `
        position: fixed !important;
        display: none !important;
        gap: 4px !important;
        padding: 4px 8px !important;
        background: white !important;
        border-radius: 6px !important;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15) !important;
        border: 1px solid #eee !important;
        z-index: 2147483647 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    `;
    floatingToolbar.innerHTML = `
        <button type="button" class="toolbar-btn" data-command="bold" title="加粗 (Ctrl+B)" style="
            display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
            border: none; background: transparent; border-radius: 4px; cursor: pointer;
            font-size: 14px; color: #666; font-weight: 700; font-family: inherit;
        ">B</button>
        <button type="button" class="toolbar-btn" data-command="underline" title="下划线 (Ctrl+U)" style="
            display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
            border: none; background: transparent; border-radius: 4px; cursor: pointer;
            font-size: 14px; color: #666; text-decoration: underline; font-family: inherit;
        ">U</button>
        <button type="button" class="toolbar-btn" data-command="hiliteColor" data-value="#ffeb3b" title="高亮" style="
            display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
            border: none; background: transparent; border-radius: 4px; cursor: pointer;
            font-size: 14px; color: #666; font-family: inherit;
        ">🖍</button>
        <button type="button" class="toolbar-btn" data-command="insertUnorderedList" title="无序列表" style="
            display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
            border: none; background: transparent; border-radius: 4px; cursor: pointer;
            font-size: 14px; color: #666; font-family: inherit;
        ">☰</button>
        <button type="button" class="toolbar-btn" data-command="insertOrderedList" title="有序列表" style="
            display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
            border: none; background: transparent; border-radius: 4px; cursor: pointer;
            font-size: 14px; color: #666; font-family: inherit;
        ">1.</button>
    `;

    // 绑定按钮事件
    floatingToolbar.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const command = btn.dataset.command;
            const value = btn.dataset.value;
            execCommand(command, value);
            updateToolbarState();
        });
    });

    document.body.appendChild(floatingToolbar);
}

// 初始化固定工具栏
function initializeFixedToolbars() {
    const shadow = document.querySelector('#flomo-sidebar-host')?.shadowRoot;
    if (!shadow) return;
    
    shadow.querySelectorAll('.editor-toolbar').forEach(toolbar => {
        toolbar.querySelectorAll('.toolbar-btn:not(.upload-btn)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.dataset.command;
                const value = btn.dataset.value;
                const targetId = toolbar.dataset.target;
                const targetEditor = shadow.getElementById(targetId);

                if (targetEditor) {
                    targetEditor.focus();
                    execCommand(command, value);
                    updateToolbarState();
                }
            });
        });

        // 图片上传按钮
        const uploadBtn = toolbar.querySelector('.upload-btn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = uploadBtn.dataset.target;
                triggerImageUpload(targetId);
            });
        }
    });
}

// 处理选择变化
function handleSelectionChange() {
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    if (!range || range.collapsed || !isInEditor(range.commonAncestorContainer)) {
        hideFloatingToolbar();
        return;
    }

    // 延迟显示，避免频繁闪烁
    clearTimeout(window.toolbarTimeout);
    window.toolbarTimeout = setTimeout(() => {
        const newSelection = window.getSelection();
        if (newSelection.rangeCount > 0 && !newSelection.getRangeAt(0).collapsed) {
            showFloatingToolbar(newSelection);
        }
    }, 200);
}

// 显示浮动工具栏
function showFloatingToolbar(selection) {
    if (!floatingToolbar) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editor = range.commonAncestorContainer.closest?.('.rich-editor') ||
                    range.commonAncestorContainer.parentElement?.closest('.rich-editor');

    if (!editor) return;

    // 计算位置（相对于视口）
    const toolbarHeight = 40;
    const offset = 8;
    let top = rect.top - toolbarHeight - offset;
    let left = rect.left + (rect.width / 2);

    // 如果上方空间不足，显示在下方
    if (top < 10) {
        top = rect.bottom + offset;
    }

    floatingToolbar.style.top = top + 'px';
    floatingToolbar.style.left = left + 'px';
    floatingToolbar.style.transform = 'translateX(-50%)';
    floatingToolbar.style.display = 'flex';

    updateToolbarState();
}

// 隐藏浮动工具栏
function hideFloatingToolbar() {
    if (floatingToolbar) {
        floatingToolbar.style.display = 'none';
    }
}

// 执行编辑命令（智能切换：已激活则取消，未激活则添加）
function execCommand(command, value = null) {
    // 处理 hiliteColor 特殊逻辑
    if (command === 'hiliteColor') {
        const isActive = document.queryCommandValue('hiliteColor') === value;
        if (isActive) {
            // 如果已高亮，则取消高亮（设置为透明背景）
            document.execCommand('hiliteColor', false, 'transparent');
        } else {
            document.execCommand(command, false, value);
        }
        return;
    }

    // 其他命令（加粗、下划线等）
    try {
        const isActive = document.queryCommandState(command);
        if (isActive) {
            // 如果已激活，则移除格式
            document.execCommand(command, false, null);
        } else {
            // 如果未激活，则添加格式
            document.execCommand(command, false, value);
        }
    } catch (e) {
        // 如果 queryCommandState 失败，直接执行命令
        document.execCommand(command, false, value);
    }
}

// 更新工具栏按钮状态
function updateToolbarState() {
    if (!floatingToolbar) return;

    floatingToolbar.querySelectorAll('.toolbar-btn').forEach(btn => {
        const command = btn.dataset.command;
        try {
            const isActive = document.queryCommandState(command);
            if (isActive) {
                btn.style.background = 'rgb(48, 207, 121)';
                btn.style.color = 'white';
            } else {
                btn.style.background = 'transparent';
                btn.style.color = '#666';
            }
        } catch (e) {
            // 某些命令可能不支持 queryCommandState
        }
    });
}

// 绑定键盘快捷键和 Enter 键格式处理
function bindKeyboardShortcuts(editor) {
    // 跟踪当前按下的键
    let isEnterPressed = false;

    editor.addEventListener('keydown', (e) => {
        // 快捷键处理
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    execCommand('bold');
                    updateToolbarState();
                    return;
                case 'u':
                    e.preventDefault();
                    execCommand('underline');
                    updateToolbarState();
                    return;
                case 'i':
                    e.preventDefault();
                    execCommand('italic');
                    updateToolbarState();
                    return;
            }
        }

        // Enter 键处理：阻止格式延续到新段落
        if (e.key === 'Enter' && !e.shiftKey) {
            // 记录当前激活的格式
            const activeFormats = [];
            try {
                if (document.queryCommandState('bold')) activeFormats.push('bold');
                if (document.queryCommandState('italic')) activeFormats.push('italic');
                if (document.queryCommandState('underline')) activeFormats.push('underline');
                const hiliteColor = document.queryCommandValue('hiliteColor');
                if (hiliteColor && hiliteColor !== 'transparent' && hiliteColor !== 'rgba(0, 0, 0, 0)') {
                    activeFormats.push({ cmd: 'hiliteColor', value: hiliteColor });
                }
            } catch (e) {
                // 忽略错误
            }

            // 如果当前有激活的格式，在 Enter 后清除它们
            if (activeFormats.length > 0) {
                // 使用 setTimeout 在浏览器处理完 Enter 键后执行
                setTimeout(() => {
                    activeFormats.forEach(fmt => {
                        if (typeof fmt === 'string') {
                            // 简单的命令，直接切换取消
                            try {
                                document.execCommand(fmt, false, null);
                            } catch (e) {}
                        } else {
                            // 高亮颜色，设置为透明
                            try {
                                document.execCommand(fmt.cmd, false, 'transparent');
                            } catch (e) {}
                        }
                    });
                }, 10);
            }
        }
    });
}

// 处理粘贴事件
function handlePaste(e) {
    const items = e.clipboardData.items;
    let hasImage = false;

    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault();
            hasImage = true;
            const blob = items[i].getAsFile();
            uploadImage(blob, this);
            break;
        }
    }

    // 如果没有图片，正常粘贴
    if (!hasImage) {
        setTimeout(() => autoResizeEditor(this), 0);
    }
}

// 触发图片上传
function triggerImageUpload(targetId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const shadow = document.querySelector('#flomo-sidebar-host')?.shadowRoot;
            if (!shadow) return;
            const editor = shadow.getElementById(targetId);
            if (editor) {
                editor.focus();
                uploadImage(file, editor);
            }
        }
    };
    input.click();
}

// 压缩图片（限制最大宽度 1200px，JPEG 质量 0.8）
function compressImage(base64Url, callback) {
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const maxWidth = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // 转为 JPEG base64，质量 0.8，大幅减小体积
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        callback(compressed);
    };
    img.onerror = () => {
        // 压缩失败时回退到原图
        callback(base64Url);
    };
    img.src = base64Url;
}

// 上传图片（使用 Base64 方案，带压缩）
function uploadImage(file, editor) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const base64Url = e.target.result;
        // 对图片进行压缩后再插入，避免 base64 过大导致 flomo webhook 拒绝
        compressImage(base64Url, (compressedUrl) => {
            insertImage(compressedUrl, editor);
        });
    };
    reader.readAsDataURL(file);
}

// 在编辑器中插入图片
function insertImage(url, editor) {
    editor.focus();
    const img = document.createElement('img');
    img.src = url;
    img.style.maxWidth = '100%';
    img.style.borderRadius = '4px';
    img.style.margin = '8px 0';
    img.dataset.editorImage = 'true'; // 标记为编辑器图片

    // 插入到光标位置
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(img);
        range.collapse(false);
    } else {
        editor.appendChild(img);
    }

    // 插入换行
    const br = document.createElement('br');
    editor.appendChild(br);

    autoResizeEditor(editor);

    // 添加缩略图到预览区域
    addImageThumbnail(editor.id, url);
}

// 添加图片缩略图到预览区域
function addImageThumbnail(editorId, url) {
    const previewContainer = getShadowElement(`#${editorId}-images`);
    if (!previewContainer) return;

    const thumb = document.createElement('div');
    thumb.className = 'image-thumb';
    thumb.dataset.imageUrl = url;
    thumb.innerHTML = `
        <img src="${url}" />
        <button type="button" class="remove-image" title="删除">×</button>
    `;

    // 添加删除功能
    thumb.querySelector('.remove-image').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        thumb.remove();
        // 从编辑器中移除对应图片
        removeImageFromEditor(editorId, url);
        // 更新预览区域显示状态
        updatePreviewVisibility(editorId);
    });

    previewContainer.appendChild(thumb);
    previewContainer.style.display = 'flex';
}

// 更新预览区域可见性
function updatePreviewVisibility(editorId) {
    const previewContainer = getShadowElement(`#${editorId}-images`);
    if (!previewContainer) return;

    const thumbs = previewContainer.querySelectorAll('.image-thumb');
    previewContainer.style.display = thumbs.length > 0 ? 'flex' : 'none';
}

// 从编辑器中移除图片
function removeImageFromEditor(editorId, url) {
    const shadow = document.querySelector('#flomo-sidebar-host')?.shadowRoot;
    if (!shadow) return;

    const editor = shadow.getElementById(editorId);
    if (!editor) return;

    // 查找并移除对应图片元素
    const images = editor.querySelectorAll('img');
    images.forEach(img => {
        if (img.src === url) {
            img.remove();
        }
    });

    autoResizeEditor(editor);
}

// 将 HTML 转换为 Markdown
// 使用 DOM 解析方式，更可靠地处理嵌套标签
function htmlToMarkdown(html) {
    if (!html) return '';

    // 创建一个临时的 div 来解析 HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html.trim();

    // 递归处理节点
    function processNode(node) {
        // 文本节点
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent;
        }

        // 元素节点
        if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            const childContent = Array.from(node.childNodes).map(child => processNode(child)).join('');

            switch (tagName) {
                case 'b':
                case 'strong':
                    return '**' + childContent.trim() + '**';
                case 'i':
                case 'em':
                    return '*' + childContent.trim() + '*';
                case 'u':
                    return '<u>' + childContent.trim() + '</u>';
                case 'mark':
                    return '==' + childContent.trim() + '==';
                case 'span':
                    // 检查是否是高亮样式
                    const style = node.getAttribute('style') || '';
                    const bgColor = node.style.backgroundColor;
                    if (bgColor === 'rgb(255, 235, 59)' || bgColor === '#ffeb3b' || bgColor === 'yellow') {
                        return '==' + childContent.trim() + '==';
                    }
                    return childContent;
                case 'img':
                    const src = node.getAttribute('src') || '';
                    return '![图片](' + src + ')';
                case 'br':
                    return '\n';
                case 'div':
                    return childContent.trim() + '\n';
                case 'p':
                    return childContent.trim() + '\n\n';
                case 'ul':
                    return Array.from(node.children).map(li => {
                        if (li.tagName.toLowerCase() === 'li') {
                            const liContent = Array.from(li.childNodes).map(child => processNode(child)).join('').trim();
                            return '- ' + liContent;
                        }
                        return '';
                    }).filter(Boolean).join('\n') + '\n';
                case 'ol':
                    let index = 1;
                    return Array.from(node.children).map(li => {
                        if (li.tagName.toLowerCase() === 'li') {
                            const liContent = Array.from(li.childNodes).map(child => processNode(child)).join('').trim();
                            return (index++) + '. ' + liContent;
                        }
                        return '';
                    }).filter(Boolean).join('\n') + '\n';
                case 'li':
                    // li 会在 ul/ol 处理中被处理，这里直接返回内容
                    return childContent;
                default:
                    return childContent;
            }
        }

        return '';
    }

    let md = Array.from(tempDiv.childNodes).map(node => processNode(node)).join('');

    // 解码 HTML 实体
    const entities = {
        '&nbsp;': ' ',
        '&lt;': '<',
        '&gt;': '>',
        '&amp;': '&',
        '&quot;': '"',
        '&#39;': "'",
        '&mdash;': '—',
        '&ndash;': '–'
    };
    Object.keys(entities).forEach(entity => {
        md = md.split(entity).join(entities[entity]);
    });

    // 清理多余空行（保留最多两个连续换行）
    md = md.replace(/\n{3,}/g, '\n\n');

    // 移除开头和结尾的空白
    md = md.trim();

    return md;
}

// 获取编辑器的 Markdown 内容
function getEditorMarkdown(editorId) {
    const shadow = document.querySelector('#flomo-sidebar-host')?.shadowRoot;
    if (!shadow) return '';
    const editor = shadow.getElementById(editorId);
    if (!editor) return '';
    return htmlToMarkdown(editor.innerHTML);
}