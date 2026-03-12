#!/usr/bin/env python3
"""
家庭消费意图识别 API 服务
支持意图识别和家庭画像管理，支持图片OCR识别
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from intent_classifier import classify, call_llm, load_profile as get_profile
import os
import json
import base64
import tempfile

app = Flask(__name__)
CORS(app, supports_credentials=True)  # 启用跨域支持

# 尝试导入OCR
try:
    import pytesseract
    from PIL import Image
    OCR_ENABLED = True
except ImportError:
    OCR_ENABLED = False

# 家庭画像存储路径
PROFILE_DIR = os.path.expanduser("~/.openclaw/skills-data/family-intent-recognition")
PROFILE_FILE = os.path.join(PROFILE_DIR, "profile.json")

# 默认画像
DEFAULT_PROFILE = {
    "family_name": "默认家庭",
    "members": [],
    "income_level": "中等",
    "spending_habit": "中等",
    "has_elderly": False,
    "has_child": False,
    "has_pregnant": False,
    "common_categories": [],
    "budget_level": "中等",
    "notes": ""
}


def load_profile():
    """加载家庭画像"""
    os.makedirs(PROFILE_DIR, exist_ok=True)
    if os.path.exists(PROFILE_FILE):
        with open(PROFILE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return DEFAULT_PROFILE.copy()


def save_profile(profile):
    """保存家庭画像"""
    os.makedirs(PROFILE_DIR, exist_ok=True)
    with open(PROFILE_FILE, 'w', encoding='utf-8') as f:
        json.dump(profile, f, ensure_ascii=False, indent=2)


@app.route('/intent', methods=['POST'])
def recognize_intent():
    """意图识别接口"""
    data = request.get_json()
    
    if not data or 'text' not in data:
        return jsonify({"error": "缺少 text 字段"}), 400
    
    text = data['text']
    result = classify(text)
    
    return jsonify(result)


@app.route('/profile', methods=['GET'])
def get_profile():
    """获取家庭画像"""
    profile = load_profile()
    return jsonify(profile)


@app.route('/profile', methods=['POST'])
def set_profile():
    """设置家庭画像"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "缺少数据"}), 400
    
    profile = load_profile()
    
    # 更新画像字段
    allowed_fields = [
        "family_name", "members", "income_level", "spending_habit",
        "has_elderly", "has_child", "has_pregnant", "common_categories",
        "budget_level", "notes"
    ]
    
    for field in allowed_fields:
        if field in data:
            profile[field] = data[field]
    
    save_profile(profile)
    
    return jsonify({"status": "ok", "profile": profile})


@app.route('/profile/field', methods=['PUT'])
def update_profile_field():
    """更新单个画像字段"""
    data = request.get_json()
    
    if not data or 'field' not in data or 'value' not in data:
        return jsonify({"error": "缺少 field 或 value 字段"}), 400
    
    field = data['field']
    value = data['value']
    
    profile = load_profile()
    
    if field in profile:
        profile[field] = value
        save_profile(profile)
        return jsonify({"status": "ok", "field": field, "value": value})
    else:
        return jsonify({"error": f"无效字段: {field}"}), 400


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "ocr_enabled": OCR_ENABLED})


@app.route('/intent/image', methods=['POST'])
def recognize_intent_from_image():
    """从图片识别意图（OCR + 意图识别）"""
    if not OCR_ENABLED:
        return jsonify({"error": "OCR 未安装"}), 500
    
    # 处理 Base64 图片
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"error": "缺少 image 字段"}), 400
    
    image_data = data['image']
    
    # 去除 data URL 前缀
    if ',' in image_data:
        image_data = image_data.split(',')[1]
    
    # 解码并保存临时文件
    try:
        img_bytes = base64.b64decode(image_data)
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as f:
            f.write(img_bytes)
            temp_path = f.name
        
        # OCR 识别文字
        text = pytesseract.image_to_string(Image.open(temp_path), lang='chi_sim+eng')
        text = text.strip()
        
        os.unlink(temp_path)
        
        if not text:
            return jsonify({"error": "图片中未识别到文字"}), 400
        
        # 意图识别
        result = classify(text)
        result['ocr_text'] = text
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 对话历史存储
chat_sessions = {}


@app.route('/chat', methods=['POST'])
def chat():
    """LLM 对话接口"""
    data = request.get_json()
    
    if not data or 'message' not in data:
        return jsonify({"error": "缺少 message 字段"}), 400
    
    message = data['message']
    history = data.get('history', [])
    
    # 获取家庭画像
    profile = get_profile()
    
    # 构建 prompt
    profile_info = ""
    if profile:
        members = profile.get("members", [])
        income = profile.get("income_level", "中等")
        habit = profile.get("spending_habit", "中等")
        special = []
        if profile.get("has_child"): special.append("有小孩")
        if profile.get("has_elderly"): special.append("有老人")
        if profile.get("has_pregnant"): special.append("有孕妇")
        
        profile_info = f"""
当前用户家庭画像：
- 家庭名称：{profile.get("family_name", "默认家庭")}
- 成员：{", ".join(members) if members else "未设置"}
- 收入水平：{income}
- 消费习惯：{habit}
- 特殊成员：{", ".join(special) if special else "无"}
"""

    system_prompt = f"""你是一个家庭消费助手，专门帮助用户分析消费意图和购物需求。

{profile_info}

请根据用户的输入，提供有用的建议和信息。可以：
1. 识别消费意图
2. 推荐合适的商品
3. 分析购物需求
4. 提供购物建议

请用友好的语气回复。如果用户提到购物相关内容，可以主动帮他们分析意图。"""

    # 构建消息列表
    messages = [{"role": "system", "content": system_prompt}]
    
    # 添加历史记录
    for msg in history[-10:]:  # 只保留最近10条
        messages.append(msg)
    
    # 添加当前消息
    messages.append({"role": "user", "content": message})
    
    # 调用 LLM
    try:
        # 构建完整 prompt
        full_prompt = system_prompt + "\n\n用户: " + message
        
        # 调用 LLM
        from intent_classifier import LLM_API_URL, LLM_MODEL, LLM_API_KEY, LLM_TIMEOUT
        import requests
        
        headers = {"Content-Type": "application/json"}
        if LLM_API_KEY:
            headers["Authorization"] = f"Bearer {LLM_API_KEY}"
        
        payload = {
            "model": LLM_MODEL,
            "messages": messages,
            "stream": False,
            "max_tokens": 500
        }
        
        response = requests.post(LLM_API_URL, json=payload, headers=headers, timeout=LLM_TIMEOUT)
        response.raise_for_status()
        result = response.json()
        
        # 提取回复
        if "choices" in result and len(result["choices"]) > 0:
            reply = result["choices"][0].get("message", {}).get("content", "")
            if isinstance(reply, dict):
                reply = reply.get("text", str(reply))
        else:
            reply = str(result)
        
        return jsonify({"response": reply})
        
    except Exception as e:
        return jsonify({"error": "LLM调用失败: " + str(e)}), 500


if __name__ == '__main__':
    print("🚀 家庭消费意图识别 API 启动中...")
    print("📍 http://localhost:5000/intent")
    print("📍 http://localhost:5000/chat")
    print("📍 http://localhost:5000/profile (GET/POST)")
    print("📍 http://localhost:5000/profile/field (PUT)")
    app.run(host='0.0.0.0', port=5000, debug=False)
