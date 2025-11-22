# -*- coding: utf-8 -*-
"""
CatSee浏览器 - 图像/视频/工作流浏览器和管理器
模仿 talesofai/comfyui-browser 插件功能
"""

from .nodes import NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS
from .server import add_routes

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']

# Web目录
WEB_DIRECTORY = "./web"

# 版本信息
__version__ = "1.0.0"
__author__ = "CatSee Team"
__description__ = "CatSee浏览器 - 一个可爱的图像/视频/工作流浏览器"

print(f"[CatSee浏览器] v{__version__} - {__description__}")
print(f"[CatSee浏览器] 正在加载插件...")

# ComfyUI路由注册 - 多种方式确保兼容性
try:
    # 方式1: 直接导入PromptServer并注册
    import server
    from server import PromptServer
    
    @PromptServer.instance.routes.get('/browser/api/drives')
    async def get_drives_route(request):
        from .server import browser_server
        return await browser_server.get_drives(request)
    
    @PromptServer.instance.routes.get('/browser/api/browse')
    async def browse_route(request):
        from .server import browser_server
        return await browser_server.browse_directory(request)
    
    @PromptServer.instance.routes.get('/browser/api/quick-access')
    async def quick_access_route(request):
        from .server import browser_server
        return await browser_server.get_quick_access(request)
    
    @PromptServer.instance.routes.get('/browser/api/desktop')
    async def desktop_route(request):
        from .server import browser_server
        return await browser_server.get_desktop(request)
    
    @PromptServer.instance.routes.get('/browser/api/thumbnail')
    async def thumbnail_route(request):
        from .server import browser_server
        return await browser_server.get_thumbnail(request)
    
    @PromptServer.instance.routes.get('/browser/api/image')
    async def image_route(request):
        from .server import browser_server
        return await browser_server.get_image(request)
    
    @PromptServer.instance.routes.get('/browser/api/metadata')
    async def metadata_route(request):
        from .server import browser_server
        return await browser_server.get_metadata(request)
    
    print("[CatSee浏览器] 路由直接注册成功")
except Exception as e:
    print(f"[CatSee浏览器] 直接路由注册失败: {e}")
    
    # 方式2: 使用setup_routes函数（备用）
    def setup_routes(routes):
        """为ComfyUI设置路由"""
        try:
            add_routes(routes)
            print("[CatSee浏览器] 路由注册成功（备用方式）")
        except Exception as e:
            print(f"[CatSee浏览器] 路由注册失败: {e}")
    
    __all__.append('setup_routes')
