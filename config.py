# -*- coding: utf-8 -*-
"""
配置管理模块
"""
import os
import json
from pathlib import Path

class Config:
    """配置管理类"""
    
    def __init__(self):
        self.plugin_dir = Path(__file__).parent
        self.config_file = self.plugin_dir / "config.json"
        self.default_config = self._get_default_config()
        self.config = self._load_config()
    
    def _get_default_config(self):
        """获取默认配置"""
        # 尝试找到ComfyUI根目录
        comfyui_dir = self._find_comfyui_dir()
        
        return {
            "collections": str(self.plugin_dir / "collections"),
            "outputs": str(comfyui_dir / "output") if comfyui_dir else str(self.plugin_dir / "outputs"),
            "temp": str(self.plugin_dir / "temp"),
            "max_items_per_page": 50,
            "thumbnail_size": 256,
            "supported_formats": {
                "images": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tiff"],
                "videos": [".mp4", ".avi", ".mov", ".mkv", ".webm"],
                "workflows": [".json"]
            }
        }
    
    def _find_comfyui_dir(self):
        """查找ComfyUI根目录"""
        current = self.plugin_dir
        
        # 向上查找包含main.py的目录
        for _ in range(5):  # 最多向上查找5级
            if (current / "main.py").exists():
                return current
            current = current.parent
        
        return None
    
    def _load_config(self):
        """加载配置文件"""
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                
                # 合并用户配置和默认配置
                config = self.default_config.copy()
                config.update(user_config)
                return config
            except Exception as e:
                print(f"[ComfyUI Browser] Failed to load config: {e}")
                return self.default_config
        else:
            # 创建默认配置文件
            self.save_config(self.default_config)
            return self.default_config
    
    def save_config(self, config=None):
        """保存配置文件"""
        if config is None:
            config = self.config
        
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            print(f"[ComfyUI Browser] Config saved to {self.config_file}")
        except Exception as e:
            print(f"[ComfyUI Browser] Failed to save config: {e}")
    
    def get(self, key, default=None):
        """获取配置值"""
        return self.config.get(key, default)
    
    def set(self, key, value):
        """设置配置值"""
        self.config[key] = value
        self.save_config()
    
    def get_path(self, key):
        """获取路径配置并确保目录存在"""
        path = Path(self.get(key))
        path.mkdir(parents=True, exist_ok=True)
        return path
    
    def get_outputs_dir(self):
        """获取输出目录"""
        return self.get_path("outputs")
    
    def get_collections_dir(self):
        """获取收藏目录"""
        return self.get_path("collections")
    
    
    def get_temp_dir(self):
        """获取临时目录"""
        return self.get_path("temp")

# 全局配置实例
config = Config()
