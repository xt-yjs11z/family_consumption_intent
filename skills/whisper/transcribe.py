#!/usr/bin/env python3
"""
语音转文字脚本
使用 openai-whisper 转写语音消息

使用方法:
    python3 transcribe.py <音频文件>

支持的格式: ogg, mp3, wav, m4a 等
"""
import sys
import os

def transcribe_audio(audio_path):
    """使用 whisper 转写音频"""
    try:
        import whisper
        
        # 加载模型 (默认用 base 模型)
        print("加载模型中...")
        model = whisper.load_model("base")
        
        # 转写
        print(f"正在转写: {audio_path}")
        result = model.transcribe(audio_path, language="zh")
        
        print("\n转写结果:")
        print(result["text"])
        
        return result["text"]
    except Exception as e:
        print(f"错误: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    audio_path = sys.argv[1]
    if not os.path.exists(audio_path):
        print(f"文件不存在: {audio_path}")
        sys.exit(1)
    
    transcribe_audio(audio_path)
