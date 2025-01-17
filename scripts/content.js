// 创建和插入侧边栏
function createSidebar() {
    // 检查是否已存在侧边栏
    if (document.querySelector('.flomo-sidebar')) {
        return;
    }

    const sidebar = document.createElement('div');
    sidebar.className = 'flomo-sidebar';
    sidebar.style.display = 'none';
    
    // 创建侧边栏内容
    sidebar.innerHTML = `
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
                    <label>📌 原文摘要</label>
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
}

// 初始化侧边栏功能
function initializeSidebar() {
    const titleInput = document.querySelector('#title');
    const linkInput = document.querySelector('#link');
    const submitBtn = document.querySelector('#submitBtn');

    // 设置当前页面标题和链接
    const pageTitle = document.title;
    const pageUrl = window.location.href;
    
    titleInput.value = `《${pageTitle.trim()}》`;
    linkInput.value = pageUrl;

    // 初始化自动调整高度
    initializeAutoResize();

    // 提交按钮点击事件
    submitBtn.addEventListener('click', async () => {
        const title = document.querySelector('#title').value;
        const link = document.querySelector('#link').value;
        const summary = document.querySelector('#summary').value;
        const thoughts = document.querySelector('#thoughts').value;

        // 新的API提交格式
        const content = `${title}\n${link}\n原文摘要\n---\n${summary}\n\n个人感想\n---\n${thoughts}`;

        try {
            const response = await fetch('https://flomoapp.com/iwh/ODcyOTY/8ed3b45bc8b3e51b9d02234f876acf51/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content })
            });

            if (response.ok) {
                showMessage('提交成功！', 'success');
                clearInputs();
            } else {
                showMessage('提交失败：' + response.statusText, 'error');
            }
        } catch (error) {
            showMessage('提交失败：' + error.message, 'error');
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
    return url !== 'about:blank' && 
           url !== 'chrome://newtab/' && 
           url.startsWith('http');
}

// 切换侧边栏显示状态
function toggleSidebar() {
    if (!isValidUrl()) {
        showToast('您未打开任何有效页面哦');
        return;
    }

    let sidebar = document.querySelector('.flomo-sidebar');
    if (!sidebar) {
        createSidebar();
        sidebar = document.querySelector('.flomo-sidebar');
    }
    sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
}

// 监听插件图标点击
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleSidebar') {
        toggleSidebar();
    }
});

// 确保消息监听器已经设置
console.log('Content script loaded and listening for messages'); 

// 在 createSidebar 函数后添加自动调整文本框高度的功能
function initializeAutoResize() {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        if (textarea.id !== 'link') {
            textarea.addEventListener('input', function() {
                this.style.height = '36px';
                this.style.height = (this.scrollHeight) + 'px';
            });
            
            // 初始化高度
            textarea.style.height = '36px';
            textarea.style.height = (textarea.scrollHeight) + 'px';
        }
    });
} 