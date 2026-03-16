#!/usr/bin/env python3
"""
家庭消费意图识别器
从自然语言中识别消费意图
"""

import json
import re
from datetime import datetime

# 消费类型关键词映射
INTENT_KEYWORDS = {
    "education": ["开学", "学习", "补习", "培训", "学校", "书包", "文具", "作业", "学费", "辅导"],
    "appliance": ["冰箱", "空调", "洗衣机", "电视", "家电", "坏了", "维修", "换一个", "买新的"],
    "food": ["吃", "水果", "零食", "买菜", "做饭", "牛奶", "饮料", "外卖", "餐厅"],
    "daily": ["日用品", "牙膏", "洗衣液", "纸巾", "洗发水", "沐浴露", "生活用品"],
    "digital": ["手机", "电脑", "平板", "笔记本", "耳机", "数码", "电子产品"],
    "clothing": ["衣服", "鞋子", "裤子", "裙子", "外套", "童装", "成人装"],
    "entertainment": ["玩具", "游戏", "旅游", "电影", "娱乐", "周末玩"],
    "health": ["体检", "药", "补品", "保健品", "医院", "身体", "看病"],
    "service": ["维修", "搬家", "家政", "保洁", "服务", "安装"]
}

# 消费对象关键词
TARGET_KEYWORDS = {
    "自己": ["我", "自己", "给我"],
    "孩子": ["孩子", "小孩", "儿子", "女儿", "宝宝", "小朋友", "儿童"],
    "家庭": ["家里", "家用", "家里用", "全家"],
    "父母": ["父母", "爸爸", "妈妈", "老人家", "老人", "公婆", "岳父母"]
}

# 场景关键词
SCENE_KEYWORDS = {
    "开学": ["开学", "上学", "新学期", "返校"],
    "节日": ["节日", "春节", "中秋", "国庆", "生日", "过年"],
    "坏了": ["坏了", "坏了", "不能用了", "坏了"],
    "换季": ["换季", "春天", "夏天", "冬天", "秋天"],
    "促销": ["促销", "打折", "优惠", "双11", "618"]
}

# 时间关键词
TIME_KEYWORDS = {
    "now": ["现在", "马上", "立即", "这会"],
    "soon": ["最近", "这几天", "马上"],
    "future": ["以后", "以后", "将来", "以后再说"]
}

# 预算关键词
BUDGET_KEYWORDS = {
    (0, 100): ["几十", "一百以内", "一百以下", "便宜"],
    (100, 300): ["一百到三百", "两三百", "三百以内"],
    (300, 500): ["三四百", "五百以内"],
    (500, 1000): ["一千以内", "几百", "千把块"],
    (1000, 5000): ["一千以上", "几千", "五千元以内"],
    (5000, float('inf')): ["上万", "贵", "不差钱"]
}


def detect_intent(text: str) -> dict:
    """
    识别消费意图
    
    Args:
        text: 用户输入文本
        
    Returns:
        dict: 意图识别结果
    """
    result = {
        "intent_type": None,
        "object": None,
        "target": None,
        "scene": None,
        "budget": None,
        "time": None,
        "raw_text": text,
        "keywords": []
    }
    
    # 识别消费类型
    result["intent_type"] = _detect_intent_type(text)
    
    # 识别消费对象
    result["target"] = _detect_target(text)
    
    # 识别场景
    result["scene"] = _detect_scene(text)
    
    # 识别时间
    result["time"] = _detect_time(text)
    
    # 识别预算
    result["budget"] = _detect_budget(text)
    
    # 提取关键词
    result["keywords"] = _extract_keywords(text)
    
    # 判断信息完整度
    result["is_complete"] = _is_complete(result)
    
    return result


def _detect_intent_type(text: str) -> str:
    """识别消费类型"""
    scores = {}
    for intent_type, keywords in INTENT_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > 0:
            scores[intent_type] = score
    
    if scores:
        return max(scores, key=scores.get)
    return None


def _detect_target(text: str) -> str:
    """识别消费对象"""
    for target, keywords in TARGET_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            return target
    return None


def _detect_scene(text: str) -> str:
    """识别消费场景"""
    for scene, keywords in SCENE_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            return scene
    return None


def _detect_time(text: str) -> str:
    """识别时间"""
    for time_val, keywords in TIME_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            return time_val
    return "future"


def _detect_budget(text: str) -> dict:
    """识别预算"""
    # 尝试匹配具体数字
    money_pattern = r'(\d+)\s*元'
    match = re.search(money_pattern, text)
    if match:
        return {"min": int(match.group(1)), "max": int(match.group(1)), "type": "exact"}
    
    # 尝试匹配范围
    range_pattern = r'(\d+)\s*-\s*(\d+)\s*元'
    match = re.search(range_pattern, text)
    if match:
        return {"min": int(match.group(1)), "max": int(match.group(2)), "type": "range"}
    
    # 尝试关键词匹配
    for (min_budget, max_budget), keywords in BUDGET_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            return {"min": min_budget, "max": max_budget, "type": "range"}
    
    return None


def _extract_keywords(text: str) -> list:
    """提取关键词"""
    keywords = []
    all_keywords = []
    
    for keywords_list in INTENT_KEYWORDS.values():
        all_keywords.extend(keywords_list)
    for keywords_list in TARGET_KEYWORDS.values():
        all_keywords.extend(keywords_list)
    for keywords_list in SCENE_KEYWORDS.values():
        all_keywords.extend(keywords_list)
    
    for kw in all_keywords:
        if kw in text:
            keywords.append(kw)
    
    return list(set(keywords))


def _is_complete(intent: dict) -> bool:
    """判断意图信息是否完整"""
    required_fields = ["intent_type", "target"]
    return all(intent.get(field) for field in required_fields)


def format_intent(intent: dict) -> str:
    """格式化意图输出"""
    lines = ["📋 消费意图识别结果：", ""]
    
    if intent.get("intent_type"):
        lines.append(f"🛍️ 类型：{intent['intent_type']}")
    if intent.get("object"):
        lines.append(f"📦 商品：{intent['object']}")
    if intent.get("target"):
        lines.append(f"👤 对象：{intent['target']}")
    if intent.get("scene"):
        lines.append(f"🎬 场景：{intent['scene']}")
    if intent.get("budget"):
        b = intent["budget"]
        if b.get("type") == "exact":
            lines.append(f"💰 预算：{b['min']}元")
        else:
            lines.append(f"💰 预算：{b['min']}-{b['max']}元")
    if intent.get("time"):
        time_map = {"now": "现在", "soon": "近期", "future": "以后"}
        lines.append(f"⏰ 时间：{time_map.get(intent['time'], intent['time'])}")
    
    lines.append("")
    lines.append(f"✅ 信息完整" if intent.get("is_complete") else "❌ 信息不完整")
    
    return "\n".join(lines)


if __name__ == "__main__":
    import sys
    import json
    
    if len(sys.argv) > 1:
        text = sys.argv[1]
        result = detect_intent(text)
        print(json.dumps(result, ensure_ascii=False))
    else:
        test_texts = [
            "孩子要开学了",
            "家里冰箱坏了",
            "想买点水果",
            "给孩子买书包",
            "给我自己买件衣服"
        ]
        
        for text in test_texts:
            print(f"\n输入：{text}")
            result = detect_intent(text)
            print(format_intent(result))
