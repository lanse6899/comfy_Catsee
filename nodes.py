# -*- coding: utf-8 -*-
"""
ComfyUI节点定义 - 精简版
"""

try:
    from .file_manager import file_manager
except ImportError:
    from file_manager import file_manager

class BrowserFileList:
    """文件列表节点"""
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "path": ("STRING", {"default": ""}),
                "page": ("INT", {"default": 1, "min": 1}),
                "per_page": ("INT", {"default": 50, "min": 1, "max": 200}),
            }
        }
    
    RETURN_TYPES = ("STRING",)
    FUNCTION = "list_files"
    CATEGORY = "😽CatSee"
    
    def list_files(self, path, page, per_page):
        """列出文件"""
        try:
            if not path:
                # 如果没有指定路径，返回驱动器列表
                drives = file_manager.get_drives()
                return (str(drives),)
            else:
                # 浏览指定路径
                result = file_manager.browse_directory(path, page, per_page)
                return (str(result),)
        except Exception as e:
            return (f"错误: {str(e)}",)

# 节点映射
NODE_CLASS_MAPPINGS = {
    "BrowserFileList": BrowserFileList
}

# 显示名称映射
NODE_DISPLAY_NAME_MAPPINGS = {
    "BrowserFileList": "😽 文件列表"
}
