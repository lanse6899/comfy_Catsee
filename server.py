# -*- coding: utf-8 -*-
"""
服务器路由模块 - 精简版
"""
from pathlib import Path
from aiohttp import web
import json

try:
    from .file_manager import file_manager
except ImportError:
    from file_manager import file_manager

class BrowserServer:
    """浏览器服务器 - 只保留核心功能"""
    
    def __init__(self):
        self.routes = []
    
    def setup_routes(self, app):
        """设置路由"""
        # 核心API路由
        app.router.add_get('/browser/api/browse', self.browse_directory)
        app.router.add_get('/browser/api/drives', self.get_drives)
        app.router.add_get('/browser/api/quick-access', self.get_quick_access)
        app.router.add_get('/browser/api/desktop', self.get_desktop)
        app.router.add_get('/browser/api/thumbnail', self.get_thumbnail)
        app.router.add_get('/browser/api/image', self.get_image)
        app.router.add_get('/browser/api/metadata', self.get_metadata)
        
        # 静态文件路由
        app.router.add_static('/browser/static/', path=str(Path(__file__).parent / 'web'), name='browser_static')
        
        print("[CatSee浏览器] 路由注册成功")
    
    async def browse_directory(self, request):
        """浏览目录"""
        try:
            path = request.query.get('path', '')
            page = int(request.query.get('page', 1))
            per_page = int(request.query.get('per_page', 10000))  # 增加到10000以显示所有文件
            
            if not path:
                return web.json_response({
                    'success': False,
                    'error': '缺少路径参数'
                }, status=400)
            
            result = file_manager.browse_directory(path, page, per_page)
            
            return web.json_response({
                'success': True,
                'data': result
            })
            
        except Exception as e:
            return web.json_response({
                'success': False,
                'error': str(e)
            }, status=500)
    
    async def get_drives(self, request):
        """获取系统驱动器"""
        try:
            print("[CatSee] Getting drives...")
            drives = file_manager.get_drives()
            print(f"[CatSee] Found {len(drives) if drives else 0} drives: {drives}")
            
            if drives is None:
                print("[CatSee] WARNING: drives is None, returning empty list")
                drives = []
            
            response_data = {
                'success': True,
                'data': drives
            }
            print(f"[CatSee] Returning response: {response_data}")
            
            return web.json_response(response_data)
            
        except Exception as e:
            print(f"[CatSee] Error in get_drives: {e}")
            import traceback
            traceback.print_exc()
            return web.json_response({
                'success': False,
                'error': str(e)
            }, status=500)
    
    async def get_quick_access(self, request):
        """获取快速访问目录"""
        try:
            quick_dirs = file_manager.get_quick_access()
            
            return web.json_response({
                'success': True,
                'data': quick_dirs
            })
            
        except Exception as e:
            return web.json_response({
                'success': False,
                'error': str(e)
            }, status=500)
    
    async def get_desktop(self, request):
        """获取桌面路径"""
        try:
            import os
            desktop_path = os.path.join(os.path.expanduser('~'), 'Desktop')
            
            return web.json_response({
                'success': True,
                'path': desktop_path
            })
            
        except Exception as e:
            return web.json_response({
                'success': False,
                'error': str(e)
            }, status=500)
    
    async def get_thumbnail(self, request):
        """获取文件缩略图"""
        try:
            file_path = request.query.get('path', '')
            if not file_path:
                return web.Response(status=400, text='Missing path parameter')
            
            from pathlib import Path
            from PIL import Image
            import io
            
            path = Path(file_path)
            print(f"[CatSee] 缩略图请求: {path}")
            
            if not path.exists() or not path.is_file():
                print(f"[CatSee] 文件不存在: {path}")
                return web.Response(status=404, text='File not found')
            
            # 检查是否为图片
            if path.suffix.lower() not in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif']:
                print(f"[CatSee] 不是图片文件: {path.suffix}")
                return web.Response(status=400, text='Not an image file')
            
            # 生成缩略图（优化：更小尺寸，更低质量）
            img = Image.open(path)
            original_size = img.size
            img.thumbnail((100, 100), Image.Resampling.BILINEAR)  # 改用BILINEAR更快
            print(f"[CatSee] 缩略图生成成功: {original_size} -> {img.size}")
            
            # 转换为JPEG并返回（降低质量加快速度）
            buffer = io.BytesIO()
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            img.save(buffer, format='JPEG', quality=60, optimize=False)  # 降低质量，关闭优化
            buffer.seek(0)
            
            return web.Response(
                body=buffer.read(), 
                content_type='image/jpeg',
                headers={'Cache-Control': 'public, max-age=86400'}  # 缓存24小时
            )
            
        except Exception as e:
            print(f"[CatSee] Error generating thumbnail: {e}")
            return web.Response(status=500, text=str(e))
    
    async def get_image(self, request):
        """获取原始图片（用于预览）"""
        try:
            file_path = request.query.get('path', '')
            if not file_path:
                print(f"[CatSee] 图片请求失败: 缺少路径参数")
                return web.Response(status=400, text='Missing path parameter')
            
            from pathlib import Path
            
            path = Path(file_path)
            print(f"[CatSee] 图片请求: {path}")
            
            if not path.exists() or not path.is_file():
                print(f"[CatSee] 图片不存在: {path}")
                return web.Response(status=404, text='File not found')
            
            # 检查是否为图片
            if path.suffix.lower() not in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif']:
                return web.Response(status=400, text='Not an image file')
            
            # 直接返回原图
            with open(path, 'rb') as f:
                image_data = f.read()
            
            # 根据扩展名设置content-type
            content_types = {
                '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
                '.png': 'image/png', '.gif': 'image/gif',
                '.bmp': 'image/bmp', '.webp': 'image/webp',
                '.tiff': 'image/tiff', '.tif': 'image/tiff'
            }
            content_type = content_types.get(path.suffix.lower(), 'image/jpeg')
            
            print(f"[CatSee] 图片加载成功: {path.name}, 大小: {len(image_data)} bytes, 类型: {content_type}")
            return web.Response(
                body=image_data, 
                content_type=content_type,
                headers={'Cache-Control': 'public, max-age=3600'}
            )
            
        except Exception as e:
            print(f"[CatSee] Error loading image: {e}")
            return web.Response(status=500, text=str(e))
    
    async def get_metadata(self, request):
        """获取文件的详细元数据"""
        try:
            file_path = request.query.get('path', '')
            if not file_path:
                response_text = json.dumps({'success': False, 'error': '缺少路径参数'})
                return web.Response(text=response_text, content_type='application/json', status=400)
            
            print(f"[CatSee] 元数据请求: {file_path}")
            
            metadata = file_manager.get_file_metadata(file_path)
            
            if metadata is None:
                response_text = json.dumps({'success': False, 'error': '文件不存在或无法读取'})
                return web.Response(text=response_text, content_type='application/json', status=404)
            
            print(f"[CatSee] 元数据获取成功: {metadata.get('name', 'unknown')}")
            print(f"[CatSee] 元数据字段: {list(metadata.keys())}")
            
            # 尝试序列化
            try:
                response_data = {'success': True, 'data': metadata}
                response_text = json.dumps(response_data, ensure_ascii=False)
                print(f"[CatSee] JSON序列化成功，长度: {len(response_text)}")
                return web.Response(text=response_text, content_type='application/json', charset='utf-8')
            except (TypeError, ValueError) as e:
                print(f"[CatSee] JSON序列化失败: {e}")
                print(f"[CatSee] 问题字段检查...")
                
                # 逐字段检查
                safe_metadata = {}
                for key, value in metadata.items():
                    try:
                        json.dumps(value)
                        safe_metadata[key] = value
                        print(f"[CatSee]   ✓ {key}")
                    except (TypeError, ValueError) as field_error:
                        print(f"[CatSee]   ✗ {key}: {field_error}")
                        try:
                            safe_metadata[key] = str(value)[:1000]  # 限制长度
                        except:
                            pass
                
                response_data = {'success': True, 'data': safe_metadata}
                response_text = json.dumps(response_data, ensure_ascii=False)
                return web.Response(text=response_text, content_type='application/json', charset='utf-8')
            
        except Exception as e:
            print(f"[CatSee] Error getting metadata: {e}")
            import traceback
            traceback.print_exc()
            error_response = json.dumps({'success': False, 'error': str(e)})
            return web.Response(text=error_response, content_type='application/json', status=500)

# 全局服务器实例
browser_server = BrowserServer()

# 为ComfyUI路由注册
def add_routes(routes):
    """添加路由到ComfyUI服务器"""
    try:
        @routes.get('/browser/api/browse')
        async def browse_directory(request):
            return await browser_server.browse_directory(request)
        
        @routes.get('/browser/api/drives')
        async def get_drives(request):
            return await browser_server.get_drives(request)
        
        @routes.get('/browser/api/quick-access')
        async def get_quick_access(request):
            return await browser_server.get_quick_access(request)
        
        @routes.get('/browser/api/thumbnail')
        async def get_thumbnail(request):
            return await browser_server.get_thumbnail(request)
        
        @routes.get('/browser/api/image')
        async def get_image(request):
            return await browser_server.get_image(request)
        
        @routes.get('/browser/api/metadata')
        async def get_metadata(request):
            return await browser_server.get_metadata(request)
        
        print("[CatSee浏览器] API路由注册成功")
        
    except Exception as e:
        print(f"[CatSee浏览器] 路由注册错误: {e}")
