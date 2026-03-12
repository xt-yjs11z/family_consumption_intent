#!/usr/bin/env python3
"""
家庭消费意图识别系统 V4.0 - 智能版本
优先使用LLM，LLM不可用时自动降级到规则匹配
"""

import os
import json
import re
import requests
from typing import Optional

# LLM API 配置 - MiniMax
LLM_API_URL = os.environ.get("LLM_API_URL", "https://api.minimaxi.com/v1/text/chatcompletion_v2")
LLM_MODEL = os.environ.get("LLM_MODEL", "abab6.5s-chat")
LLM_API_KEY = os.environ.get("MINIMAX_API_KEY", "sk-cp-0mOyo4266Euze4S51QEb3BZqfr52Y_BkxRL-LrhfRqPzjIbsCh4EI7Nh2SM7bW4dIJoANFfgdFNrUcPQzDKQJy5K_I2SMBWphj0NsJRISfd5pRvTmQF0SD8")
LLM_TIMEOUT = int(os.environ.get("LLM_TIMEOUT", "30"))

# 尝试导入家庭画像模块
try:
    from family_profile import get_profile, get_spending_advice, load_profile
    PROFILE_ENABLED = True
except ImportError:
    PROFILE_ENABLED = False

# ==================== 规则匹配引擎 ====================

CATEGORY_KEYWORDS = {
    "家电": ["电视", "冰箱", "洗衣机", "空调", "风扇", "电饭煲", "微波炉", "油烟机", "热水器", "净化器", "扫地机", "吸尘器", "空气净化器", "加湿器", "空气炸锅", "咖啡机", "投影仪", "烤箱", "跑步机", "按摩椅", "洗碗机", "智能门锁", "监控", "摄像头", "烘干机", "灯具"],
    "数码产品": ["手机", "电脑", "平板", "耳机", "音箱", "相机", "摄像机", "无人机", "智能手表", "手环", "电动牙刷"],
    "电脑外设": ["键盘", "鼠标", "显示器", "硬盘", "内存", "显卡", "U盘", "移动硬盘"],
    "家具": ["沙发", "床", "衣柜", "书桌", "餐桌", "椅子", "鞋柜", "电视柜", "书架", "床垫"],
    "食品饮料": ["零食", "饮料", "水果", "牛奶", "酸奶", "茶叶", "咖啡", "保健品", "奶粉", "食品", "菜", "肉"],
    "服装鞋帽": ["衣服", "裤子", "裙子", "外套", "羽绒服", "T恤", "运动鞋", "皮鞋", "帽子", "围巾", "包包", "化妆品", "护肤品", "鞋"],
    "日用品": ["洗发水", "沐浴露", "牙膏", "牙刷", "毛巾", "纸巾", "洗衣液", "洗洁精", "垃圾袋", "保鲜膜"],
    "汽车": ["汽车", "电动车", "摩托车", "车险", "行车记录仪"],
    "交通工具": ["自行车", "电动车", "滑板车", "平衡车"],
    "母婴用品": ["奶粉", "尿不湿", "婴儿车", "婴儿床", "玩具", "童装", "奶瓶"],
    "娱乐产品": ["电影", "演唱会", "旅游", "游戏", "健身", "图书", "乐器", "摄影", "KTV", "唱歌", "美容", "按摩"],
    "教育培训": ["培训", "课程", "学费", "辅导班", "英语班", "钢琴课", "游泳课", "驾校"],
    "医疗保健": ["药品", "保健品", "体检", "保险", "眼镜", "牙科", "医院", "药", "感冒"],
    "通讯费": ["话费", "流量", "网费", "宽带"],
    "水电燃气": ["电费", "水费", "燃气费", "物业费", "房租"],
    "餐饮": ["火锅", "烧烤", "自助", "日料", "西餐", "快餐", "外卖", "餐厅", "吃饭", "下馆子"],
    "服务": ["酒店", "机票", "旅游团", "剪头发", "理发", "KTV", "逛街"],
}

STAGE_KEYWORDS = {
    "awareness": ["不错", "挺好", "好看", "漂亮", "看中", "相中", "有个", "发现", "看到", "听说", "坏了"],
    "consideration": ["多少钱", "价格", "贵不贵", "便宜吗", "性价比", "怎么样", "好不好", "哪个好", "哪个牌子", "推荐", "建议", "评价", "对比", "比较"],
    "purchase": ["买了", "下单", "要买", "准备买", "打算买", "计划买", "想买", "想买一个", "想买台", "买了", "充", "缴费", "付钱", "花了", "换了", "换个"]
}

STRENGTH_PATTERNS = {
    "high": ["买了", "下单", "要买", "打算买", "准备买", "想买", "充", "缴费", "付钱", "花了"],
    "medium": ["想要", "计划买", "考虑买", "多少钱", "价格", "怎么样", "好不好", "推荐"],
    "low": ["不错", "挺好", "好看", "有个", "听说", "坏了"]
}


def rule_based_classify(text: str) -> dict:
    """规则匹配引擎"""
    keywords = []
    
    # 提取关键词
    for stage, kws in STAGE_KEYWORDS.items():
        for kw in kws:
            if kw in text:
                keywords.append(kw)
    
    for category, kws in CATEGORY_KEYWORDS.items():
        for kw in kws:
            if kw in text:
                keywords.append(kw)
    
    # 提取类别
    category = "unknown"
    for cat, kws in CATEGORY_KEYWORDS.items():
        for kw in kws:
            if kw in text:
                category = cat
                break
        if category != "unknown":
            break
    
    # 提取商品
    product = ""
    for cat, kws in CATEGORY_KEYWORDS.items():
        for kw in kws:
            if kw in text and len(kw) >= 2:
                product = kw
                break
        if product:
            break
    
    # 判断阶段
    stage = "awareness"
    for kw in STAGE_KEYWORDS["purchase"]:
        if kw in text:
            stage = "purchase"
            break
    if stage == "awareness":
        for kw in STAGE_KEYWORDS["consideration"]:
            if kw in text:
                stage = "consideration"
                break
    
    # 判断强度
    strength = "low"
    for kw in STRENGTH_PATTERNS["high"]:
        if kw in text:
            strength = "high"
            break
    if strength == "low":
        for kw in STRENGTH_PATTERNS["medium"]:
            if kw in text:
                strength = "medium"
                break
    
    # 判断是否有意图
    has_intent = stage in ["purchase", "consideration"] or (category != "unknown" and len(keywords) > 0)
    
    # 生成理由
    if not has_intent:
        reason = "对话中未出现消费意图"
    elif stage == "purchase":
        reason = "用户明确表达购买意向"
    elif stage == "consideration":
        reason = "用户在询问价格或进行比较"
    else:
        reason = "用户对某商品表达兴趣"
    
    return {
        "has_intent": has_intent,
        "intent_category": category,
        "intent_stage": stage,
        "intent_strength": strength,
        "keywords": list(set(keywords))[:5],
        "product": product,
        "reason": reason,
        "method": "rule"
    }


# ==================== LLM 引擎 ====================

def call_llm(prompt: str) -> str:
    """调用 LLM API"""
    headers = {"Content-Type": "application/json"}
    if LLM_API_KEY:
        headers["Authorization"] = f"Bearer {LLM_API_KEY}"
    
    payload = {
        "model": LLM_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
        "max_tokens": 500
    }
    
    try:
        response = requests.post(LLM_API_URL, json=payload, headers=headers, timeout=LLM_TIMEOUT)
        response.raise_for_status()
        result = response.json()
        
        # MiniMax 格式
        if "choices" in result and len(result["choices"]) > 0:
            content = result["choices"][0].get("message", {}).get("content", "")
            if isinstance(content, dict):
                return content.get("text", str(content))
            return content
        # OpenAI 兼容响应
        elif "choices" in result and len(result["choices"]) > 0:
            return result["choices"][0]["message"]["content"]
        # Ollama 响应格式
        elif "message" in result:
            return result["message"]["content"]
        else:
            return str(result)
    except Exception as e:
        raise Exception(f"LLM调用失败: {str(e)}")


def llm_classify(text: str, profile: dict = None) -> dict:
    """使用 LLM 进行意图识别"""
    
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
家庭画像信息：
- 家庭名称：{profile.get("family_name", "默认家庭")}
- 成员：{", ".join(members) if members else "未设置"}
- 收入水平：{income}
- 消费习惯：{habit}
- 特殊成员：{", ".join(special) if special else "无"}
"""

    prompt = f"""你是一个家庭消费意图识别助手。根据用户输入的文本，识别是否存在消费意图。

{profile_info}

请分析以下文本：
"{text}"

商品类别：家电、数码产品、电脑外设、家具、食品饮料、服装鞋帽、日用品、汽车、交通工具、母婴用品、娱乐产品、教育培训、医疗保健、通讯费、水电燃气、餐饮、服务

意图阶段：awareness(兴趣阶段-只是提到)、consideration(考虑阶段-询问价格/比较)、purchase(购买阶段-明确要买)
意图强度：low(低)、medium(中)、high(高)

请以JSON格式返回：
{{"has_intent":true/false,"intent_category":"类别","intent_stage":"阶段","intent_strength":"强度","keywords":["关键词"],"product":"具体商品","reason":"判断理由"}}

只返回JSON。"""

    try:
        llm_response = call_llm(prompt)
        
        # 解析 JSON
        json_match = re.search(r'\{[^{}]*\}', llm_response, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
        else:
            result = json.loads(llm_response)
        
        result["method"] = "llm"
        return result
        
    except Exception as e:
        raise Exception(f"LLM识别失败: {str(e)}")


# ==================== 主函数 ====================

_llm_available = None


def check_llm_available() -> bool:
    """检查 LLM 是否可用"""
    global _llm_available
    if _llm_available is not None:
        return _llm_available
    
    try:
        headers = {"Content-Type": "application/json"}
        if LLM_API_KEY:
            headers["Authorization"] = f"Bearer {LLM_API_KEY}"
        
        # 测试 API
        payload = {"model": LLM_MODEL, "messages": [{"role": "user", "content": "hi"}], "stream": False, "max_tokens": 10}
        resp = requests.post(LLM_API_URL, json=payload, headers=headers, timeout=15)
        
        if resp.status_code == 200:
            _llm_available = True
            return True
        else:
            print(f"[WARN] LLM API返回: {resp.status_code} - {resp.text[:100]}")
            _llm_available = False
            return False
    except Exception as e:
        print(f"[WARN] LLM检测失败: {e}")
        _llm_available = False
        return False


def classify(text: str) -> dict:
    """
    家庭消费意图识别主函数
    优先尝试 LLM，失败则自动降级到规则匹配
    """
    # 获取家庭画像
    profile = None
    if PROFILE_ENABLED:
        try:
            profile = get_profile()
        except:
            profile = None
    
    # 尝试 LLM
    if check_llm_available():
        try:
            result = llm_classify(text, profile)
            # 添加画像和建议
            if profile:
                try:
                    advice = get_spending_advice(result.get("intent_category", ""), profile, result.get("intent_stage", "awareness"))
                    result["spending_advice"] = advice
                except:
                    result["spending_advice"] = ""
            result["family_profile"] = profile
            return result
        except Exception as e:
            print(f"[WARN] LLM调用失败，降级到规则匹配: {e}")
    
    # 降级到规则匹配
    result = rule_based_classify(text)
    
    # 添加画像和建议
    if PROFILE_ENABLED and profile:
        try:
            advice = get_spending_advice(result.get("intent_category", ""), profile, result.get("intent_stage", "awareness"))
            result["spending_advice"] = advice
        except:
            result["spending_advice"] = ""
    result["family_profile"] = profile
    
    return result


def format_result(result: dict) -> str:
    """格式化输出"""
    intent_map = {True: "有", False: "无"}
    strength_map = {"high": "高", "medium": "中", "low": "低"}
    stage_map = {"awareness": "兴趣阶段", "consideration": "考虑阶段", "purchase": "购买阶段"}
    
    lines = [f"🎯 意图: {intent_map.get(result.get('has_intent'), '无')}",
             f"📂 类别: {result.get('intent_category', 'unknown')}",
             f"🛍️ 商品: {result.get('product', '-')}",
             f"📊 强度: {strength_map.get(result.get('intent_strength', 'low'), '低')}",
             f"💡 阶段: {stage_map.get(result.get('intent_stage', 'awareness'), '兴趣阶段')}",
             f"🔧 方法: {result.get('method', 'rule')}"]
    
    profile = result.get('family_profile')
    if profile:
        lines.append(f"🏠 家庭: {profile.get('family_name', '')} | 收入: {profile.get('income_level', '')}")
    
    advice = result.get('spending_advice', '')
    if advice:
        lines.append(f"💡 建议: {advice}")
    
    return "\n".join(lines)


if __name__ == "__main__":
    print("=" * 50)
    print("家庭消费意图识别 V4.0 (LLM优先+规则降级)")
    print("LLM可用:", check_llm_available())
    print("=" * 50)
    
    test_cases = ["明天去吃火锅", "想买一台电脑", "这个手机多少钱", "天气不错"]
    
    for text in test_cases:
        print(f"\n输入: {text}")
        result = classify(text)
        print(f"结果: {json.dumps(result, ensure_ascii=False)}")
