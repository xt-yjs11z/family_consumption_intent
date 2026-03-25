---
name: edge-tts
description: Microsoft Edge TTS - Convert text to speech
metadata:
  {
    "openclaw":
      {
        "emoji": "🔊",
        "requires": { "bins": ["edge-tts"] },
        "install":
          [
            {
              "id": "pip",
              "kind": "pip",
              "formula": "edge-tts",
              "bins": ["edge-tts"],
              "label": "Install edge-tts (pip)",
            },
          ],
      },
  }
---

# edge-tts

Use `edge-tts` to convert text to speech using Microsoft Edge's TTS engine.

## Quick start

```bash
edge-tts -t "Hello world" --write-media output.mp3
edge-tts -t "你好" --write-media hello.mp3 -v zh-CN-XiaoxiaoNeural
```

## Options

- `-t, --text TEXT` - Text to speak
- `-f, --file FILE` - Text file to read
- `-v, --voice VOICE` - Voice name (default: zh-CN-XiaoxiaoNeural)
- `--write-media FILE` - Output audio file
- `--write-subtitles FILE` - Output subtitle file ( VTT )
- `--rate RATE` - Speed (e.g., +50% or -50%)
- `--volume VOLUME` - Volume (e.g., +50% or -50%)

## Chinese voices

- `zh-CN-XiaoxiaoNeural` - 晓晓 (female)
- `zh-CN-YunxiNeural` - 云希 (male)
- `zh-CN-YunyangNeural` - 云扬 (male)

## Examples

```bash
# Basic usage
edge-tts -t "我想给儿子买个滑板车" --write-media result.mp3

# Specify voice
edge-tts -t "你好" -v zh-CN-YunxiNeural --write-media hello.mp3

# Adjust speed and volume
edge-tts -t "Hello" --rate +50% --volume +20% --write-media fast.mp3
```

## Note

This skill generates audio files locally. After generating, you may need to:
1. Send the file to the user's server
2. Or process the file as needed
