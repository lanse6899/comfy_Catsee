// CatSee浏览器 v1.2.1 - 修复预览功能
console.log('[CatSee] 浏览器 v1.2.1 加载中... (已修复缩略图和预览加载)');

// 创建按钮
function createButton() {
    // 检查按钮是否已存在
    if (document.querySelector('.catsee-btn')) {
        console.log('[CatSee] 按钮已存在');
        return;
    }
    
    // 创建按钮元素
    const button = document.createElement('button');
    button.className = 'catsee-btn';
    button.innerHTML = '😽';
    button.title = 'CatSee浏览器';
    
    // 按钮样式 - 放在右上角，顶部栏下面
    button.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: 2px solid #764ba2;
        border-radius: 50%;
        color: white;
        font-size: 20px;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        transition: transform 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // 悬停效果
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });
    
    // 拖拽功能
    let isDragging = false;
    let dragStartX, dragStartY;
    let buttonStartX, buttonStartY;
    let hasMoved = false;
    
    button.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // 只响应左键
        
        isDragging = true;
        hasMoved = false;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        
        // 获取按钮当前位置
        const rect = button.getBoundingClientRect();
        buttonStartX = rect.left;
        buttonStartY = rect.top;
        
        button.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        
        // 如果移动超过5px，标记为已移动
        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            hasMoved = true;
        }
        
        // 计算新位置
        let newX = buttonStartX + deltaX;
        let newY = buttonStartY + deltaY;
        
        // 限制在窗口范围内
        const maxX = window.innerWidth - button.offsetWidth;
        const maxY = window.innerHeight - button.offsetHeight;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
        // 更新位置
        button.style.left = newX + 'px';
        button.style.top = newY + 'px';
        button.style.right = 'auto';
        button.style.bottom = 'auto';
    });
    
    document.addEventListener('mouseup', (e) => {
        if (isDragging) {
            isDragging = false;
            button.style.cursor = 'pointer';
            
            // 如果没有移动，触发点击事件
            if (!hasMoved) {
                toggleBrowser();
            }
        }
    });
    
    // 添加到页面
    document.body.appendChild(button);
    console.log('[CatSee] 按钮创建成功（支持拖拽）');
}

// 切换浏览器显示/隐藏
function toggleBrowser() {
    let browser = document.getElementById('catsee-browser');
    
    if (browser) {
        // 如果浏览器已存在，切换显示状态
        if (browser.style.display === 'none') {
            browser.style.display = 'flex';
        } else {
            browser.style.display = 'none';
        }
    } else {
        // 如果浏览器不存在，创建它
        createBrowser();
    }
}

// 创建浏览器窗口
function createBrowser() {
    // 计算居中位置 - 占据更大空间
    const width = window.innerWidth * 0.95;  // 95%宽度
    const height = window.innerHeight * 0.92; // 92%高度
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    // 创建浏览器容器
    const browser = document.createElement('div');
    browser.id = 'catsee-browser';
    
    // 浏览器样式 - 黑色系
    browser.style.cssText = `
        position: fixed;
        left: ${left}px;
        top: ${top}px;
        width: ${width}px;
        height: ${height}px;
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
        z-index: 9998;
        display: flex;
        flex-direction: column;
        font-family: 'Segoe UI', Arial, sans-serif;
    `;
    
    // 浏览器HTML内容 - 黑色系
    browser.innerHTML = `
        <!-- 标题栏 -->
        <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 10px 10px 0 0;
        ">
            <div style="font-size: 16px; font-weight: bold;">
                😽 CatSee 浏览器
            </div>
            <button id="close-btn" style="
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 2px 8px;
                border-radius: 4px;
                transition: background 0.2s;
            " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">✕</button>
        </div>
        
        <!-- 工具栏 -->
        <div style="padding: 10px 15px; background: #0d0d0d; border-bottom: 1px solid #333; display: flex; gap: 10px; align-items: center;">
            <button id="back-btn" style="padding: 6px 12px; background: #2a2a2a; border: 1px solid #444; color: #e0e0e0; cursor: pointer; border-radius: 4px; font-size: 13px;">⬅</button>
            <button id="forward-btn" style="padding: 6px 12px; background: #2a2a2a; border: 1px solid #444; color: #e0e0e0; cursor: pointer; border-radius: 4px; font-size: 13px;">➡</button>
            <button id="up-btn" style="padding: 6px 12px; background: #2a2a2a; border: 1px solid #444; color: #e0e0e0; cursor: pointer; border-radius: 4px; font-size: 13px;">⬆</button>
            <button id="refresh-btn" style="padding: 6px 12px; background: #2a2a2a; border: 1px solid #444; color: #e0e0e0; cursor: pointer; border-radius: 4px; font-size: 13px;">🔄</button>
            <div id="breadcrumb" style="flex: 1; padding: 6px 12px; background: #2a2a2a; border: 1px solid #444; color: #e0e0e0; border-radius: 4px; font-size: 13px; overflow-x: auto; white-space: nowrap;">此电脑</div>
        </div>
        
        <!-- 主内容区 -->
        <div style="flex: 1; display: flex; overflow: hidden;">
            <!-- 侧边栏 -->
            <div style="width: 200px; background: #0d0d0d; border-right: 1px solid #333; overflow-y: auto;">
                <div style="padding: 10px; border-bottom: 1px solid #333;">
                    <div style="font-size: 11px; color: #888; font-weight: bold; margin-bottom: 8px;">快速访问</div>
                    <div id="quick-access-list"></div>
                </div>
                <div style="padding: 10px; border-bottom: 1px solid #333;">
                    <div style="font-size: 11px; color: #888; font-weight: bold; margin-bottom: 8px;">常用位置</div>
                    <div id="common-locations-list">
                        <div class="sidebar-item" data-path="desktop" style="padding: 6px 10px; cursor: pointer; border-radius: 4px; margin-bottom: 4px; font-size: 12px; color: #e0e0e0; display: flex; align-items: center; gap: 8px;">
                            <span>🖥️</span>
                            <span>桌面</span>
                        </div>
                    </div>
                </div>
                <div style="padding: 10px;">
                    <div style="font-size: 11px; color: #888; font-weight: bold; margin-bottom: 8px;">此电脑</div>
                    <div id="drives-list"></div>
                </div>
            </div>
            
            <!-- 文件区域 -->
            <div style="flex: 1; display: flex; flex-direction: column; background: #1a1a1a;">
                <!-- 当前位置栏 -->
                <div style="padding: 10px 15px; background: #0d0d0d; border-bottom: 1px solid #333;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: #888; font-size: 13px; font-weight: bold;">当前位置:</span>
                        <div id="current-path-display" style="flex: 1; padding: 6px 12px; background: #2a2a2a; border: 1px solid #444; color: #e0e0e0; border-radius: 4px; font-size: 13px; overflow-x: auto; white-space: nowrap;">M:\</div>
                    </div>
                </div>
                
                <!-- 视图工具栏 -->
                <div style="padding: 8px 15px; background: #0d0d0d; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; gap: 5px;">
                        <button id="view-grid" style="padding: 5px 10px; background: #667eea; border: 1px solid #667eea; color: white; cursor: pointer; border-radius: 3px; font-size: 12px;">🔳 大图标</button>
                        <button id="view-list" style="padding: 5px 10px; background: #2a2a2a; border: 1px solid #444; color: #e0e0e0; cursor: pointer; border-radius: 3px; font-size: 12px;">☰ 列表</button>
                    </div>
                    <select id="sort-select" style="padding: 5px 10px; background: #2a2a2a; border: 1px solid #444; color: #e0e0e0; border-radius: 3px; font-size: 12px;">
                        <option value="name">按名称</option>
                        <option value="date">按日期</option>
                        <option value="size">按大小</option>
                        <option value="type">按类型</option>
                    </select>
                </div>
                
                <!-- 文件内容 -->
                <div id="content-area" style="flex: 1; padding: 15px; overflow: auto; background: #1a1a1a;">
                    <div style="text-align: center; padding: 50px; color: #888;">
                        <div style="font-size: 48px; margin-bottom: 20px;">⏳</div>
                        <p style="color: #999;">正在加载...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 状态栏 -->
        <div id="status-bar" style="
            padding: 8px 15px;
            background: #0d0d0d;
            border-top: 1px solid #333;
            font-size: 12px;
            color: #888;
            border-radius: 0 0 10px 10px;
        ">
            准备就绪
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(browser);
    
    // 绑定事件
    document.getElementById('close-btn').addEventListener('click', () => {
        browser.style.display = 'none';
    });
    
    document.getElementById('back-btn').addEventListener('click', goBack);
    document.getElementById('forward-btn').addEventListener('click', goForward);
    document.getElementById('up-btn').addEventListener('click', goUp);
    document.getElementById('refresh-btn').addEventListener('click', refresh);
    
    document.getElementById('view-grid').addEventListener('click', () => switchView('grid'));
    document.getElementById('view-list').addEventListener('click', () => switchView('list'));
    document.getElementById('sort-select').addEventListener('change', (e) => sortFiles(e.target.value));
    
    // ESC键关闭浏览器窗口 - 修复：只处理ESC键，且只在浏览器打开时处理
    const browserKeyHandler = (e) => {
        // 只处理ESC键，避免干扰其他键盘操作（如Ctrl+V粘贴）
        if (e.key === 'Escape') {
            const browser = document.getElementById('catsee-browser');
            const previewOverlay = document.getElementById('file-preview-overlay');
            
            // 如果有预览弹窗，优先关闭预览弹窗
            if (previewOverlay) {
                return; // 预览弹窗有自己的ESC处理
            }
            
            // 只有在浏览器窗口打开时才处理ESC键
            if (browser && browser.style.display !== 'none') {
                browser.style.display = 'none';
                e.preventDefault(); // 阻止默认行为
                e.stopPropagation(); // 阻止事件冒泡
            }
        }
        // 移除了对其他键的处理，避免干扰ComfyUI的键盘快捷键
    };
    document.addEventListener('keydown', browserKeyHandler);
    
    // 初始化：加载侧边栏和驱动器
    initializeBrowser();
    
    console.log('[CatSee] 浏览器窗口创建成功');
}

// 全局变量
let currentPath = '';
let pathHistory = [];
let historyIndex = -1;
let currentView = 'grid';
let currentSort = 'name';
let allItems = [];

// 初始化浏览器
async function initializeBrowser() {
    await loadSidebar();
    bindCommonLocationsEvents(); // 绑定常用位置事件
    showDrivesInMain();
}

// 加载侧边栏
async function loadSidebar() {
    // 加载快速访问
    try {
        const response = await fetch('/browser/api/quick-access');
        const result = await response.json();
        if (result.success && result.data) {
            renderQuickAccess(result.data);
        }
    } catch (error) {
        console.log('[CatSee] Quick access not available');
    }
    
    // 加载驱动器到侧边栏
    try {
        const response = await fetch('/browser/api/drives');
        const text = await response.text();
        console.log('[CatSee] Drives API raw response:', text);
        
        if (!text || text.trim() === '') {
            console.error('[CatSee] Drives API returned empty response');
            return;
        }
        
        const result = JSON.parse(text);
        console.log('[CatSee] Drives API parsed:', result);
        
        if (result.success && result.data && result.data.length > 0) {
            renderSidebarDrives(result.data);
        } else {
            console.warn('[CatSee] No drives found or API failed:', result);
        }
    } catch (error) {
        console.error('[CatSee] Error loading drives:', error);
    }
}

// 渲染快速访问
function renderQuickAccess(items) {
    const quickList = document.getElementById('quick-access-list');
    if (!quickList) return;
    
    // 添加桌面按钮（从快速访问中查找桌面路径）
    const desktopItem = items.find(item => item.name === '桌面' || item.name === 'Desktop');
    const desktopButton = desktopItem ? `
        <div class="sidebar-item desktop-btn" data-path="${desktopItem.path.replace(/\\/g, '\\\\')}" style="
            padding: 6px 8px;
            cursor: pointer;
            border-radius: 3px;
            font-size: 12px;
            color: #e0e0e0;
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 4px;
            background: #2a2a2a;
            border: 1px solid #444;
        ">
            <span>🖥️</span>
            <span>桌面</span>
        </div>
    ` : '';
    
    // 过滤掉原有的桌面项
    const filteredItems = items.filter(item => item.name !== '桌面' && item.name !== 'Desktop');
    
    quickList.innerHTML = desktopButton + filteredItems.map(item => `
        <div class="sidebar-item" data-path="${item.path.replace(/\\/g, '\\\\')}" style="
            padding: 6px 8px;
            cursor: pointer;
            border-radius: 3px;
            font-size: 12px;
            color: #e0e0e0;
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 2px;
        ">
            <span>${item.icon || '📁'}</span>
            <span>${item.name}</span>
        </div>
    `).join('');
    
    quickList.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', function() {
            browsePath(this.dataset.path);
        });
        item.addEventListener('mouseenter', function() {
            this.style.background = '#2a2a2a';
        });
        item.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
        });
    });
}

// 绑定常用位置点击事件
function bindCommonLocationsEvents() {
    const commonLocationsList = document.getElementById('common-locations-list');
    if (!commonLocationsList) return;
    
    commonLocationsList.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', async function() {
            const location = this.dataset.path;
            
            if (location === 'desktop') {
                // 获取桌面路径
                try {
                    const response = await fetch('/browser/api/desktop');
                    const result = await response.json();
                    
                    if (result.success && result.path) {
                        browsePath(result.path);
                    } else {
                        alert('❌ 无法获取桌面路径');
                    }
                } catch (error) {
                    console.error('[CatSee] 获取桌面路径失败:', error);
                    alert('❌ 获取桌面路径失败');
                }
            }
        });
        
        item.addEventListener('mouseenter', function() {
            this.style.background = '#2a2a2a';
        });
        item.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
        });
    });
}

// 渲染侧边栏驱动器
function renderSidebarDrives(drives) {
    const drivesList = document.getElementById('drives-list');
    if (!drivesList) return;
    
    console.log('[CatSee] Rendering', drives.length, 'drives in sidebar');
    
    drivesList.innerHTML = drives.map(drive => `
        <div class="sidebar-item" data-path="${drive.path.replace(/\\/g, '\\\\')}" style="
            padding: 6px 8px;
            cursor: pointer;
            border-radius: 3px;
            font-size: 12px;
            color: #e0e0e0;
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 2px;
        ">
            <span>💿</span>
            <span>${drive.name}</span>
        </div>
    `).join('');
    
    drivesList.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', function() {
            browsePath(this.dataset.path);
        });
        item.addEventListener('mouseenter', function() {
            this.style.background = '#2a2a2a';
        });
        item.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
        });
    });
}

// 在主区域显示驱动器
async function showDrivesInMain() {
    const contentArea = document.getElementById('content-area');
    const statusBar = document.getElementById('status-bar');
    
    if (!contentArea || !statusBar) return;
    
    statusBar.textContent = '正在加载驱动器...';
    contentArea.innerHTML = '<div style="text-align: center; padding: 50px; color: #888;"><div style="font-size: 48px; margin-bottom: 20px;">⏳</div><p style="color: #999;">正在加载驱动器...</p></div>';
    
    try {
        const response = await fetch('/browser/api/drives');
        const text = await response.text();
        
        console.log('[CatSee] Drives API response (main):', text);
        
        if (!text || text.trim() === '') {
            showError('API返回空响应，请检查后端');
            return;
        }
        
        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            console.error('[CatSee] JSON parse error:', e);
            console.error('[CatSee] Response text:', text);
            showError('API返回格式错误: ' + text.substring(0, 100));
            return;
        }
        
        console.log('[CatSee] Drives parsed result:', result);
        
        if (result.success && result.data && result.data.length > 0) {
            const drives = result.data;
            console.log('[CatSee] Found', drives.length, 'drives');
            
            contentArea.innerHTML = `
                <div style="max-width: 1000px; margin: 0 auto;">
                    <h2 style="color: #e0e0e0; margin-bottom: 20px; font-size: 20px;">选择驱动器</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px;">
                        ${drives.map(d => `
                            <div class="drive-item" data-path="${d.path.replace(/\\/g, '\\\\')}" style="
                                padding: 20px;
                                background: #2a2a2a;
                                border: 2px solid #444;
                                border-radius: 8px;
                                cursor: pointer;
                                text-align: center;
                                transition: all 0.2s;
                            ">
                                <div style="font-size: 48px; margin-bottom: 10px;">💿</div>
                                <div style="font-weight: bold; color: #e0e0e0; font-size: 13px;">${d.name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            // 绑定点击事件
            document.querySelectorAll('.drive-item').forEach(item => {
                item.addEventListener('click', function() {
                    browsePath(this.dataset.path);
                });
                item.addEventListener('mouseenter', function() {
                    this.style.background = '#333';
                    this.style.borderColor = '#667eea';
                });
                item.addEventListener('mouseleave', function() {
                    this.style.background = '#2a2a2a';
                    this.style.borderColor = '#444';
                });
            });
            
            statusBar.textContent = `找到 ${drives.length} 个驱动器`;
            currentPath = '';
            
        } else {
            showError('未找到驱动器');
        }
    } catch (error) {
        console.error('[CatSee] Error loading drives:', error);
        showError('加载驱动器失败: ' + error.message);
    }
}

// 浏览路径
async function browsePath(path) {
    console.log('[CatSee] browsePath called with:', path);
    
    const contentArea = document.getElementById('content-area');
    const statusBar = document.getElementById('status-bar');
    const currentPathDisplay = document.getElementById('current-path-display');
    
    if (!contentArea || !statusBar) {
        console.error('[CatSee] Missing elements:', { contentArea, statusBar });
        return;
    }
    
    console.log('[CatSee] Browsing:', path);
    
    // 更新当前位置显示
    if (currentPathDisplay) {
        currentPathDisplay.textContent = path || 'M:\\';
    }
    
    statusBar.textContent = '正在加载 ' + path + '...';
    contentArea.innerHTML = '<div style="text-align: center; padding: 50px; color: #888;"><div style="font-size: 48px; margin-bottom: 20px;">⏳</div><p style="color: #999;">正在加载...</p></div>';
    
    try {
        const response = await fetch('/browser/api/browse?path=' + encodeURIComponent(path));
        const text = await response.text();
        
        console.log('[CatSee] Browse response:', text.substring(0, 200));
        
        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            console.error('[CatSee] JSON parse error:', e);
            showError('API返回格式错误');
            return;
        }
        
        if (result.success && result.data) {
            const items = result.data.items || [];
            console.log('[CatSee] Found', items.length, 'items');
            
            // 保存到历史
            if (currentPath !== path) {
                if (historyIndex < pathHistory.length - 1) {
                    pathHistory = pathHistory.slice(0, historyIndex + 1);
                }
                pathHistory.push(path);
                historyIndex = pathHistory.length - 1;
            }
            currentPath = path;
            allItems = items;
            
            // 更新面包屑
            updateBreadcrumb(path);
            
            // 显示文件
            showFiles(items, path);
            
            // 更新状态栏
            const folders = items.filter(i => i.is_folder).length;
            const files = items.length - folders;
            statusBar.textContent = `${items.length} 个项目 | ${folders} 个文件夹, ${files} 个文件`;
            
        } else {
            showError(result.error || '无法访问此位置');
        }
    } catch (error) {
        console.error('[CatSee] Browse error:', error);
        showError('加载失败: ' + error.message);
    }
}

// 显示文件列表
function showFiles(items, path) {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;
    
    if (items.length === 0) {
        contentArea.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #888;">
                <div style="font-size: 48px; margin-bottom: 10px;">📁</div>
                <p style="color: #999;">此文件夹为空</p>
            </div>
        `;
        return;
    }
    
    // 根据视图模式渲染
    if (currentView === 'grid') {
        renderGridView(items, path, contentArea);
    } else {
        renderListView(items, path, contentArea);
    }
    
    // 绑定点击事件
    bindFileItemEvents();
}

// 网格视图
function renderGridView(items, path, contentArea) {
    contentArea.innerHTML = `
        <div style="padding: 0 15px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px;">
                ${items.map(item => {
                    const isFolder = item.is_folder;
                    const icon = getFileIcon(item.name, isFolder);
                    const displayName = item.name.length > 18 ? item.name.substring(0, 15) + '...' : item.name;
                    const isImage = !isFolder && isImageFile(item.name);
                    const isVideo = !isFolder && isVideoFile(item.name);
                    
                    return `
                        <div class="file-item" data-path="${item.path.replace(/\\/g, '\\\\')}" data-is-folder="${isFolder}" data-item='${JSON.stringify(item).replace(/'/g, "&apos;")}' style="
                            padding: 10px;
                            background: #2a2a2a;
                            border: 1px solid #444;
                            border-radius: 6px;
                            cursor: pointer;
                            text-align: center;
                            transition: all 0.2s;
                        ">
                            ${isImage ? `
                                <div style="width: 80px; height: 80px; margin: 0 auto 8px; background: #1a1a1a; border-radius: 4px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                                    <img src="/browser/api/thumbnail?path=${encodeURIComponent(item.path)}" style="max-width: 100%; max-height: 100%; object-fit: contain;" 
                                         onload="console.log('[CatSee] 缩略图加载成功:', '${item.name}')" 
                                         onerror="console.error('[CatSee] 缩略图加载失败:', '${item.name}', this.src); this.style.display='none'; this.parentElement.innerHTML='<div style=\\'font-size: 32px;\\'>${icon}</div>'">
                                </div>
                            ` : isVideo ? `
                                <div style="width: 80px; height: 80px; margin: 0 auto 8px; background: #1a1a1a; border-radius: 4px; display: flex; align-items: center; justify-content: center; position: relative;">
                                    <div style="font-size: 32px;">${icon}</div>
                                    <div style="position: absolute; bottom: 5px; right: 5px; font-size: 16px; opacity: 0.8;">▶️</div>
                                </div>
                            ` : `
                                <div style="font-size: 32px; margin-bottom: 8px;">${icon}</div>
                            `}
                            <div style="font-size: 11px; color: #e0e0e0; word-break: break-word; line-height: 1.3;" title="${item.name}">${displayName}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// 列表视图
function renderListView(items, path, contentArea) {
    contentArea.innerHTML = `
        <div style="padding: 0 15px;">
            <div style="background: #2a2a2a; border-radius: 6px; border: 1px solid #444; overflow: hidden;">
                <!-- 表头 -->
                <div style="display: grid; grid-template-columns: 40px 1fr 120px 150px; padding: 10px 15px; background: #1a1a1a; border-bottom: 1px solid #444; font-size: 12px; color: #888; font-weight: bold;">
                    <div></div>
                    <div>名称</div>
                    <div>大小</div>
                    <div>修改时间</div>
                </div>
                <!-- 文件列表 -->
                ${items.map(item => {
                    const isFolder = item.is_folder;
                    const icon = getFileIcon(item.name, isFolder);
                    const size = isFolder ? '-' : formatFileSize(item.size || 0);
                    const time = formatTime(item.modified_time);
                    
                    return `
                        <div class="file-item" data-path="${item.path.replace(/\\/g, '\\\\')}" data-is-folder="${isFolder}" data-item='${JSON.stringify(item).replace(/'/g, "&apos;")}' style="
                            display: grid;
                            grid-template-columns: 40px 1fr 120px 150px;
                            padding: 8px 15px;
                            border-bottom: 1px solid #333;
                            cursor: pointer;
                            transition: background 0.2s;
                            align-items: center;
                        ">
                            <div style="font-size: 24px;">${icon}</div>
                            <div style="color: #e0e0e0; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.name}">${item.name}</div>
                            <div style="color: #999; font-size: 12px;">${size}</div>
                            <div style="color: #999; font-size: 12px;">${time}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// 绑定文件项事件
function bindFileItemEvents() {
    const allItems = Array.from(document.querySelectorAll('.file-item'));
    
    allItems.forEach((item, index) => {
        item.addEventListener('click', async function() {
            const path = this.dataset.path;
            const isFolder = this.dataset.isFolder === 'true';
            
            if (isFolder) {
                browsePath(path);
            } else {
                // 点击文件，显示预览
                const itemData = JSON.parse(this.dataset.item || '{}');
                
                // 获取所有文件（非文件夹）的列表
                const fileList = allItems
                    .filter(el => el.dataset.isFolder !== 'true')
                    .map(el => JSON.parse(el.dataset.item || '{}'));
                
                // 找到当前文件在列表中的索引
                const fileIndex = fileList.findIndex(f => f.path === itemData.path);
                
                await showFilePreview(itemData, fileList, fileIndex);
            }
        });
        
        item.addEventListener('mouseenter', function() {
            this.style.background = '#333';
            if (currentView === 'grid') {
                this.style.borderColor = '#667eea';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.background = currentView === 'grid' ? '#2a2a2a' : 'transparent';
            if (currentView === 'grid') {
                this.style.borderColor = '#444';
            }
        });
    });
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 格式化时间
function formatTime(timestamp) {
    if (!timestamp) return '-';
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
}

// HTML转义函数
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 复制到剪贴板函数（全局）
window.copyToClipboard = function(text, button) {
    // 解码HTML实体
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    const decodedText = textarea.value;
    
    // 复制到剪贴板
    navigator.clipboard.writeText(decodedText).then(() => {
        // 显示成功提示
        const originalText = button.innerHTML;
        button.innerHTML = '✓ 已复制';
        button.style.background = 'rgba(76, 175, 80, 0.8)';
        
        // 2秒后恢复
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = 'rgba(102, 126, 234, 0.8)';
        }, 2000);
    }).catch(err => {
        console.error('[CatSee] 复制失败:', err);
        button.innerHTML = '✗ 失败';
        button.style.background = 'rgba(244, 67, 54, 0.8)';
        
        setTimeout(() => {
            button.innerHTML = '📋 复制';
            button.style.background = 'rgba(102, 126, 234, 0.8)';
        }, 2000);
    });
};

// 全局变量：当前文件列表和索引
let currentFileList = [];
let currentFileIndex = -1;

// 显示文件预览
async function showFilePreview(item, fileList = null, fileIndex = -1) {
    console.log('[CatSee] 显示文件预览:', item.name);
    
    // 保存文件列表和索引，用于切换
    if (fileList) {
        currentFileList = fileList;
        currentFileIndex = fileIndex;
    }
    
    // 如果是图片，异步获取详细元数据（不阻塞预览窗口显示）
    const isImage = isImageFile(item.name);
    let metadataPromise = null;
    
    if (isImage) {
        metadataPromise = fetch(`/browser/api/metadata?path=${encodeURIComponent(item.path)}`)
            .then(async response => {
                console.log('[CatSee] 元数据响应状态:', response.status);
                
                // 先获取原始文本
                const text = await response.text();
                console.log('[CatSee] 元数据响应内容:', text.substring(0, 200));
                
                // 尝试解析JSON
                try {
                    const result = JSON.parse(text);
                    if (result.success && result.data) {
                        console.log('[CatSee] 元数据获取成功');
                        return result.data;
                    }
                    console.warn('[CatSee] 元数据响应失败:', result.error);
                    return null;
                } catch (e) {
                    console.error('[CatSee] JSON解析失败:', e);
                    console.error('[CatSee] 原始响应:', text);
                    return null;
                }
            })
            .catch(error => {
                console.error('[CatSee] 元数据请求错误:', error);
                return null;
            });
    }
    
    // 创建预览弹窗
    const overlay = document.createElement('div');
    overlay.id = 'file-preview-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    const isVideo = isVideoFile(item.name);
    const isJson = item.extension === '.json';
    
    overlay.innerHTML = `
        <div style="
            width: 90%;
            height: 90%;
            background: #1a1a1a;
            border-radius: 12px;
            border: 1px solid #444;
            display: flex;
            overflow: hidden;
        ">
            <!-- 左侧：预览区 -->
            <div style="
                flex: 1;
                background: #0d0d0d;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                position: relative;
            ">
                <!-- 左箭头 -->
                ${currentFileIndex > 0 ? `
                    <button id="prev-file-btn" style="
                        position: absolute;
                        left: 20px;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 50px;
                        height: 50px;
                        border-radius: 50%;
                        background: rgba(102, 126, 234, 0.8);
                        border: 2px solid rgba(255, 255, 255, 0.3);
                        color: white;
                        font-size: 24px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.3s;
                        z-index: 10;
                    " onmouseover="this.style.background='rgba(102, 126, 234, 1)'; this.style.transform='translateY(-50%) scale(1.1)';" 
                       onmouseout="this.style.background='rgba(102, 126, 234, 0.8)'; this.style.transform='translateY(-50%) scale(1)';">
                        ◀
                    </button>
                ` : ''}
                
                <!-- 右箭头 -->
                ${currentFileIndex >= 0 && currentFileIndex < currentFileList.length - 1 ? `
                    <button id="next-file-btn" style="
                        position: absolute;
                        right: 20px;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 50px;
                        height: 50px;
                        border-radius: 50%;
                        background: rgba(102, 126, 234, 0.8);
                        border: 2px solid rgba(255, 255, 255, 0.3);
                        color: white;
                        font-size: 24px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.3s;
                        z-index: 10;
                    " onmouseover="this.style.background='rgba(102, 126, 234, 1)'; this.style.transform='translateY(-50%) scale(1.1)';" 
                       onmouseout="this.style.background='rgba(102, 126, 234, 0.8)'; this.style.transform='translateY(-50%) scale(1)';">
                        ▶
                    </button>
                ` : ''}
                
                ${isImage ? `
                    <img src="/browser/api/image?path=${encodeURIComponent(item.path)}" 
                         style="max-width: 95%; max-height: 95%; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);"
                         onload="console.log('[CatSee] 预览图片加载成功');"
                         onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'text-align: center; color: #f44336;\\'><div style=\\'font-size: 64px; margin-bottom: 20px;\\'>❌</div><p style=\\'font-size: 18px;\\'>图片加载失败</p></div>';">
                ` : isVideo ? `
                    <div id="video-player-container" style="
                        width: 100%;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                    ">
                        <canvas id="video-canvas" style="
                            max-width: 95%;
                            max-height: 80%;
                            background: #000;
                            border-radius: 8px;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                        "></canvas>
                        <div id="video-controls" style="
                            width: 95%;
                            max-width: 800px;
                            margin-top: 15px;
                            padding: 12px;
                            background: rgba(0, 0, 0, 0.8);
                            border-radius: 8px;
                            display: flex;
                            flex-direction: column;
                            gap: 10px;
                        ">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <button id="video-play-pause" style="
                                    width: 40px;
                                    height: 40px;
                                    background: rgba(102, 126, 234, 0.9);
                                    border: none;
                                    border-radius: 50%;
                                    color: white;
                                    font-size: 18px;
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    transition: all 0.2s;
                                ">▶️</button>
                                <div style="flex: 1; display: flex; align-items: center; gap: 10px;">
                                    <span id="video-current-time" style="color: #e0e0e0; font-size: 12px; min-width: 50px;">00:00</span>
                                    <div id="video-progress-container" style="
                                        flex: 1;
                                        height: 6px;
                                        background: #333;
                                        border-radius: 3px;
                                        cursor: pointer;
                                        position: relative;
                                    ">
                                        <div id="video-progress-bar" style="
                                            height: 100%;
                                            width: 0%;
                                            background: #667eea;
                                            border-radius: 3px;
                                            transition: width 0.1s;
                                        "></div>
                                        <div id="video-progress-handle" style="
                                            position: absolute;
                                            top: 50%;
                                            left: 0%;
                                            transform: translate(-50%, -50%);
                                            width: 14px;
                                            height: 14px;
                                            background: #667eea;
                                            border: 2px solid white;
                                            border-radius: 50%;
                                            cursor: pointer;
                                            opacity: 0;
                                            transition: opacity 0.2s;
                                        "></div>
                                    </div>
                                    <span id="video-duration" style="color: #e0e0e0; font-size: 12px; min-width: 50px;">00:00</span>
                                </div>
                                <button id="video-volume-btn" style="
                                    width: 40px;
                                    height: 40px;
                                    background: transparent;
                                    border: none;
                                    color: #e0e0e0;
                                    font-size: 18px;
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                ">🔊</button>
                                <div id="video-volume-container" style="
                                    width: 80px;
                                    height: 6px;
                                    background: #333;
                                    border-radius: 3px;
                                    cursor: pointer;
                                    position: relative;
                                ">
                                    <div id="video-volume-bar" style="
                                        height: 100%;
                                        width: 100%;
                                        background: #667eea;
                                        border-radius: 3px;
                                    "></div>
                                </div>
                                <button id="video-fullscreen-btn" style="
                                    width: 40px;
                                    height: 40px;
                                    background: transparent;
                                    border: none;
                                    color: #e0e0e0;
                                    font-size: 18px;
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                ">⛶</button>
                            </div>
                        </div>
                    </div>
                ` : isJson ? `
                    <div style="text-align: center; color: #666;">
                        <div style="font-size: 128px; margin-bottom: 20px;">⚙️</div>
                        <p style="font-size: 18px;">JSON文件</p>
                        <p style="font-size: 14px; color: #888;">${item.name}</p>
                    </div>
                ` : `
                    <div style="text-align: center; color: #666;">
                        <div style="font-size: 128px; margin-bottom: 20px;">📄</div>
                        <p style="font-size: 18px;">无法预览</p>
                        <p style="font-size: 14px; color: #888;">${item.name}</p>
                    </div>
                `}
                
                <!-- 导入图片按钮 -->
                ${isImage ? `
                    <button id="import-image-btn" style="
                        position: absolute;
                        top: 20px;
                        right: 220px;
                        padding: 8px 16px;
                        background: rgba(76, 175, 80, 0.9);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        border-radius: 20px;
                        color: white;
                        font-size: 14px;
                        cursor: pointer;
                        transition: all 0.2s;
                        font-weight: bold;
                    " onmouseover="this.style.background='rgba(76, 175, 80, 1)'; this.style.transform='scale(1.05)'" 
                       onmouseout="this.style.background='rgba(76, 175, 80, 0.9)'; this.style.transform='scale(1)'">
                        🖼️ 导入图片
                    </button>
                ` : ''}
                
                <!-- 导入工作流按钮 -->
                ${isImage ? `
                    <button id="import-workflow-btn" style="
                        position: absolute;
                        top: 20px;
                        right: 70px;
                        padding: 8px 16px;
                        background: rgba(102, 126, 234, 0.9);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        border-radius: 20px;
                        color: white;
                        font-size: 14px;
                        cursor: pointer;
                        transition: all 0.2s;
                        font-weight: bold;
                    " onmouseover="this.style.background='rgba(102, 126, 234, 1)'; this.style.transform='scale(1.05)'" 
                       onmouseout="this.style.background='rgba(102, 126, 234, 0.9)'; this.style.transform='scale(1)'">
                        📥 导入工作流
                    </button>
                ` : ''}
                
                <!-- 关闭按钮 -->
                <button id="close-preview" style="
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: 40px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid #666;
                    border-radius: 50%;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    transition: all 0.2s;
                ">✕</button>
            </div>
            
            <!-- 右侧：信息面板 -->
            <div style="
                width: 320px;
                background: #2a2a2a;
                border-left: 1px solid #444;
                padding: 25px;
                overflow-y: auto;
            ">
                <h3 style="
                    font-size: 16px;
                    margin: 0 0 20px;
                    color: #667eea;
                    border-bottom: 2px solid #667eea;
                    padding-bottom: 10px;
                ">文件信息</h3>
                
                <div style="margin-bottom: 18px;">
                    <div style="font-size: 11px; color: #888; margin-bottom: 5px; font-weight: bold;">文件名</div>
                    <div style="font-size: 13px; color: #e0e0e0; word-break: break-all; line-height: 1.4;">${item.name}</div>
                </div>
                
                <div style="margin-bottom: 18px;">
                    <div style="font-size: 11px; color: #888; margin-bottom: 5px; font-weight: bold;">文件大小</div>
                    <div style="font-size: 13px; color: #e0e0e0;">${formatFileSize(item.size || 0)}</div>
                </div>
                
                <div style="margin-bottom: 18px;">
                    <div style="font-size: 11px; color: #888; margin-bottom: 5px; font-weight: bold;">文件类型</div>
                    <div style="font-size: 13px; color: #e0e0e0;">${item.extension || '未知'}</div>
                </div>
                
                <div style="margin-bottom: 18px;">
                    <div style="font-size: 11px; color: #888; margin-bottom: 5px; font-weight: bold;">创建时间</div>
                    <div style="font-size: 13px; color: #e0e0e0;">${formatTime(item.created_time)}</div>
                </div>
                
                <div style="margin-bottom: 18px;">
                    <div style="font-size: 11px; color: #888; margin-bottom: 5px; font-weight: bold;">修改时间</div>
                    <div style="font-size: 13px; color: #e0e0e0;">${formatTime(item.modified_time)}</div>
                </div>
                
                <div style="margin-bottom: 18px;">
                    <div style="font-size: 11px; color: #888; margin-bottom: 5px; font-weight: bold;">完整路径</div>
                    <div style="font-size: 11px; color: #999; word-break: break-all; line-height: 1.5; background: #1a1a1a; padding: 10px; border-radius: 4px;">${item.path}</div>
                </div>
                
                ${isImage && item.width ? `
                    <div style="margin-bottom: 18px;">
                        <div style="font-size: 11px; color: #888; margin-bottom: 5px; font-weight: bold;">图片尺寸</div>
                        <div style="font-size: 13px; color: #e0e0e0;">${item.width} × ${item.height}</div>
                    </div>
                ` : ''}
                
                ${isImage ? `
                    <div id="metadata-loading" style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #444; text-align: center; color: #667eea;">
                        <div style="font-size: 14px;">⏳ 正在加载元数据...</div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // 如果是视频，初始化视频播放器
    if (isVideo) {
        initVideoPlayer(item.path);
    }
    
    // 绑定关闭事件
    const closeBtn = document.getElementById('close-preview');
    closeBtn.addEventListener('click', () => {
        // 清理视频播放器
        if (videoPlayer && videoPlayer.cleanup) {
            videoPlayer.cleanup();
            videoPlayer = null;
        }
        overlay.remove();
    });
    
    closeBtn.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(255, 255, 255, 0.2)';
        this.style.transform = 'scale(1.1)';
    });
    
    closeBtn.addEventListener('mouseleave', function() {
        this.style.background = 'rgba(255, 255, 255, 0.1)';
        this.style.transform = 'scale(1)';
    });
    
    // 绑定导入图片按钮事件
    const importImageBtn = document.getElementById('import-image-btn');
    if (importImageBtn && isImage) {
        importImageBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            try {
                // 检查ComfyUI对象
                if (!window.app || !window.app.graph) {
                    throw new Error('ComfyUI app对象未找到');
                }
                
                // 先上传图片到ComfyUI的input目录
                const imageUrl = `/browser/api/image?path=${encodeURIComponent(item.path)}`;
                
                // 获取图片数据
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                
                // 创建FormData上传图片
                const formData = new FormData();
                formData.append('image', blob, item.name);
                formData.append('overwrite', 'true');
                
                // 上传到ComfyUI
                const uploadResponse = await fetch('/upload/image', {
                    method: 'POST',
                    body: formData
                });
                
                if (!uploadResponse.ok) {
                    throw new Error('图片上传失败');
                }
                
                const uploadResult = await uploadResponse.json();
                const uploadedFilename = uploadResult.name || item.name;
                
                // 创建LoadImage节点
                const node = window.LiteGraph.createNode('LoadImage');
                if (!node) {
                    throw new Error('无法创建LoadImage节点');
                }
                
                // 设置节点位置（画布中心）
                const canvasCenter = window.app.canvas.ds.offset;
                node.pos = [
                    -canvasCenter[0] + window.innerWidth / 2 - 100,
                    -canvasCenter[1] + window.innerHeight / 2 - 50
                ];
                
                // 添加节点到图
                window.app.graph.add(node);
                
                // 设置图片
                if (node.widgets) {
                    const imageWidget = node.widgets.find(w => w.name === 'image');
                    if (imageWidget) {
                        imageWidget.value = uploadedFilename;
                    }
                }
                
                // 刷新画布
                window.app.graph.setDirtyCanvas(true, true);
                
                importImageBtn.innerHTML = '✓ 已导入';
                importImageBtn.style.background = 'rgba(76, 175, 80, 1)';
                
                console.log('[CatSee] 图片导入成功:', uploadedFilename);
                
                setTimeout(() => {
                    importImageBtn.innerHTML = '🖼️ 导入图片';
                    importImageBtn.style.background = 'rgba(76, 175, 80, 0.9)';
                }, 2000);
            } catch (error) {
                console.error('[CatSee] 导入图片失败:', error);
                alert('❌ 导入图片失败: ' + error.message);
                importImageBtn.innerHTML = '✗ 导入失败';
                importImageBtn.style.background = 'rgba(244, 67, 54, 0.9)';
                
                setTimeout(() => {
                    importImageBtn.innerHTML = '🖼️ 导入图片';
                    importImageBtn.style.background = 'rgba(76, 175, 80, 0.9)';
                }, 2000);
            }
        });
    }
    
    // 绑定导入工作流按钮事件
    const importBtn = document.getElementById('import-workflow-btn');
    if (importBtn && isImage) {
        importBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            // 获取元数据
            const metadata = await metadataPromise;
            if (!metadata || !metadata.comfy_workflow) {
                alert('❌ 此图片没有ComfyUI工作流信息');
                return;
            }
            
            try {
                // 直接使用ComfyUI的app对象导入工作流
                if (window.app && window.app.loadGraphData) {
                    // 清空当前工作流
                    window.app.graph.clear();
                    
                    // 加载新工作流
                    await window.app.loadGraphData(metadata.comfy_workflow);
                    
                    importBtn.innerHTML = '✓ 已导入';
                    importBtn.style.background = 'rgba(76, 175, 80, 0.9)';
                    
                    console.log('[CatSee] 工作流导入成功');
                    
                    setTimeout(() => {
                        importBtn.innerHTML = '📥 导入工作流';
                        importBtn.style.background = 'rgba(102, 126, 234, 0.9)';
                    }, 2000);
                } else {
                    throw new Error('ComfyUI app对象未找到');
                }
            } catch (error) {
                console.error('[CatSee] 导入工作流失败:', error);
                alert('❌ 导入失败: ' + error.message);
                importBtn.innerHTML = '✗ 导入失败';
                importBtn.style.background = 'rgba(244, 67, 54, 0.9)';
                
                setTimeout(() => {
                    importBtn.innerHTML = '📥 导入工作流';
                    importBtn.style.background = 'rgba(102, 126, 234, 0.9)';
                }, 2000);
            }
        });
    }
    
    // 绑定左右箭头事件
    const prevBtn = document.getElementById('prev-file-btn');
    const nextBtn = document.getElementById('next-file-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentFileIndex > 0) {
                // 清理视频播放器
                if (videoPlayer && videoPlayer.cleanup) {
                    videoPlayer.cleanup();
                    videoPlayer = null;
                }
                overlay.remove();
                const prevItem = currentFileList[currentFileIndex - 1];
                showFilePreview(prevItem, currentFileList, currentFileIndex - 1);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentFileIndex < currentFileList.length - 1) {
                // 清理视频播放器
                if (videoPlayer && videoPlayer.cleanup) {
                    videoPlayer.cleanup();
                    videoPlayer = null;
                }
                overlay.remove();
                const nextItem = currentFileList[currentFileIndex + 1];
                showFilePreview(nextItem, currentFileList, currentFileIndex + 1);
            }
        });
    }
    
    // 点击背景关闭
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            // 清理视频播放器
            if (videoPlayer && videoPlayer.cleanup) {
                videoPlayer.cleanup();
                videoPlayer = null;
            }
            overlay.remove();
        }
    });
    
    // 键盘事件（ESC关闭，左右箭头切换，空格播放/暂停）
    const keyHandler = (e) => {
        if (e.key === 'Escape') {
            // 清理视频播放器
            if (videoPlayer && videoPlayer.cleanup) {
                videoPlayer.cleanup();
                videoPlayer = null;
            }
            overlay.remove();
            document.removeEventListener('keydown', keyHandler);
        } else if (e.key === ' ' && isVideo) {
            // 空格键：播放/暂停视频
            e.preventDefault();
            const playPauseBtn = document.getElementById('video-play-pause');
            if (playPauseBtn) {
                playPauseBtn.click();
            }
        } else if (e.key === 'ArrowLeft' && currentFileIndex > 0) {
            // 左箭头：上一张
            if (videoPlayer && videoPlayer.cleanup) {
                videoPlayer.cleanup();
                videoPlayer = null;
            }
            overlay.remove();
            document.removeEventListener('keydown', keyHandler);
            const prevItem = currentFileList[currentFileIndex - 1];
            showFilePreview(prevItem, currentFileList, currentFileIndex - 1);
        } else if (e.key === 'ArrowRight' && currentFileIndex < currentFileList.length - 1) {
            // 右箭头：下一张
            if (videoPlayer && videoPlayer.cleanup) {
                videoPlayer.cleanup();
                videoPlayer = null;
            }
            overlay.remove();
            document.removeEventListener('keydown', keyHandler);
            const nextItem = currentFileList[currentFileIndex + 1];
            showFilePreview(nextItem, currentFileList, currentFileIndex + 1);
        }
    };
    document.addEventListener('keydown', keyHandler);
    
    // 如果有元数据Promise，等待并更新信息面板
    if (metadataPromise && isImage) {
        metadataPromise.then(metadata => {
            if (!document.getElementById('file-preview-overlay')) return;
            
            // 移除加载提示
            const loadingDiv = document.getElementById('metadata-loading');
            if (loadingDiv) {
                loadingDiv.remove();
            }
            
            // 如果没有元数据，显示提示
            if (!metadata) {
                const infoPanel = overlay.querySelector('[style*="width: 320px"]');
                if (infoPanel) {
                    infoPanel.insertAdjacentHTML('beforeend', `
                        <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #444; text-align: center; color: #888;">
                            <div style="font-size: 14px;">无元数据信息</div>
                        </div>
                    `);
                }
                return;
            }
            
            // 查找信息面板并更新
            const infoPanel = overlay.querySelector('[style*="width: 320px"]');
            if (!infoPanel) return;
            
            // 构建元数据HTML
            let metadataHtml = '';
            
            // 调试：打印元数据
            console.log('[CatSee] 完整元数据:', metadata);
            console.log('[CatSee] AI模型检查:', {
                ai_model: metadata.ai_model,
                comfy_models: metadata.comfy_models,
                ai_loras: metadata.ai_loras,
                comfy_prompts: metadata.comfy_prompts,
                parsed_params: metadata.parsed_params
            });
            
            // AI模型信息概览（新增）
            if (metadata.ai_model || metadata.comfy_models || metadata.ai_loras) {
                metadataHtml += `
                    <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #444;">
                        <h4 style="font-size: 14px; margin: 0 0 15px; color: #667eea;">🤖 AI模型信息</h4>
                        <div style="display: grid; grid-template-columns: 1fr; gap: 8px; font-size: 11px;">
                            ${metadata.ai_model ? `
                                <div style="background: #1a1a1a; padding: 8px; border-radius: 4px; border-left: 3px solid #667eea;">
                                    <div style="color: #888; margin-bottom: 4px;">🎯 主模型</div>
                                    <div style="color: #e0e0e0; word-break: break-all;">${escapeHtml(metadata.ai_model)}</div>
                                </div>
                            ` : ''}
                            ${metadata.ai_vae ? `
                                <div style="background: #1a1a1a; padding: 8px; border-radius: 4px; border-left: 3px solid #764ba2;">
                                    <div style="color: #888; margin-bottom: 4px;">🔧 VAE</div>
                                    <div style="color: #e0e0e0; word-break: break-all;">${escapeHtml(metadata.ai_vae)}</div>
                                </div>
                            ` : ''}
                            ${metadata.ai_loras && metadata.ai_loras.length > 0 ? `
                                <div style="background: #1a1a1a; padding: 8px; border-radius: 4px; border-left: 3px solid #f39c12;">
                                    <div style="color: #888; margin-bottom: 4px;">🎨 Lora模型</div>
                                    ${metadata.ai_loras.map(lora => `
                                        <div style="color: #e0e0e0; margin-bottom: 2px;">
                                            <span style="color: #f39c12;">${escapeHtml(lora.name)}</span>
                                            <span style="color: #888; font-size: 10px;"> (权重: ${lora.weight})</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                            ${metadata.comfy_models ? `
                                <div style="background: #1a1a1a; padding: 8px; border-radius: 4px; border-left: 3px solid #27ae60;">
                                    <div style="color: #888; margin-bottom: 4px;">🔗 ComfyUI模型</div>
                                    ${Object.entries(metadata.comfy_models).map(([key, value]) => {
                                        let displayName = key;
                                        let icon = '📦';
                                        
                                        // 为不同类型的模型添加图标和友好名称
                                        if (key === 'checkpoint') {
                                            displayName = '主模型';
                                            icon = '🎯';
                                        } else if (key === 'unet_model') {
                                            displayName = 'UNET模型';
                                            icon = '🧠';
                                        } else if (key === 'clip_model') {
                                            displayName = 'CLIP模型';
                                            icon = '📝';
                                        } else if (key === 'vae') {
                                            displayName = 'VAE模型';
                                            icon = '🔧';
                                        } else if (key === 'loras') {
                                            displayName = 'Lora模型';
                                            icon = '🎨';
                                        } else if (key === 'controlnets') {
                                            displayName = 'ControlNet';
                                            icon = '🎮';
                                        }
                                        
                                        return `
                                            <div style="color: #e0e0e0; margin-bottom: 4px; font-size: 11px;">
                                                <div style="color: #27ae60; font-weight: bold; margin-bottom: 2px;">
                                                    ${icon} ${displayName}
                                                </div>
                                                <div style="color: #e0e0e0; padding-left: 16px; word-break: break-all;">
                                                    ${Array.isArray(value) ? 
                                                        value.map(v => {
                                                            if (typeof v === 'object' && v.name) {
                                                                return `${escapeHtml(v.name)} ${v.strength_model ? `(强度: ${v.strength_model})` : ''}`;
                                                            }
                                                            return escapeHtml(String(v));
                                                        }).join('<br>') : 
                                                        escapeHtml(String(value))
                                                    }
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            ` : ''}
                        </div>
                        ${metadata.ai_sampler || metadata.ai_steps || metadata.ai_cfg || metadata.ai_seed ? `
                            <div style="margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
                                ${metadata.ai_sampler ? `<div><div style="color: #888;">🎲 采样器</div><div style="color: #e0e0e0;">${escapeHtml(metadata.ai_sampler)}</div></div>` : ''}
                                ${metadata.ai_steps ? `<div><div style="color: #888;">🔢 步数</div><div style="color: #e0e0e0;">${metadata.ai_steps}</div></div>` : ''}
                                ${metadata.ai_cfg ? `<div><div style="color: #888;">⚙️ CFG</div><div style="color: #e0e0e0;">${metadata.ai_cfg}</div></div>` : ''}
                                ${metadata.ai_seed ? `<div><div style="color: #888;">🌱 种子</div><div style="color: #e0e0e0;">${metadata.ai_seed}</div></div>` : ''}
                            </div>
                        ` : ''}
                    </div>
                `;
            }
            
            // ComfyUI提示词信息（新增）
            if (metadata.comfy_prompts && Object.keys(metadata.comfy_prompts).length > 0) {
                metadataHtml += `
                    <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #444;">
                        <h4 style="font-size: 14px; margin: 0 0 15px; color: #667eea;">💭 ComfyUI提示词</h4>
                        ${Object.entries(metadata.comfy_prompts).map(([key, promptData]) => {
                            let displayName = '';
                            let icon = '📝';
                            
                            // 为不同类型的节点设置图标和显示名称
                            if (promptData.type === 'CLIPTextEncode') {
                                displayName = `CLIP文本编码 (节点${promptData.node_id})`;
                                icon = '🔤';
                            } else if (promptData.type.includes('提示词列表')) {
                                displayName = `提示词列表.${promptData.field} (节点${promptData.node_id})`;
                                icon = '📋';
                            } else if (promptData.type.includes('Custom-Scripts')) {
                                displayName = `Custom-Scripts.${promptData.field} (节点${promptData.node_id})`;
                                icon = '⚙️';
                            } else if (promptData.type.includes('Easy-Use')) {
                                displayName = `Easy-Use.${promptData.field} (节点${promptData.node_id})`;
                                icon = '🎯';
                            } else if (promptData.type.includes('展示文本')) {
                                displayName = `展示文本.${promptData.field} (节点${promptData.node_id})`;
                                icon = '📄';
                            } else if (promptData.type.includes('展示任何')) {
                                displayName = `展示任何.${promptData.field} (节点${promptData.node_id})`;
                                icon = '🔍';
                            } else {
                                displayName = `${promptData.type}${promptData.field ? `.${promptData.field}` : ''} (节点${promptData.node_id})`;
                                icon = '📝';
                            }
                            
                            return `
                                <div style="margin-bottom: 15px;">
                                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
                                        <div style="font-size: 11px; color: #888; font-weight: bold;">${icon} ${escapeHtml(displayName)}</div>
                                        <button onclick="copyToClipboard('${escapeHtml(promptData.text).replace(/'/g, "\\'")}', this)" style="
                                            background: rgba(102, 126, 234, 0.8);
                                            border: none;
                                            color: white;
                                            padding: 4px 8px;
                                            border-radius: 4px;
                                            cursor: pointer;
                                            font-size: 10px;
                                            transition: all 0.2s;
                                        " onmouseover="this.style.background='rgba(102, 126, 234, 1)'" onmouseout="this.style.background='rgba(102, 126, 234, 0.8)'">
                                            📋 复制
                                        </button>
                                    </div>
                                    <div style="font-size: 11px; color: #e0e0e0; line-height: 1.5; background: #1a1a1a; padding: 10px; border-radius: 4px; max-height: 150px; overflow-y: auto; border-left: 3px solid #667eea;">${escapeHtml(promptData.text)}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
            
            // ComfyUI参数
            if (metadata.comfy_prompt) {
                const comfyInfo = extractComfyUIInfo(metadata.comfy_prompt);
                if (comfyInfo && (comfyInfo.positive_prompt || comfyInfo.model)) {
                    metadataHtml += `
                        <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #444;">
                            <h4 style="font-size: 14px; margin: 0 0 15px; color: #667eea;">ComfyUI 生成参数</h4>
                            ${comfyInfo.positive_prompt ? `
                                <div style="margin-bottom: 15px;">
                                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
                                        <div style="font-size: 11px; color: #888; font-weight: bold;">正面提示词</div>
                                        <button onclick="copyToClipboard('${escapeHtml(comfyInfo.positive_prompt).replace(/'/g, "\\'")}', this)" style="
                                            background: rgba(102, 126, 234, 0.8);
                                            border: none;
                                            color: white;
                                            padding: 4px 8px;
                                            border-radius: 4px;
                                            cursor: pointer;
                                            font-size: 10px;
                                            transition: all 0.2s;
                                        " onmouseover="this.style.background='rgba(102, 126, 234, 1)'" onmouseout="this.style.background='rgba(102, 126, 234, 0.8)'">
                                            📋 复制
                                        </button>
                                    </div>
                                    <div style="font-size: 11px; color: #e0e0e0; line-height: 1.5; background: #1a1a1a; padding: 10px; border-radius: 4px; max-height: 150px; overflow-y: auto;">${escapeHtml(comfyInfo.positive_prompt)}</div>
                                </div>
                            ` : ''}
                            ${comfyInfo.negative_prompt ? `
                                <div style="margin-bottom: 15px;">
                                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
                                        <div style="font-size: 11px; color: #888; font-weight: bold;">负面提示词</div>
                                        <button onclick="copyToClipboard('${escapeHtml(comfyInfo.negative_prompt).replace(/'/g, "\\'")}', this)" style="
                                            background: rgba(102, 126, 234, 0.8);
                                            border: none;
                                            color: white;
                                            padding: 4px 8px;
                                            border-radius: 4px;
                                            cursor: pointer;
                                            font-size: 10px;
                                            transition: all 0.2s;
                                        " onmouseover="this.style.background='rgba(102, 126, 234, 1)'" onmouseout="this.style.background='rgba(102, 126, 234, 0.8)'">
                                            📋 复制
                                        </button>
                                    </div>
                                    <div style="font-size: 11px; color: #e0e0e0; line-height: 1.5; background: #1a1a1a; padding: 10px; border-radius: 4px; max-height: 100px; overflow-y: auto;">${escapeHtml(comfyInfo.negative_prompt)}</div>
                                </div>
                            ` : ''}
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px;">
                                ${comfyInfo.model ? `<div style="grid-column: 1 / -1;"><div style="color: #888;">模型</div><div style="color: #e0e0e0; word-break: break-all;">${escapeHtml(comfyInfo.model)}</div></div>` : ''}
                                ${comfyInfo.lora ? `<div style="grid-column: 1 / -1;"><div style="color: #888;">LORA</div><div style="color: #e0e0e0; word-break: break-all; font-size: 10px;">${escapeHtml(comfyInfo.lora)}</div></div>` : ''}
                                ${comfyInfo.steps ? `<div><div style="color: #888;">Steps</div><div style="color: #e0e0e0;">${escapeHtml(String(comfyInfo.steps))}</div></div>` : ''}
                                ${comfyInfo.cfg ? `<div><div style="color: #888;">CFG</div><div style="color: #e0e0e0;">${escapeHtml(String(comfyInfo.cfg))}</div></div>` : ''}
                                ${comfyInfo.sampler ? `<div><div style="color: #888;">采样器</div><div style="color: #e0e0e0;">${escapeHtml(comfyInfo.sampler)}</div></div>` : ''}
                                ${comfyInfo.seed ? `<div><div style="color: #888;">种子</div><div style="color: #e0e0e0;">${escapeHtml(String(comfyInfo.seed))}</div></div>` : ''}
                                ${comfyInfo.size ? `<div><div style="color: #888;">尺寸</div><div style="color: #e0e0e0;">${escapeHtml(comfyInfo.size)}</div></div>` : ''}
                            </div>
                        </div>
                    `;
                }
            }
            
            // A1111参数
            if (metadata.parsed_params && (metadata.parsed_params.prompt || metadata.parsed_params.Model)) {
                metadataHtml += `
                    <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #444;">
                        <h4 style="font-size: 14px; margin: 0 0 15px; color: #667eea;">生成参数 (A1111)</h4>
                        ${metadata.parsed_params.prompt ? `
                            <div style="margin-bottom: 15px;">
                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
                                    <div style="font-size: 11px; color: #888; font-weight: bold;">正面提示词</div>
                                    <button onclick="copyToClipboard('${escapeHtml(metadata.parsed_params.prompt).replace(/'/g, "\\'")}', this)" style="
                                        background: rgba(102, 126, 234, 0.8);
                                        border: none;
                                        color: white;
                                        padding: 4px 8px;
                                        border-radius: 4px;
                                        cursor: pointer;
                                        font-size: 10px;
                                        transition: all 0.2s;
                                    " onmouseover="this.style.background='rgba(102, 126, 234, 1)'" onmouseout="this.style.background='rgba(102, 126, 234, 0.8)'">
                                        📋 复制
                                    </button>
                                </div>
                                <div style="font-size: 11px; color: #e0e0e0; line-height: 1.5; background: #1a1a1a; padding: 10px; border-radius: 4px; max-height: 150px; overflow-y: auto;">${escapeHtml(metadata.parsed_params.prompt)}</div>
                            </div>
                        ` : ''}
                        ${metadata.parsed_params.negative_prompt ? `
                            <div style="margin-bottom: 15px;">
                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
                                    <div style="font-size: 11px; color: #888; font-weight: bold;">负面提示词</div>
                                    <button onclick="copyToClipboard('${escapeHtml(metadata.parsed_params.negative_prompt).replace(/'/g, "\\'")}', this)" style="
                                        background: rgba(102, 126, 234, 0.8);
                                        border: none;
                                        color: white;
                                        padding: 4px 8px;
                                        border-radius: 4px;
                                        cursor: pointer;
                                        font-size: 10px;
                                        transition: all 0.2s;
                                    " onmouseover="this.style.background='rgba(102, 126, 234, 1)'" onmouseout="this.style.background='rgba(102, 126, 234, 0.8)'">
                                        📋 复制
                                    </button>
                                </div>
                                <div style="font-size: 11px; color: #e0e0e0; line-height: 1.5; background: #1a1a1a; padding: 10px; border-radius: 4px; max-height: 100px; overflow-y: auto;">${escapeHtml(metadata.parsed_params.negative_prompt)}</div>
                            </div>
                        ` : ''}
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px;">
                            ${metadata.parsed_params.Model ? `<div style="grid-column: 1 / -1;"><div style="color: #888;">模型</div><div style="color: #e0e0e0; word-break: break-all;">${escapeHtml(metadata.parsed_params.Model)}</div></div>` : ''}
                            ${metadata.parsed_params['Lora hashes'] ? `<div style="grid-column: 1 / -1;"><div style="color: #888;">LORA</div><div style="color: #e0e0e0; word-break: break-all; font-size: 10px;">${escapeHtml(metadata.parsed_params['Lora hashes'])}</div></div>` : ''}
                            ${metadata.parsed_params.Steps ? `<div><div style="color: #888;">Steps</div><div style="color: #e0e0e0;">${escapeHtml(String(metadata.parsed_params.Steps))}</div></div>` : ''}
                            ${metadata.parsed_params['CFG scale'] || metadata.parsed_params.CFG ? `<div><div style="color: #888;">CFG</div><div style="color: #e0e0e0;">${escapeHtml(String(metadata.parsed_params['CFG scale'] || metadata.parsed_params.CFG))}</div></div>` : ''}
                            ${metadata.parsed_params.Sampler ? `<div><div style="color: #888;">采样器</div><div style="color: #e0e0e0;">${escapeHtml(metadata.parsed_params.Sampler)}</div></div>` : ''}
                            ${metadata.parsed_params.Seed ? `<div><div style="color: #888;">种子</div><div style="color: #e0e0e0;">${escapeHtml(String(metadata.parsed_params.Seed))}</div></div>` : ''}
                            ${metadata.parsed_params.Size ? `<div><div style="color: #888;">尺寸</div><div style="color: #e0e0e0;">${escapeHtml(metadata.parsed_params.Size)}</div></div>` : ''}
                            ${metadata.parsed_params['Clip skip'] ? `<div><div style="color: #888;">Clip skip</div><div style="color: #e0e0e0;">${escapeHtml(metadata.parsed_params['Clip skip'])}</div></div>` : ''}
                            ${metadata.parsed_params.VAE ? `<div style="grid-column: 1 / -1;"><div style="color: #888;">VAE</div><div style="color: #e0e0e0; word-break: break-all; font-size: 10px;">${escapeHtml(metadata.parsed_params.VAE)}</div></div>` : ''}
                        </div>
                    </div>
                `;
            }
            
            // 如果有元数据，追加到信息面板
            if (metadataHtml) {
                infoPanel.insertAdjacentHTML('beforeend', metadataHtml);
                console.log('[CatSee] 元数据已更新到预览面板');
            } else {
                console.warn('[CatSee] 没有找到可显示的元数据');
                console.log('[CatSee] metadata对象:', metadata);
                infoPanel.insertAdjacentHTML('beforeend', `
                    <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #444; text-align: center; color: #888;">
                        <div style="font-size: 14px;">此图片无生成参数</div>
                        <div style="font-size: 11px; margin-top: 5px; color: #666;">可能不是AI生成的图片</div>
                    </div>
                `);
            }
        });
    }
}

// 判断是否为图片文件
function isImageFile(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tif', 'ico', 'svg'].includes(ext);
}

// 判断是否为视频文件
function isVideoFile(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    return ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'm4v', 'mpg', 'mpeg'].includes(ext);
}

// 从ComfyUI prompt中提取关键信息
function extractComfyUIInfo(prompt) {
    if (!prompt || typeof prompt !== 'object') return null;
    
    const info = {
        positive_prompt: '',
        negative_prompt: '',
        model: '',
        sampler: '',
        steps: '',
        cfg: '',
        seed: '',
        size: ''
    };
    
    try {
        // 调试：打印所有节点类型
        const nodeTypes = [];
        for (const nodeId in prompt) {
            const node = prompt[nodeId];
            if (node && node.class_type) {
                nodeTypes.push(node.class_type);
            }
        }
        console.log('[CatSee] ComfyUI节点类型:', nodeTypes);
        
        // 遍历所有节点
        for (const nodeId in prompt) {
            const node = prompt[nodeId];
            if (!node || !node.inputs) continue;
            
            const classType = node.class_type || '';
            const inputs = node.inputs;
            
            // 提取正面提示词 (CLIPTextEncode, 通常连接到正面条件)
            if (classType.includes('CLIPTextEncode') && inputs.text && !info.positive_prompt) {
                info.positive_prompt = inputs.text;
            }
            
            // 提取负面提示词
            if (classType.includes('CLIPTextEncode') && inputs.text && info.positive_prompt && !info.negative_prompt) {
                info.negative_prompt = inputs.text;
            }
            
            // 提取模型名称
            if (classType.includes('CheckpointLoader') && inputs.ckpt_name) {
                info.model = inputs.ckpt_name;
            }
            
            // 提取采样器信息
            if (classType.includes('KSampler')) {
                if (inputs.sampler_name) info.sampler = inputs.sampler_name;
                if (inputs.steps) info.steps = inputs.steps;
                if (inputs.cfg) info.cfg = inputs.cfg;
                if (inputs.seed) info.seed = inputs.seed;
            }
            
            // 提取图片尺寸
            if (classType.includes('EmptyLatentImage')) {
                if (inputs.width && inputs.height) {
                    info.size = `${inputs.width} × ${inputs.height}`;
                }
            }
            
            // 提取LORA信息 - 支持多种LORA节点类型
            if (classType.includes('Lora') || classType.includes('LORA')) {
                console.log('[CatSee] 检测到LORA节点:', classType, 'inputs:', inputs);
                if (!info.loras) info.loras = [];
                
                // 尝试多种可能的字段名
                const loraName = inputs.lora_name || inputs.lora || inputs.model || inputs.name;
                if (loraName) {
                    // 如果有strength信息，也记录下来
                    const strength = inputs.strength_model || inputs.strength || '';
                    if (strength) {
                        info.loras.push(`${loraName} (${strength})`);
                    } else {
                        info.loras.push(loraName);
                    }
                    console.log('[CatSee] ✓ 找到LORA:', loraName, '强度:', strength);
                } else {
                    console.warn('[CatSee] ✗ LORA节点没有找到名称字段，inputs:', Object.keys(inputs));
                }
            }
        }
        
        // 合并LORA列表
        if (info.loras && info.loras.length > 0) {
            info.lora = info.loras.join(', ');
            console.log('[CatSee] LORA总数:', info.loras.length);
        }
    } catch (error) {
        console.error('[CatSee] 解析ComfyUI prompt失败:', error);
    }
    
    return info;
}

// 获取文件图标
function getFileIcon(filename, isFolder) {
    if (isFolder) return '📁';
    
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
        // 图片
        'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️',
        'bmp': '🖼️', 'webp': '🖼️', 'tiff': '🖼️', 'tif': '🖼️',
        'ico': '🖼️', 'svg': '🖼️',
        // 视频
        'mp4': '🎬', 'avi': '🎬', 'mov': '🎬', 'mkv': '🎬',
        'webm': '🎬', 'flv': '🎬', 'wmv': '🎬', 'm4v': '🎬',
        'mpg': '🎬', 'mpeg': '🎬',
        // JSON
        'json': '⚙️'
    };
    
    return iconMap[ext] || '📄';
}

// 显示错误
function showError(message) {
    const contentArea = document.getElementById('content-area');
    const statusBar = document.getElementById('status-bar');
    
    if (contentArea) {
        contentArea.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #e74c3c;">
                <div style="font-size: 48px; margin-bottom: 10px;">❌</div>
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #e74c3c;">加载失败</div>
                <div style="font-size: 13px; color: #999;">${message}</div>
                <button id="back-to-drives-btn" style="
                    margin-top: 20px;
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                ">返回驱动器列表</button>
            </div>
        `;
        
        // 绑定按钮事件
        const backBtn = document.getElementById('back-to-drives-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                showDrivesInMain();
            });
        }
    }
    
    if (statusBar) {
        statusBar.textContent = '错误: ' + message;
    }
}

// 后退
function goBack() {
    if (historyIndex > 0) {
        historyIndex--;
        const path = pathHistory[historyIndex];
        
        // 临时保存历史索引
        const tempIndex = historyIndex;
        browsePath(path).then(() => {
            historyIndex = tempIndex;
        });
    } else {
        showDrivesInMain();
    }
}

// 上级目录
function goUp() {
    if (!currentPath) {
        showDrivesInMain();
        return;
    }
    
    const parts = currentPath.split(/[/\\]/);
    parts.pop();
    
    if (parts.length > 1) {
        const parentPath = parts.join('\\');
        browsePath(parentPath);
    } else if (parts.length === 1) {
        browsePath(parts[0] + '\\');
    } else {
        showDrivesInMain();
    }
}

// 前进
function goForward() {
    if (historyIndex < pathHistory.length - 1) {
        historyIndex++;
        const path = pathHistory[historyIndex];
        const tempIndex = historyIndex;
        browsePath(path).then(() => {
            historyIndex = tempIndex;
        });
    }
}

// 刷新
function refresh() {
    if (currentPath) {
        browsePath(currentPath);
    } else {
        showDrivesInMain();
    }
}

// 切换视图
function switchView(view) {
    currentView = view;
    
    const gridBtn = document.getElementById('view-grid');
    const listBtn = document.getElementById('view-list');
    
    if (view === 'grid') {
        gridBtn.style.background = '#667eea';
        gridBtn.style.borderColor = '#667eea';
        listBtn.style.background = '#2a2a2a';
        listBtn.style.borderColor = '#444';
    } else {
        listBtn.style.background = '#667eea';
        listBtn.style.borderColor = '#667eea';
        gridBtn.style.background = '#2a2a2a';
        gridBtn.style.borderColor = '#444';
    }
    
    // 重新渲染当前文件
    if (allItems.length > 0) {
        showFiles(allItems, currentPath);
    }
}

// 排序文件
function sortFiles(sortBy) {
    currentSort = sortBy;
    
    if (allItems.length === 0) return;
    
    const sorted = [...allItems].sort((a, b) => {
        // 文件夹始终在前
        if (a.is_folder && !b.is_folder) return -1;
        if (!a.is_folder && b.is_folder) return 1;
        
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'date':
                return (b.modified_time || 0) - (a.modified_time || 0);
            case 'size':
                return (b.size || 0) - (a.size || 0);
            case 'type':
                const extA = a.name.split('.').pop().toLowerCase();
                const extB = b.name.split('.').pop().toLowerCase();
                return extA.localeCompare(extB);
            default:
                return 0;
        }
    });
    
    showFiles(sorted, currentPath);
}

// 更新面包屑
function updateBreadcrumb(path) {
    const breadcrumb = document.getElementById('breadcrumb');
    if (!breadcrumb) return;
    
    if (!path) {
        breadcrumb.innerHTML = '此电脑';
        return;
    }
    
    const parts = path.split(/[/\\]/).filter(p => p);
    let html = '<span style="cursor: pointer; padding: 2px 6px; border-radius: 3px;" onmouseover="this.style.background=\'#333\'" onmouseout="this.style.background=\'transparent\'">此电脑</span>';
    
    let currentPath = '';
    parts.forEach((part, index) => {
        currentPath += part + '\\';
        const isLast = index === parts.length - 1;
        html += ' <span style="color: #666;">></span> ';
        html += `<span class="breadcrumb-part" data-path="${currentPath.replace(/\\/g, '\\\\')}" style="cursor: pointer; padding: 2px 6px; border-radius: 3px; ${isLast ? 'color: #667eea; font-weight: bold;' : ''}">${part}</span>`;
    });
    
    breadcrumb.innerHTML = html;
    
    // 绑定点击事件
    breadcrumb.querySelectorAll('.breadcrumb-part').forEach(item => {
        item.addEventListener('click', function() {
            browsePath(this.dataset.path);
        });
        item.addEventListener('mouseenter', function() {
            this.style.background = '#333';
        });
        item.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
        });
    });
}

// 页面加载完成后创建按钮
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createButton);
} else {
    createButton();
}

// 延迟创建（确保页面完全加载）
setTimeout(createButton, 1000);
setTimeout(createButton, 3000);

console.log('[CatSee] 浏览器 v1.1.1 加载完成 ✓');
console.log('[CatSee] 如果看到旧版本号，请按 Ctrl+F5 强制刷新');

// 视频播放器全局变量
let videoPlayer = null;

// 初始化视频播放器（使用Canvas绘制，不使用HTML video标签）
function initVideoPlayer(videoPath) {
    console.log('[CatSee] 初始化视频播放器:', videoPath);
    
    const canvas = document.getElementById('video-canvas');
    const playPauseBtn = document.getElementById('video-play-pause');
    const progressContainer = document.getElementById('video-progress-container');
    const progressBar = document.getElementById('video-progress-bar');
    const progressHandle = document.getElementById('video-progress-handle');
    const currentTimeSpan = document.getElementById('video-current-time');
    const durationSpan = document.getElementById('video-duration');
    const volumeBtn = document.getElementById('video-volume-btn');
    const volumeContainer = document.getElementById('video-volume-container');
    const volumeBar = document.getElementById('video-volume-bar');
    const fullscreenBtn = document.getElementById('video-fullscreen-btn');
    
    if (!canvas) {
        console.error('[CatSee] 找不到视频Canvas元素');
        return;
    }
    
    // 创建隐藏的video元素用于解码（用户看不到）
    const hiddenVideo = document.createElement('video');
    hiddenVideo.style.display = 'none';
    hiddenVideo.style.position = 'absolute';
    hiddenVideo.style.width = '1px';
    hiddenVideo.style.height = '1px';
    hiddenVideo.style.opacity = '0';
    hiddenVideo.style.pointerEvents = 'none';
    hiddenVideo.crossOrigin = 'anonymous';
    hiddenVideo.preload = 'metadata';
    document.body.appendChild(hiddenVideo);
    
    // 设置视频源
    const videoUrl = `/browser/api/video?path=${encodeURIComponent(videoPath)}`;
    hiddenVideo.src = videoUrl;
    
    // 获取Canvas上下文
    const ctx = canvas.getContext('2d');
    
    // 视频播放器状态
    let isPlaying = false;
    let volume = 1.0;
    let isMuted = false;
    let animationFrameId = null;
    
    // 调整Canvas大小
    function resizeCanvas() {
        const container = canvas.parentElement;
        const maxWidth = container.clientWidth * 0.95;
        const maxHeight = container.clientHeight * 0.8;
        
        if (hiddenVideo.videoWidth && hiddenVideo.videoHeight) {
            const aspectRatio = hiddenVideo.videoWidth / hiddenVideo.videoHeight;
            let width = maxWidth;
            let height = width / aspectRatio;
            
            if (height > maxHeight) {
                height = maxHeight;
                width = height * aspectRatio;
            }
            
            canvas.width = width;
            canvas.height = height;
        } else {
            canvas.width = maxWidth;
            canvas.height = maxHeight;
        }
    }
    
    // 绘制视频帧到Canvas
    function drawFrame() {
        if (hiddenVideo.readyState >= 2) { // HAVE_CURRENT_DATA
            ctx.drawImage(hiddenVideo, 0, 0, canvas.width, canvas.height);
        }
        
        if (isPlaying) {
            animationFrameId = requestAnimationFrame(drawFrame);
        }
    }
    
    // 更新进度条
    function updateProgress() {
        if (hiddenVideo.duration) {
            const progress = (hiddenVideo.currentTime / hiddenVideo.duration) * 100;
            progressBar.style.width = progress + '%';
            progressHandle.style.left = progress + '%';
            
            currentTimeSpan.textContent = formatTime(hiddenVideo.currentTime);
            durationSpan.textContent = formatTime(hiddenVideo.duration);
        }
    }
    
    // 格式化时间（秒转MM:SS）
    function formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    
    // 播放/暂停
    function togglePlayPause() {
        if (isPlaying) {
            hiddenVideo.pause();
            isPlaying = false;
            playPauseBtn.textContent = '▶️';
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        } else {
            hiddenVideo.play();
            isPlaying = true;
            playPauseBtn.textContent = '⏸️';
            drawFrame();
        }
    }
    
    // 视频加载完成
    hiddenVideo.addEventListener('loadedmetadata', () => {
        console.log('[CatSee] 视频元数据加载完成');
        resizeCanvas();
        durationSpan.textContent = formatTime(hiddenVideo.duration);
        drawFrame();
    });
    
    // 视频时间更新
    hiddenVideo.addEventListener('timeupdate', updateProgress);
    
    // 视频播放结束
    hiddenVideo.addEventListener('ended', () => {
        isPlaying = false;
        playPauseBtn.textContent = '▶️';
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    });
    
    // 视频尺寸变化
    hiddenVideo.addEventListener('loadeddata', () => {
        resizeCanvas();
        drawFrame();
    });
    
    // 窗口大小变化
    window.addEventListener('resize', resizeCanvas);
    
    // 绑定控制按钮
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    // 进度条悬停显示手柄
    progressContainer.addEventListener('mouseenter', () => {
        progressHandle.style.opacity = '1';
    });
    
    progressContainer.addEventListener('mouseleave', () => {
        if (!isDragging) {
            progressHandle.style.opacity = '0';
        }
    });
    
    // 进度条点击
    progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        hiddenVideo.currentTime = percent * hiddenVideo.duration;
        updateProgress();
    });
    
    // 进度条拖拽
    let isDragging = false;
    progressContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        progressHandle.style.opacity = '1';
        const rect = progressContainer.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        hiddenVideo.currentTime = percent * hiddenVideo.duration;
        updateProgress();
    });
    
    const progressMouseMoveHandler = (e) => {
        if (isDragging) {
            const rect = progressContainer.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            hiddenVideo.currentTime = percent * hiddenVideo.duration;
            updateProgress();
        }
    };
    
    const progressMouseUpHandler = () => {
        if (isDragging) {
            isDragging = false;
            progressHandle.style.opacity = '0';
        }
    };
    
    document.addEventListener('mousemove', progressMouseMoveHandler);
    document.addEventListener('mouseup', progressMouseUpHandler);
    
    
    // 音量控制
    volumeContainer.addEventListener('click', (e) => {
        const rect = volumeContainer.getBoundingClientRect();
        volume = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        hiddenVideo.volume = volume;
        volumeBar.style.width = (volume * 100) + '%';
        updateVolumeIcon();
    });
    
    function updateVolumeIcon() {
        if (isMuted || volume === 0) {
            volumeBtn.textContent = '🔇';
        } else if (volume < 0.5) {
            volumeBtn.textContent = '🔉';
        } else {
            volumeBtn.textContent = '🔊';
        }
    }
    
    volumeBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        hiddenVideo.muted = isMuted;
        updateVolumeIcon();
    });
    
    // 全屏
    fullscreenBtn.addEventListener('click', () => {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen();
        } else if (canvas.mozRequestFullScreen) {
            canvas.mozRequestFullScreen();
        }
    });
    
    // 保存播放器实例以便清理
    const resizeHandler = resizeCanvas;
    const playerInstance = {
        video: hiddenVideo,
        canvas: canvas,
        progressMouseMoveHandler: progressMouseMoveHandler,
        progressMouseUpHandler: progressMouseUpHandler,
        cleanup: () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            hiddenVideo.pause();
            hiddenVideo.src = '';
            if (hiddenVideo.parentElement) {
                hiddenVideo.parentElement.removeChild(hiddenVideo);
            }
            window.removeEventListener('resize', resizeHandler);
            document.removeEventListener('mousemove', progressMouseMoveHandler);
            document.removeEventListener('mouseup', progressMouseUpHandler);
        }
    };
    videoPlayer = playerInstance;
    
    // 初始化
    resizeCanvas();
    updateVolumeIcon();
    
    console.log('[CatSee] 视频播放器初始化完成');
}

// 测试API是否可用
fetch('/browser/api/drives')
    .then(res => {
        if (res.ok) {
            console.log('[CatSee] ✓ API正常工作');
        } else {
            console.error('[CatSee] ✗ API返回错误:', res.status);
        }
    })
    .catch(err => {
        console.error('[CatSee] ✗ API无法访问，请重启ComfyUI:', err.message);
    });
