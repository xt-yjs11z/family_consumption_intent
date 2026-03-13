# Whisper Skill

语音转文字功能。使用 faster-whisper 将音频转为文本。

## 安装

```bash
pip install faster-whisper
```

## 使用方式

当用户发送语音消息时：
1. 下载语音文件（飞书语音是 .m4a 格式）
2. 使用 faster-whisper 转录
3. 返回文字内容

## Python 脚本

```python
from faster_whisper import WhisperModel

def transcribe_audio(audio_path, model_size="base"):
    """转录音频文件"""
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    segments, info = model.transcribe(audio_path, language="zh")
    
    text = ""
    for segment in segments:
        text += segment.text
    
    return text.strip()

if __name__ == "__main__":
    import sys
    audio_file = sys.argv[1] if len(sys.argv) > 1 else "audio.m4a"
    result = transcribe_audio(audio_file)
    print(result)
```

## 命令行示例

```bash
# 转录音频文件
python3 transcribe.py audio.m4a

# 使用更大的模型（更准确但更慢）
# tiny, base, small, medium, large
python3 transcribe.py audio.m4a --model small
```
