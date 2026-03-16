#!/usr/bin/env python3
"""
Slot Filling - 槽位填充与追问
判断消费意图信息是否完整，生成追问问题
"""

from typing import Dict, List, Optional

# 必填字段
REQUIRED_FIELDS = ["intent_type", "target"]

# 字段中文名
FIELD_NAMES = {
    "intent_type": "消费类型",
    "target": "购买对象",
    "object": "具体商品",
    "scene": "使用场景",
    "budget": "预算",
    "time": "时间"
}

# 追问问题模板
QUESTION_TEMPLATES = {
    "intent_type": {
        "question": "想买什么类型的产品？",
        "options": [
            {"value": "education", "label": "1. 学习用品"},
            {"value": "appliance", "label": "2. 家电"},
            {"value": "food", "label": "3. 食品饮料"},
            {"value": "daily", "label": "4. 日用品"},
            {"value": "digital", "label": "5. 数码产品"},
            {"value": "clothing", "label": "6. 服装鞋帽"},
            {"value": "entertainment", "label": "7. 娱乐玩具"},
            {"value": "health", "label": "8. 医疗保健"},
            {"value": "service", "label": "9. 生活服务"}
        ]
    },
    "target": {
        "question": "是给谁购买的？",
        "options": [
            {"value": "自己", "label": "1. 自己"},
            {"value": "孩子", "label": "2. 孩子"},
            {"value": "家庭", "label": "3. 家庭"},
            {"value": "父母", "label": "4. 父母"}
        ]
    },
    "budget": {
        "question": "预算大概是多少？",
        "options": [
            {"value": {"min": 0, "max": 100}, "label": "1. 100元以内"},
            {"value": {"min": 100, "max": 300}, "label": "2. 100-300元"},
            {"value": {"min": 300, "max": 500}, "label": "3. 300-500元"},
            {"value": {"min": 500, "max": 1000}, "label": "4. 500-1000元"},
            {"value": {"min": 1000, "max": 5000}, "label": "5. 1000-5000元"},
            {"value": {"min": 5000, "max": 999999}, "label": "6. 5000元以上"}
        ]
    },
    "object": {
        "question": "具体想买什么产品？",
        "options": None  # 开放性问题
    },
    "scene": {
        "question": "是什么场景需要？",
        "options": [
            {"value": "日常", "label": "1. 日常使用"},
            {"value": "开学", "label": "2. 开学季"},
            {"value": "节日", "label": "3. 节日礼物"},
            {"value": "坏了", "label": "4. 坏了要换"},
            {"value": "促销", "label": "5. 促销活动"}
        ]
    },
    "time": {
        "question": "什么时候需要？",
        "options": [
            {"value": "now", "label": "1. 马上"},
            {"value": "soon", "label": "2. 最近"},
            {"value": "future", "label": "3. 以后再说"}
        ]
    }
}

# 追问优先级
FILLING_ORDER = ["target", "intent_type", "budget", "object", "scene", "time"]


def check_completeness(intent: Dict) -> Dict:
    """
    检查意图信息完整性
    
    Args:
        intent: 意图字典
        
    Returns:
        dict: 完整性检查结果
    """
    missing_fields = []
    
    for field in REQUIRED_FIELDS:
        if not intent.get(field):
            missing_fields.append(field)
    
    return {
        "is_complete": len(missing_fields) == 0,
        "missing_fields": missing_fields,
        "filled_fields": [f for f in REQUIRED_FIELDS if intent.get(f)]
    }


def get_next_question(missing_fields: List[str]) -> Optional[Dict]:
    """
    获取下一个追问问题
    
    Args:
        missing_fields: 缺失字段列表
        
    Returns:
        dict: 追问问题配置
    """
    # 按优先级选择
    for field in FILLING_ORDER:
        if field in missing_fields and field in QUESTION_TEMPLATES:
            template = QUESTION_TEMPLATES[field]
            return {
                "field": field,
                "question": template["question"],
                "options": template["options"]
            }
    
    return None


def check_and_fill(intent: Dict) -> Dict:
    """
    检查并填充槽位
    
    Args:
        intent: 当前意图
        
    Returns:
        dict: 检查结果 + 追问
    """
    completeness = check_completeness(intent)
    
    result = {
        "is_complete": completeness["is_complete"],
        "missing_fields": completeness["missing_fields"],
        "current_intent": intent
    }
    
    if not completeness["is_complete"]:
        next_q = get_next_question(completeness["missing_fields"])
        result["next_question"] = next_q
    
    return result


def format_question(question: Dict) -> str:
    """
    格式化追问问题为文本
    
    Args:
        question: 问题配置
        
    Returns:
        str: 格式化的追问文本
    """
    lines = [question["question"], ""]
    
    if question.get("options"):
        for opt in question["options"]:
            lines.append(opt["label"])
    else:
        lines.append("（请直接告诉我）")
    
    return "\n".join(lines)


def format_intent_summary(intent: Dict) -> str:
    """格式化当前意图信息"""
    lines = ["📋 当前信息：", ""]
    
    for field, name in FIELD_NAMES.items():
        value = intent.get(field)
        if value:
            if field == "budget" and isinstance(value, dict):
                if value.get("type") == "exact":
                    lines.append(f"  {name}: {value['min']}元")
                else:
                    lines.append(f"  {name}: {value['min']}-{value['max']}元")
            else:
                lines.append(f"  {name}: {value}")
    
    return "\n".join(lines)


if __name__ == "__main__":
    import sys
    import json
    
    # 从命令行参数或 stdin 读取
    if len(sys.argv) > 1:
        # 命令行参数是 JSON 字符串
        try:
            intent = json.loads(sys.argv[1])
        except:
            print(json.dumps({"error": "Invalid JSON"}))
            sys.exit(1)
    else:
        # 从 stdin 读取
        intent = json.load(sys.stdin)
    
    result = check_and_fill(intent)
    print(json.dumps(result, ensure_ascii=False))
