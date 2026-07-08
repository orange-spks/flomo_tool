(function() {
    'use strict';

    // 防止重复安装
    if (window.__flomoKeyBlockerInstalled) return;
    window.__flomoKeyBlockerInstalled = true;

    const FUNCTION_KEYS = [
        'Tab', 'Escape', 'Enter', 'Backspace', 'Delete',
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'Home', 'End', 'PageUp', 'PageDown', 'Insert',
        'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
    ];

    /**
     * 判断事件是否应该被阻止传播到页面
     * 只在事件目标位于 Flomo 侧边栏 Shadow DOM 内的输入元素时生效
     */
    function shouldBlock(event) {
        if (event.type !== 'keydown' && event.type !== 'keyup') return false;

        const target = event.target;
        if (!target) return false;

        const host = document.querySelector('#flomo-sidebar-host');
        if (!host || !host.shadowRoot || !host.shadowRoot.contains(target)) return false;

        const tagName = target.tagName;
        const isInputElement = tagName === 'TEXTAREA' ||
                               tagName === 'INPUT' ||
                               target.isContentEditable ||
                               target.closest('.rich-editor');
        if (!isInputElement) return false;

        // 白名单放行：单独按下的修饰键、平台组合键、功能键
        const isModifierAlone = ['Control', 'Shift', 'Alt', 'Meta'].includes(event.key);
        const hasPlatformModifier = event.ctrlKey || event.altKey || event.metaKey;
        const isFunctionKey = FUNCTION_KEYS.includes(event.key);

        return !(isModifierAlone || hasPlatformModifier || isFunctionKey);
    }

    /**
     * 键盘事件捕获阶段处理器
     * 通过 stopImmediatePropagation 阻止事件继续传播，
     * 从而屏蔽 YouTube/B 站等站点在 document 上注册的视频快捷键监听器。
     * 不调用 preventDefault，因此输入框的浏览器默认输入行为不受影响。
     */
    function keyCaptureHandler(event) {
        if (!shouldBlock(event)) return;

        if (window.__flomoKeyBlockerDebug) {
            console.log('[Flomo KeyBlocker] blocked:', event.type, event.key, 'target:', event.target.tagName);
        }

        event.stopImmediatePropagation();
    }

    // 在 document 的捕获阶段注册，确保优先于页面脚本（如 YouTube）的监听器执行
    document.addEventListener('keydown', keyCaptureHandler, true);
    document.addEventListener('keyup', keyCaptureHandler, true);
})();
