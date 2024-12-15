document.addEventListener('DOMContentLoaded', function() {
  loadShortcuts();
  document.getElementById('add-shortcut').addEventListener('click', addShortcutField);
  document.getElementById('save-shortcuts').addEventListener('click', saveShortcuts);

  // 添加全局键盘事件监听
  document.addEventListener('keydown', handleKeyPress);
});

function handleKeyPress(event) {
  // 获取按下的键盘组合
  const pressedKeys = [];
  if (event.ctrlKey) pressedKeys.push('Ctrl');
  if (event.altKey) pressedKeys.push('Alt');
  if (event.shiftKey) pressedKeys.push('Shift');
  if (event.key !== 'Control' && event.key !== 'Alt' && event.key !== 'Shift') {
    pressedKeys.push(event.key.toUpperCase());
  }
  const keyCombo = pressedKeys.join('+');

  // 发送消息给background script检查快捷键
  chrome.runtime.sendMessage({
    type: 'checkShortcut',
    keys: keyCombo
  });
}

function loadShortcuts() {
  chrome.storage.sync.get(['shortcuts'], function(result) {
    const shortcuts = result.shortcuts || [];
    const container = document.getElementById('shortcuts-container');
    container.innerHTML = '';
    
    shortcuts.forEach((shortcut, index) => {
      addShortcutField(shortcut);
    });

    if (shortcuts.length === 0) {
      addShortcutField();
    }
  });
}

function addShortcutField(shortcut = { command: '', keys: '', url: '' }) {
  const container = document.getElementById('shortcuts-container');
  const div = document.createElement('div');
  div.className = 'shortcut-item';
  
  div.innerHTML = `
    <input type="text" class="shortcut-keys" placeholder="快捷键 (例如: Alt+G)" value="${shortcut.keys}" ${shortcut.command ? 'readonly' : ''}>
    <input type="text" class="shortcut-url" placeholder="网址 (例如: https://www.google.com)" value="${shortcut.url}">
    <button class="delete-btn">删除</button>
  `;

  container.appendChild(div);

  const deleteBtn = div.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', function() {
    // 添加淡出动画
    div.style.opacity = '0';
    div.style.transform = 'translateY(10px)';
    setTimeout(() => {
      div.remove();
    }, 200);
  });

  // 添加淡入动画
  div.style.opacity = '0';
  div.style.transform = 'translateY(10px)';
  setTimeout(() => {
    div.style.opacity = '1';
    div.style.transform = 'translateY(0)';
  }, 10);
}

function saveShortcuts() {
  const items = document.getElementsByClassName('shortcut-item');
  const shortcuts = [];

  for (let item of items) {
    const keys = item.querySelector('.shortcut-keys').value.trim();
    const url = item.querySelector('.shortcut-url').value.trim();
    
    if (keys && url) {
      shortcuts.push({ keys, url });
    }
  }

  chrome.storage.sync.set({ shortcuts }, function() {
    // 创建提示元素
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #7048e8;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    toast.textContent = '设置已保存';
    document.body.appendChild(toast);

    // 显示提示
    setTimeout(() => {
      toast.style.opacity = '1';
    }, 10);

    // 3秒后隐藏提示
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  });
}
