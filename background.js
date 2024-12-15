// 监听扩展安装
chrome.runtime.onInstalled.addListener(function() {
  // 初始化默认快捷键配置
  chrome.storage.sync.set({
    shortcuts: [
      {
        command: 'shortcut-1',
        keys: 'Alt+G',
        url: 'https://programmercarl.com/0209.%E9%95%BF%E5%BA%A6%E6%9C%80%E5%B0%8F%E7%9A%84%E5%AD%90%E6%95%B0%E7%BB%84.html'
      },
      {
        command: 'shortcut-2',
        keys: 'Alt+B',
        url: 'https://www.baidu.com'
      }
    ]
  });
});

// 监听键盘命令
chrome.commands.onCommand.addListener((command) => {
  if (command === '_execute_action') {
    // 打开配置面板
    chrome.action.openPopup();
  } else {
    // 查找对应的快捷键配置
    chrome.storage.sync.get(['shortcuts'], function(result) {
      const shortcuts = result.shortcuts || [];
      const shortcut = shortcuts.find(s => s.command === command);
      
      if (shortcut) {
        // 打开配置的URL
        chrome.tabs.create({ url: shortcut.url });
      }
    });
  }
});

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'checkShortcut') {
    const pressedKeys = request.keys;
    // 检查是否匹配已保存的快捷键
    chrome.storage.sync.get(['shortcuts'], function(result) {
      const shortcuts = result.shortcuts || [];
      const matchingShortcut = shortcuts.find(s => s.keys.toLowerCase() === pressedKeys.toLowerCase());
      
      if (matchingShortcut) {
        // 打开配置的URL
        chrome.tabs.create({ url: matchingShortcut.url });
      }
    });
  }
});
