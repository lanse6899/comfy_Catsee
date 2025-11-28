# -*- coding: utf-8 -*-
"""
文件管理模块
"""
import os
import json
import shutil
import platform
from pathlib import Path
from datetime import datetime
from PIL import Image
import hashlib

try:
    from .config import config
except ImportError:
    from config import config

class FileManager:
    """文件管理器"""
    
    def __init__(self):
        self.supported_images = config.get("supported_formats", {}).get("images", [])
        self.supported_videos = config.get("supported_formats", {}).get("videos", [])
        self.supported_workflows = config.get("supported_formats", {}).get("workflows", [])
        self.thumbnail_size = config.get("thumbnail_size", 256)
    
    def scan_directory(self, directory, recursive=True):
        """扫描目录获取文件列表"""
        directory = Path(directory)
        if not directory.exists():
            return []
        
        files = []
        pattern = "**/*" if recursive else "*"
        
        for file_path in directory.glob(pattern):
            if file_path.is_file():
                file_info = self._get_file_info(file_path)
                if file_info:
                    files.append(file_info)
        
        # 按修改时间排序
        files.sort(key=lambda x: x['modified_time'], reverse=True)
        return files
    
    def _get_file_info(self, file_path, include_metadata=True):
        """获取文件信息
        
        Args:
            file_path: 文件路径
            include_metadata: 是否包含详细元数据(图片EXIF、缩略图等)
        """
        try:
            stat = file_path.stat()
            file_type = self._get_file_type(file_path)
            
            if file_type == "unknown":
                return None
            
            info = {
                "name": file_path.name,
                "path": str(file_path),
                "relative_path": str(file_path.relative_to(config.get_outputs_dir())) if config.get_outputs_dir() in file_path.parents else str(file_path),
                "size": stat.st_size,
                "type": file_type,
                "extension": file_path.suffix.lower(),
                "created_time": stat.st_ctime,
                "modified_time": stat.st_mtime,
                "hash": self._get_file_hash(file_path, fast=True)  # 使用快速哈希
            }
            
            # 只在需要时添加详细元数据
            if include_metadata:
                if file_type == "image":
                    info.update(self._get_image_info(file_path))
                elif file_type == "workflow":
                    info.update(self._get_workflow_info(file_path))
            
            return info
        except Exception as e:
            print(f"[ComfyUI Browser] Error getting file info for {file_path}: {e}")
            return None
    
    def _get_file_type(self, file_path):
        """判断文件类型"""
        ext = file_path.suffix.lower()
        
        if ext in self.supported_images:
            return "image"
        elif ext in self.supported_videos:
            return "video"
        elif ext in self.supported_workflows:
            return "workflow"
        else:
            return "unknown"
    
    def _get_file_hash(self, file_path, fast=True):
        """获取文件哈希值
        
        Args:
            file_path: 文件路径
            fast: 是否使用快速哈希(只读取部分内容)
        """
        try:
            if fast:
                # 快速哈希：使用文件路径+大小+修改时间
                stat = file_path.stat()
                hash_str = f"{file_path}_{stat.st_size}_{stat.st_mtime}"
                return hashlib.md5(hash_str.encode()).hexdigest()
            else:
                # 完整哈希：读取整个文件(慢)
                with open(file_path, 'rb') as f:
                    return hashlib.md5(f.read()).hexdigest()
        except:
            return ""
    
    def _get_image_info(self, file_path):
        """获取图片详细信息"""
        try:
            with Image.open(file_path) as img:
                info = {
                    "width": img.width,
                    "height": img.height,
                    "format": img.format,
                    "mode": img.mode,
                    "aspect_ratio": round(img.width / img.height, 2) if img.height > 0 else 0
                }
                
                # 提取PNG metadata (ComfyUI/A1111等生成的图片)
                if img.format == 'PNG':
                    png_info = img.info
                    print(f"[ComfyUI Browser] PNG info keys: {list(png_info.keys())}")
                    
                    # ComfyUI prompt
                    if 'prompt' in png_info:
                        try:
                            comfy_prompt = json.loads(png_info['prompt'])
                            info["comfy_prompt"] = comfy_prompt
                            # 提取ComfyUI中的模型信息
                            model_info = self._extract_comfy_models(comfy_prompt)
                            if model_info:
                                info["comfy_models"] = model_info
                            # 提取提示词信息
                            prompt_info = self._extract_comfy_prompts(comfy_prompt)
                            if prompt_info:
                                info["comfy_prompts"] = prompt_info
                            print(f"[ComfyUI Browser] Found ComfyUI prompt with models: {list(model_info.keys()) if model_info else 'none'}")
                            print(f"[ComfyUI Browser] Found ComfyUI prompts: {list(prompt_info.keys()) if prompt_info else 'none'}")
                        except:
                            info["comfy_prompt"] = png_info['prompt']
                            print(f"[ComfyUI Browser] Found ComfyUI prompt (raw)")
                    
                    # ComfyUI workflow
                    if 'workflow' in png_info:
                        try:
                            workflow = json.loads(png_info['workflow'])
                            info["comfy_workflow"] = workflow
                            # 提取工作流中的节点信息
                            workflow_info = self._extract_workflow_info(workflow)
                            if workflow_info:
                                info["workflow_summary"] = workflow_info
                            print(f"[ComfyUI Browser] Found ComfyUI workflow with {len(workflow.get('nodes', []))} nodes")
                        except:
                            pass
                    
                    # A1111/Forge parameters
                    if 'parameters' in png_info:
                        info["parameters"] = png_info['parameters']
                        # 解析parameters字符串
                        params_text = png_info['parameters']
                        parsed_params = self._parse_generation_params(params_text)
                        info["parsed_params"] = parsed_params
                        
                        # 提取关键信息到顶层
                        if 'model' in parsed_params:
                            info["ai_model"] = parsed_params['model']
                        if 'vae' in parsed_params:
                            info["ai_vae"] = parsed_params['vae']
                        if 'loras' in parsed_params:
                            info["ai_loras"] = parsed_params['loras']
                        if 'sampler' in parsed_params or 'Sampler' in parsed_params:
                            info["ai_sampler"] = parsed_params.get('sampler', parsed_params.get('Sampler'))
                        if 'steps' in parsed_params:
                            info["ai_steps"] = parsed_params['steps']
                        if 'cfg_scale' in parsed_params:
                            info["ai_cfg"] = parsed_params['cfg_scale']
                        if 'seed' in parsed_params:
                            info["ai_seed"] = parsed_params['seed']
                        
                        print(f"[ComfyUI Browser] Found A1111 parameters:")
                        print(f"  - Model: {info.get('ai_model', 'none')}")
                        print(f"  - VAE: {info.get('ai_vae', 'none')}")
                        print(f"  - Loras: {len(info.get('ai_loras', []))} found")
                        print(f"  - Parsed params keys: {list(parsed_params.keys())}")
                    
                    # 检查其他可能的元数据字段
                    for key in png_info.keys():
                        if key.lower() in ['software', 'generator', 'creation time', 'author']:
                            info[f"meta_{key.lower().replace(' ', '_')}"] = png_info[key]
                
                # 尝试提取JPEG的EXIF信息（仅基本信息，避免序列化问题）
                elif img.format in ['JPEG', 'JPG']:
                    try:
                        from PIL.ExifTags import TAGS
                        exif = img._getexif()
                        if exif:
                            exif_info = {}
                            for tag_id, value in exif.items():
                                tag = TAGS.get(tag_id, tag_id)
                                # 只提取可序列化的基本信息
                                if isinstance(value, (str, int, float, bool)):
                                    exif_info[tag] = value
                                elif isinstance(value, bytes):
                                    try:
                                        exif_info[tag] = value.decode('utf-8', errors='ignore')[:100]
                                    except:
                                        pass
                            
                            if exif_info:
                                info["exif_info"] = exif_info
                                # 提取常用信息
                                if 'Software' in exif_info:
                                    info["meta_software"] = exif_info['Software']
                                if 'ImageDescription' in exif_info:
                                    info["meta_description"] = exif_info['ImageDescription']
                    except Exception as e:
                        print(f"[ComfyUI Browser] Error reading EXIF: {e}")
                
                # 生成缩略图
                thumbnail_path = self._generate_thumbnail(file_path, img)
                if thumbnail_path:
                    info["thumbnail"] = thumbnail_path
                
                return info
        except Exception as e:
            print(f"[ComfyUI Browser] Error getting image info: {e}")
            return {}
    
    def _extract_comfy_models(self, comfy_prompt):
        """从ComfyUI prompt中提取模型信息"""
        try:
            models = {}
            
            if isinstance(comfy_prompt, dict):
                for node_id, node_data in comfy_prompt.items():
                    if isinstance(node_data, dict) and 'inputs' in node_data:
                        inputs = node_data['inputs']
                        class_type = node_data.get('class_type', '')
                        
                        print(f"[ComfyUI Browser] 检查节点 {node_id}: {class_type}")
                        print(f"[ComfyUI Browser] 输入参数: {list(inputs.keys())}")
                        
                        # 传统CheckpointLoader节点
                        if 'ckpt_name' in inputs:
                            models['checkpoint'] = inputs['ckpt_name']
                            print(f"[ComfyUI Browser] 发现Checkpoint: {inputs['ckpt_name']}")
                        
                        # 新式UNET加载器节点
                        elif class_type == 'UNETLoader' and 'unet_name' in inputs:
                            models['unet_model'] = inputs['unet_name']
                            print(f"[ComfyUI Browser] 发现UNET模型: {inputs['unet_name']}")
                        
                        # CLIP加载器节点
                        elif class_type == 'CLIPLoader' and 'clip_name' in inputs:
                            models['clip_model'] = inputs['clip_name']
                            print(f"[ComfyUI Browser] 发现CLIP模型: {inputs['clip_name']}")
                        
                        # 双CLIP加载器
                        elif class_type == 'DualCLIPLoader':
                            if 'clip_name1' in inputs:
                                models['clip_model_1'] = inputs['clip_name1']
                            if 'clip_name2' in inputs:
                                models['clip_model_2'] = inputs['clip_name2']
                            print(f"[ComfyUI Browser] 发现双CLIP模型")
                        
                        # VAE加载器
                        elif 'vae_name' in inputs:
                            models['vae'] = inputs['vae_name']
                            print(f"[ComfyUI Browser] 发现VAE: {inputs['vae_name']}")
                        
                        # Lora加载器
                        elif 'lora_name' in inputs:
                            if 'loras' not in models:
                                models['loras'] = []
                            lora_info = {
                                'name': inputs['lora_name'],
                                'strength_model': inputs.get('strength_model', 1.0),
                                'strength_clip': inputs.get('strength_clip', 1.0)
                            }
                            models['loras'].append(lora_info)
                            print(f"[ComfyUI Browser] 发现Lora: {inputs['lora_name']}")
                        
                        # ControlNet加载器
                        elif 'control_net_name' in inputs:
                            if 'controlnets' not in models:
                                models['controlnets'] = []
                            models['controlnets'].append(inputs['control_net_name'])
                            print(f"[ComfyUI Browser] 发现ControlNet: {inputs['control_net_name']}")
                        
                        # 其他可能的模型字段
                        elif 'model_name' in inputs:
                            models[f'{class_type.lower()}_model'] = inputs['model_name']
                            print(f"[ComfyUI Browser] 发现{class_type}模型: {inputs['model_name']}")
                        
                        # 检查是否有其他模型相关字段
                        for key, value in inputs.items():
                            if any(model_key in key.lower() for model_key in ['model', 'ckpt', 'checkpoint']) and isinstance(value, str) and value.endswith(('.safetensors', '.ckpt', '.pt', '.pth')):
                                models[f'{class_type.lower()}_{key}'] = value
                                print(f"[ComfyUI Browser] 发现模型文件: {key} = {value}")
            
            print(f"[ComfyUI Browser] 最终提取的模型信息: {models}")
            return models
        except Exception as e:
            print(f"[ComfyUI Browser] Error extracting ComfyUI models: {e}")
            import traceback
            traceback.print_exc()
            return {}
    
    def _extract_comfy_prompts(self, comfy_prompt):
        """从ComfyUI prompt中提取提示词信息"""
        try:
            prompts = {}
            
            if isinstance(comfy_prompt, dict):
                for node_id, node_data in comfy_prompt.items():
                    if isinstance(node_data, dict) and 'inputs' in node_data:
                        inputs = node_data['inputs']
                        class_type = node_data.get('class_type', '')
                        
                        print(f"[ComfyUI Browser] 检查提示词节点 {node_id}: {class_type}")
                        
                        # 标准CLIP文本编码节点
                        if class_type == 'CLIPTextEncode' and 'text' in inputs:
                            text = inputs['text'].strip()
                            if text:
                                prompts[f'prompt_{node_id}'] = {
                                    'text': text,
                                    'type': 'CLIPTextEncode',
                                    'node_id': node_id
                                }
                                print(f"[ComfyUI Browser] 发现CLIPTextEncode提示词: {text[:50]}...")
                        
                        # 各种提示词和文本节点
                        elif (
                            '提示词列表' in class_type or 
                            'prompt' in class_type.lower() or 
                            '展示文本' in class_type or 
                            '展示任何' in class_type or
                            'Custom-Scripts' in class_type or
                            'Easy-Use' in class_type or
                            'text' in class_type.lower() or
                            any(key.startswith('prompt_') for key in inputs.keys()) or
                            any('text' in key.lower() for key in inputs.keys())
                        ):
                            print(f"[ComfyUI Browser] 检查文本节点 {node_id}: {class_type}, 输入字段: {list(inputs.keys())}")
                            for key, value in inputs.items():
                                print(f"[ComfyUI Browser] 检查字段 {key}: {type(value)} = {repr(value)[:100]}")
                                
                                if isinstance(value, str):
                                    text_content = value.strip()
                                    # 检查是否是文本字段（更宽松的条件）
                                    is_text_field = (
                                        key.startswith('prompt_') or
                                        'text' in key.lower() or
                                        key in ['输入任何', 'output', 'input', '列表'] or
                                        (len(text_content) > 3 and key not in ['type', 'mode', 'seed', 'steps', 'cfg', 'sampler'])
                                    )
                                    
                                    if is_text_field and text_content:
                                        prompts[f'{class_type}_{key}_{node_id}'] = {
                                            'text': text_content,
                                            'type': class_type,
                                            'field': key,
                                            'node_id': node_id
                                        }
                                        print(f"[ComfyUI Browser] ✅ 提取{class_type}文本 {key}: {text_content[:50]}...")
                                    elif is_text_field:
                                        print(f"[ComfyUI Browser] ⚠️ 字段{key}是文本字段但内容为空")
                                    else:
                                        print(f"[ComfyUI Browser] ❌ 跳过非文本字段 {key}")
                                else:
                                    print(f"[ComfyUI Browser] ❌ 跳过非字符串字段 {key}: {type(value)}")
                        
                        # 其他可能包含文本的节点
                        else:
                            for key, value in inputs.items():
                                if isinstance(value, str) and len(value.strip()) > 10:
                                    # 检查是否可能是提示词（长度>10且包含常见提示词特征）
                                    text = value.strip()
                                    if any(word in text.lower() for word in ['beautiful', 'detailed', 'high quality', 'masterpiece', '美丽', '详细', '高质量']):
                                        prompts[f'{class_type}_{key}'] = {
                                            'text': text,
                                            'type': class_type,
                                            'field': key,
                                            'node_id': node_id
                                        }
                                        print(f"[ComfyUI Browser] 发现可能的提示词 {class_type}.{key}: {text[:50]}...")
            
            print(f"[ComfyUI Browser] 最终提取的提示词: {len(prompts)} 个")
            return prompts
        except Exception as e:
            print(f"[ComfyUI Browser] Error extracting ComfyUI prompts: {e}")
            import traceback
            traceback.print_exc()
            return {}
    
    def _extract_workflow_info(self, workflow):
        """从工作流中提取关键信息"""
        try:
            info = {
                'nodes_count': len(workflow.get('nodes', [])),
                'node_types': {},
                'has_controlnet': False,
                'has_lora': False,
                'has_upscaler': False
            }
            
            nodes = workflow.get('nodes', [])
            for node in nodes:
                node_type = node.get('type', 'unknown')
                info['node_types'][node_type] = info['node_types'].get(node_type, 0) + 1
                
                # 检查特殊节点类型
                if 'controlnet' in node_type.lower():
                    info['has_controlnet'] = True
                elif 'lora' in node_type.lower():
                    info['has_lora'] = True
                elif any(upscale in node_type.lower() for upscale in ['upscale', 'esrgan', 'realesrgan']):
                    info['has_upscaler'] = True
            
            return info
        except Exception as e:
            print(f"[ComfyUI Browser] Error extracting workflow info: {e}")
            return {}
    
    def _parse_generation_params(self, params_text):
        """解析生成参数文本（A1111/Forge/SD格式）"""
        try:
            params = {}
            lines = params_text.split('\n')
            
            # 第一行通常是正面提示词
            if lines:
                params['prompt'] = lines[0].strip()
            
            # 查找负面提示词
            if 'Negative prompt:' in params_text:
                neg_start = params_text.find('Negative prompt:') + len('Negative prompt:')
                # 找到下一个换行符或参数行的位置
                neg_text = params_text[neg_start:]
                neg_end = len(neg_text)
                for i, char in enumerate(neg_text):
                    if char == '\n':
                        # 检查下一行是否是参数行
                        next_line_start = i + 1
                        if next_line_start < len(neg_text):
                            next_line = neg_text[next_line_start:].strip()
                            # 如果下一行包含参数格式（key: value），则结束
                            if any(key in next_line for key in ['Steps:', 'Sampler:', 'CFG', 'Seed:', 'Size:', 'Model:', 'VAE:', 'Lora:']):
                                neg_end = i
                                break
                params['negative_prompt'] = neg_text[:neg_end].strip()
            
            # 解析参数行（可能有多行参数）
            param_lines = []
            for line in lines:
                line = line.strip()
                # 跳过提示词行
                if line.startswith('Negative prompt:') or line == params.get('prompt', ''):
                    continue
                # 检查是否是参数行（包含冒号和逗号）
                if ':' in line and (',' in line or any(key in line for key in ['Steps:', 'Sampler:', 'CFG', 'Seed:', 'Size:', 'Model:', 'VAE:', 'Lora:', 'Version:'])):
                    param_lines.append(line)
            
            # 解析所有参数行
            for line in param_lines:
                # 处理特殊格式的参数（如Lora、ControlNet等）
                if '<lora:' in line or '<lyco:' in line:
                    # 提取Lora信息
                    loras = self._extract_loras(line)
                    if loras:
                        params['loras'] = loras
                
                # 用逗号分隔参数
                parts = line.split(',')
                for part in parts:
                    part = part.strip()
                    if ':' in part:
                        key, value = part.split(':', 1)
                        key = key.strip()
                        value = value.strip()
                        
                        # 特殊处理某些参数
                        if key.lower() in ['model', 'model hash', 'model name']:
                            params['model'] = value
                        elif key.lower() in ['vae', 'vae hash']:
                            params['vae'] = value
                        elif key.lower() in ['version', 'app version']:
                            params['app_version'] = value
                        elif key.lower() in ['clip skip']:
                            params['clip_skip'] = value
                        elif key.lower() in ['ensd', 'eta noise seed delta']:
                            params['ensd'] = value
                        else:
                            params[key] = value
            
            # 提取尺寸信息
            if 'Size' in params:
                size_str = params['Size']
                if 'x' in size_str:
                    try:
                        width, height = size_str.split('x')
                        params['width'] = int(width.strip())
                        params['height'] = int(height.strip())
                    except:
                        pass
            
            # 提取种子信息
            if 'Seed' in params:
                try:
                    params['seed'] = int(params['Seed'])
                except:
                    pass
            
            # 提取步数信息
            if 'Steps' in params:
                try:
                    params['steps'] = int(params['Steps'])
                except:
                    pass
            
            # 提取CFG信息
            if 'CFG scale' in params:
                try:
                    params['cfg_scale'] = float(params['CFG scale'])
                except:
                    pass
            
            return params
        except Exception as e:
            print(f"[ComfyUI Browser] Error parsing params: {e}")
            import traceback
            traceback.print_exc()
            return {}
    
    def _extract_loras(self, text):
        """提取Lora信息"""
        try:
            import re
            loras = []
            
            # 匹配 <lora:name:weight> 或 <lyco:name:weight> 格式
            lora_pattern = r'<(lora|lyco):([^:>]+):([^>]+)>'
            matches = re.findall(lora_pattern, text)
            
            for match in matches:
                lora_type, name, weight = match
                try:
                    weight = float(weight)
                except:
                    weight = weight.strip()
                
                loras.append({
                    'type': lora_type,
                    'name': name.strip(),
                    'weight': weight
                })
            
            return loras
        except Exception as e:
            print(f"[ComfyUI Browser] Error extracting loras: {e}")
            return []
    
    def _get_workflow_info(self, file_path):
        """获取工作流信息"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                workflow_data = json.load(f)
            
            info = {
                "nodes_count": len(workflow_data.get("nodes", [])),
                "links_count": len(workflow_data.get("links", [])),
                "version": workflow_data.get("version", "unknown")
            }
            
            # 提取节点类型统计
            node_types = {}
            for node in workflow_data.get("nodes", []):
                node_type = node.get("type", "unknown")
                node_types[node_type] = node_types.get(node_type, 0) + 1
            
            info["node_types"] = node_types
            
            return info
        except Exception as e:
            print(f"[ComfyUI Browser] Error getting workflow info: {e}")
            return {}
    
    def _generate_thumbnail(self, file_path, img=None):
        """生成缩略图"""
        try:
            # 缩略图保存路径
            thumb_dir = config.get_temp_dir() / "thumbnails"
            thumb_dir.mkdir(exist_ok=True)
            
            # 使用快速哈希作为缓存键
            file_hash = self._get_file_hash(file_path, fast=True)
            thumb_path = thumb_dir / f"{file_hash}.jpg"
            
            # 如果缩略图已存在，直接返回
            if thumb_path.exists():
                return str(thumb_path)
            
            # 生成缩略图
            if img is None:
                img = Image.open(file_path)
            
            # 创建缩略图
            img.thumbnail((self.thumbnail_size, self.thumbnail_size), Image.Resampling.LANCZOS)
            
            # 转换为RGB模式（去除透明通道）
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # 保存缩略图
            img.save(thumb_path, "JPEG", quality=85, optimize=True)
            return str(thumb_path)
            
        except Exception as e:
            print(f"[ComfyUI Browser] Error generating thumbnail: {e}")
            return None
    
    def browse_directory(self, directory_path, page=1, per_page=10000, file_type=None):
        """浏览指定目录"""
        try:
            dir_path = Path(directory_path)
            if not dir_path.exists() or not dir_path.is_dir():
                return {
                    "items": [], 
                    "total": 0, 
                    "page": page, 
                    "per_page": per_page, 
                    "current_path": str(directory_path),
                    "parent_path": str(dir_path.parent) if dir_path.parent != dir_path else None,
                    "error": "目录不存在或无法访问"
                }
            
            # 获取文件夹和文件
            items = []
            
            # 定义允许的文件扩展名
            allowed_extensions = {
                # 图片
                '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif', '.ico', '.svg',
                # 视频
                '.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv', '.m4v', '.mpg', '.mpeg',
                # JSON文件
                '.json'
            }
            
            try:
                print(f"[CatSee] Scanning directory: {dir_path}")
                file_count = 0
                folder_count = 0
                skipped_count = 0
                
                for item in dir_path.iterdir():
                    if item.is_dir():
                        # 始终显示文件夹
                        folder_info = {
                            "name": item.name,
                            "path": str(item),
                            "type": "folder",
                            "size": 0,
                            "modified_time": item.stat().st_mtime,
                            "created_time": item.stat().st_ctime,
                            "is_folder": True
                        }
                        items.append(folder_info)
                        folder_count += 1
                    elif item.is_file():
                        # 只显示允许的文件类型
                        ext = item.suffix.lower()
                        if ext in allowed_extensions:
                            try:
                                # 获取基本文件信息（不包含详细元数据，加快速度）
                                file_info = self._get_file_info(item, include_metadata=False)
                                if file_info:
                                    file_info["is_folder"] = False
                                    items.append(file_info)
                                else:
                                    # 如果获取详细信息失败，使用简化信息
                                    stat = item.stat()
                                    file_info = {
                                        "name": item.name,
                                        "path": str(item),
                                        "type": "file",
                                        "size": stat.st_size,
                                        "extension": ext,
                                        "modified_time": stat.st_mtime,
                                        "created_time": stat.st_ctime,
                                        "is_folder": False
                                    }
                                    items.append(file_info)
                                file_count += 1
                            except Exception as e:
                                print(f"[CatSee] Error getting file info for {item.name}: {e}")
                        else:
                            skipped_count += 1
                
                print(f"[CatSee] Found: {folder_count} folders, {file_count} files, {skipped_count} skipped")
                print(f"[CatSee] Total items returned: {len(items)}")
            except PermissionError:
                return {
                    "items": [], 
                    "total": 0, 
                    "page": page, 
                    "per_page": per_page, 
                    "current_path": str(directory_path),
                    "parent_path": str(dir_path.parent) if dir_path.parent != dir_path else None,
                    "error": "权限不足"
                }
            
            # 排序：文件夹在前，然后按名称排序
            items.sort(key=lambda x: (not x["is_folder"], x["name"].lower()))
            
            # 按类型过滤（只对文件）
            if file_type:
                items = [item for item in items if item["is_folder"] or item.get("type") == file_type]
            
            # 分页
            total = len(items)
            start = (page - 1) * per_page
            end = start + per_page
            items = items[start:end]
            
            return {
                "items": items,
                "total": total,
                "page": page,
                "per_page": per_page,
                "current_path": str(directory_path),
                "parent_path": str(dir_path.parent) if dir_path.parent != dir_path else None
            }
            
        except Exception as e:
            return {
                "items": [], 
                "total": 0, 
                "page": page, 
                "per_page": per_page, 
                "current_path": str(directory_path),
                "error": f"浏览目录时出错: {str(e)}"
            }

    def get_outputs(self, page=1, per_page=10000, file_type=None):
        """获取输出文件列表（保持向后兼容）"""
        outputs_dir = config.get_outputs_dir()
        return self.browse_directory(outputs_dir, page, per_page, file_type)
    
    def search_files(self, query, file_type=None):
        """搜索文件"""
        outputs_dir = config.get_outputs_dir()
        files = self.scan_directory(outputs_dir)
        
        # 按类型过滤
        if file_type:
            files = [f for f in files if f['type'] == file_type]
        
        # 按查询条件过滤
        if query:
            query = query.lower()
            filtered_files = []
            for file_info in files:
                if (query in file_info['name'].lower() or 
                    query in file_info.get('relative_path', '').lower()):
                    filtered_files.append(file_info)
            files = filtered_files
        
        return files
    
    def delete_file(self, file_path):
        """删除文件"""
        try:
            file_path = Path(file_path)
            if file_path.exists():
                file_path.unlink()
                
                # 删除对应的缩略图
                file_hash = self._get_file_hash(file_path, fast=True)
                thumb_path = config.get_temp_dir() / "thumbnails" / f"{file_hash}.jpg"
                if thumb_path.exists():
                    thumb_path.unlink()
                
                return True
        except Exception as e:
            print(f"[ComfyUI Browser] Error deleting file: {e}")
        return False
    
    def copy_file(self, src_path, dst_path):
        """复制文件"""
        try:
            shutil.copy2(src_path, dst_path)
            return True
        except Exception as e:
            print(f"[ComfyUI Browser] Error copying file: {e}")
            return False
    
    def move_file(self, src_path, dst_path):
        """移动文件"""
        try:
            shutil.move(src_path, dst_path)
            return True
        except Exception as e:
            print(f"[ComfyUI Browser] Error moving file: {e}")
            return False
    
    def get_drives(self):
        """获取系统驱动器列表"""
        drives = []
        
        if platform.system() == "Windows":
            # Windows系统获取驱动器
            import string
            print("[ComfyUI Browser] Scanning for drives...")
            
            for drive_letter in string.ascii_uppercase:
                drive_path = f"{drive_letter}:\\"
                
                # 检查驱动器是否存在
                if os.path.exists(drive_path):
                    print(f"[ComfyUI Browser] Found drive: {drive_path}")
                    try:
                        # 尝试访问驱动器以确认可用
                        os.listdir(drive_path)
                        drives.append({
                            "name": f"本地磁盘 ({drive_letter}:)",
                            "path": drive_path,
                            "type": "drive",
                            "is_folder": True,
                            "size": 0,
                            "icon": "💿"
                        })
                        print(f"[ComfyUI Browser] Drive {drive_letter}: accessible")
                    except PermissionError:
                        # 驱动器存在但无权限访问，仍然显示
                        drives.append({
                            "name": f"本地磁盘 ({drive_letter}:)",
                            "path": drive_path,
                            "type": "drive",
                            "is_folder": True,
                            "size": 0,
                            "icon": "💿"
                        })
                        print(f"[ComfyUI Browser] Drive {drive_letter}: no permission but added")
                    except OSError as e:
                        # 其他错误，仍然尝试添加
                        drives.append({
                            "name": f"本地磁盘 ({drive_letter}:)",
                            "path": drive_path,
                            "type": "drive",
                            "is_folder": True,
                            "size": 0,
                            "icon": "💿"
                        })
                        print(f"[ComfyUI Browser] Drive {drive_letter}: error but added - {e}")
            
            print(f"[ComfyUI Browser] Total drives found: {len(drives)}")
        else:
            # Unix/Linux系统
            drives.append({
                "name": "根目录 (/)",
                "path": "/",
                "type": "drive",
                "is_folder": True,
                "size": 0,
                "icon": "💿"
            })
        
        return drives
    
    def get_quick_access(self):
        """获取快速访问目录"""
        quick_dirs = []
        
        # 用户目录
        home_dir = Path.home()
        quick_dirs.append({
            "name": "用户文件夹",
            "path": str(home_dir),
            "type": "quick",
            "is_folder": True,
            "size": 0,
            "icon": "👤"
        })
        
        # 桌面
        desktop = home_dir / "Desktop"
        if desktop.exists():
            quick_dirs.append({
                "name": "桌面",
                "path": str(desktop),
                "type": "quick",
                "is_folder": True,
                "size": 0,
                "icon": "🖥️"
            })
        
        # 文档
        documents = home_dir / "Documents"
        if documents.exists():
            quick_dirs.append({
                "name": "文档",
                "path": str(documents),
                "type": "quick",
                "is_folder": True,
                "size": 0,
                "icon": "📄"
            })
        
        # 下载
        downloads = home_dir / "Downloads"
        if downloads.exists():
            quick_dirs.append({
                "name": "下载",
                "path": str(downloads),
                "type": "quick",
                "is_folder": True,
                "size": 0,
                "icon": "⬇️"
            })
        
        # 图片
        pictures = home_dir / "Pictures"
        if pictures.exists():
            quick_dirs.append({
                "name": "图片",
                "path": str(pictures),
                "type": "quick",
                "is_folder": True,
                "size": 0,
                "icon": "🖼️"
            })
        
        # ComfyUI输出目录
        try:
            outputs_dir = config.get_outputs_dir()
            quick_dirs.append({
                "name": "ComfyUI输出",
                "path": outputs_dir,
                "type": "quick",
                "is_folder": True,
                "size": 0,
                "icon": "🎨"
            })
        except:
            pass
        
        return quick_dirs
    
    def get_file_metadata(self, file_path):
        """获取单个文件的详细元数据
        
        Args:
            file_path: 文件路径（字符串）
            
        Returns:
            包含详细元数据的字典，如果失败返回None
        """
        try:
            path = Path(file_path)
            if not path.exists() or not path.is_file():
                return None
            
            # 获取包含详细元数据的文件信息
            return self._get_file_info(path, include_metadata=True)
        except Exception as e:
            print(f"[ComfyUI Browser] Error getting file metadata: {e}")
            return None

# 全局文件管理器实例
file_manager = FileManager()
