# 家庭消费意图识别系统

智能识别家庭消费意图，支持 LLM 驱动和规则匹配双模式。

## 功能特性

- 🎯 **意图识别** - 智能识别消费意图
- 🤖 **LLM 驱动** - 支持 MiniMax 大模型
- 📷 **图片 OCR** - 支持图片识别消费意图
- 🏠 **家庭画像** - 个性化用户画像
- 💬 **LLM 对话** - AI 助手对话功能
- 💡 **消费建议** - 基于画像的个性化建议

## 快速开始

### 1. 安装依赖 （通过 requirements.txt）
# 建议先创建并激活虚拟环境（可选但推荐）
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate  # Windows

# 安装 requirements.txt 中的所有依赖
pip install -r requirements.txt

# OCR 额外系统依赖（仅 Linux/macOS）
# macOS: brew install tesseract
# Ubuntu/Debian: sudo apt install tesseract-ocr

### 2. 启动 API 服务

```bash
cd family-intent-recognition-v1.0.2
python3 api.py
```

服务启动后访问：
- API: http://localhost:5000
- 意图识别: http://localhost:5000/intent
- 家庭画像: http://localhost:5000/profile
- LLM 对话: http://localhost:5000/chat

### 3. 启动 Web 前端

```bash
# 方法1: 直接打开 HTML 文件
# 浏览器访问: file:///path/to/family-intent-frontend.html

# 方法2: 使用 HTTP 服务器
cd /path/to/workspace
python3 -m http.server 8080
# 浏览器访问: http://localhost:8080/family-intent-frontend.html
```

### 4. 局域网访问

获取本机 IP：
```bash
hostname -I | awk '{print $1}'
```

前端访问地址：
```
http://192.168.x.x:8080/family-intent-frontend.html
```

## API 使用

### 意图识别

```bash
curl -X POST http://localhost:5000/intent \
  -H "Content-Type: application/json" \
  -d '{"text":"想买一台电脑"}'
```

返回格式：
```json
{
  "intent": true,
  "category": "数码产品",
  "target": "电脑",
  "scenario": "自用",
  "budget": "",
  "time": "",
  "location": "",
  "user_profile": "收入低，消费节俭...",
  "motivation": ""
}
```

### 设置家庭画像

```bash
curl -X POST http://localhost:5000/profile \
  -H "Content-Type: application/json" \
  -d '{
    "family_name": "吴海超家",
    "members": ["爸爸", "妈妈"],
    "income_level": "高",
    "spending_habit": "中等",
    "has_child": true
  }'
```

### LLM 对话

```bash
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"推荐一款手机"}'
```

### 图片识别

```bash
curl -X POST http://localhost:5000/intent/image \
  -H "Content-Type: application/json" \
  -d '{"image":"base64_encoded_image_data"}'
```

## 配置 LLM

修改 `intent_classifier.py` 中的配置：

```python
LLM_API_URL = "https://api.minimaxi.com/v1/text/chatcompletion_v2"
LLM_MODEL = "abab6.5s-chat"
LLM_API_KEY = "your-api-key"
```

## 目录结构

```
family-intent-recognition-v1.0.2/
├── api.py                     # Flask API 服务
├── intent_classifier.py       # 意图识别核心
├── family_profile.py          # 家庭画像管理
├── cli.py                     # 命令行工具
└── family-intent-frontend.html # Web 前端
```

## 依赖

```bash
pip install flask flask-cors requests
# OCR 支持（可选）
pip install pytesseract
sudo apt install tesseract-ocr
```

## 许可证

MIT
