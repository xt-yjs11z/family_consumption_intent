#!/usr/bin/env python3
"""
家庭画像管理
支持家庭成员结构、经济状况、消费习惯等画像信息
"""

import json
import os
from typing import Optional

PROFILE_FILE = os.path.expanduser("~/.openclaw/skills-data/family-intent-recognition/profile.json")

# 默认画像结构
DEFAULT_PROFILE = {
    "family_name": "默认家庭",
    "members": [],
    "income_level": "中等",  # 高/中/低
    "spending_habit": "中等",  # 节俭/中等/大方
    "has_elderly": False,  # 是否有老人
    "has_child": False,   # 是否有小孩
    "has_pregnant": False,  # 是否有孕妇
    "common_categories": [],  # 常消费类别
    "budget_level": "中等",  # 高/中/低
    "notes": ""
}

# 画像字段说明
PROFILE_FIELDS = {
    "family_name": "家庭名称",
    "members": "家庭成员列表",
    "income_level": "收入水平 (高/中/低)",
    "spending_habit": "消费习惯 (节俭/中等/大方)",
    "has_elderly": "是否有老人",
    "has_child": "是否有小孩",
    "has_pregnant": "是否有孕妇",
    "common_categories": "常消费类别",
    "budget_level": "预算水平 (高/中/低)",
    "notes": "备注"
}


def load_profile() -> dict:
    """加载家庭画像"""
    if os.path.exists(PROFILE_FILE):
        with open(PROFILE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return DEFAULT_PROFILE.copy()


def save_profile(profile: dict) -> None:
    """保存家庭画像"""
    os.makedirs(os.path.dirname(PROFILE_FILE), exist_ok=True)
    with open(PROFILE_FILE, 'w', encoding='utf-8') as f:
        json.dump(profile, f, ensure_ascii=False, indent=2)


def set_profile(**kwargs) -> dict:
    """设置家庭画像字段"""
    profile = load_profile()
    for key, value in kwargs.items():
        if key in profile:
            profile[key] = value
    save_profile(profile)
    return profile


def get_profile() -> dict:
    """获取家庭画像"""
    return load_profile()


def format_profile(profile: dict = None) -> str:
    """格式化输出家庭画像"""
    if profile is None:
        profile = load_profile()
    
    lines = ["🏠 家庭画像:"]
    lines.append(f"  家庭名称: {profile.get('family_name', '未设置')}")
    lines.append(f"  收入水平: {profile.get('income_level', '中等')}")
    lines.append(f"  消费习惯: {profile.get('spending_habit', '中等')}")
    lines.append(f"  预算水平: {profile.get('budget_level', '中等')}")
    
    # 特殊成员
    special = []
    if profile.get('has_elderly'):
        special.append("老人")
    if profile.get('has_child'):
        special.append("小孩")
    if profile.get('has_pregnant'):
        special.append("孕妇")
    if special:
        lines.append(f"  特殊成员: {', '.join(special)}")
    
    # 常消费类别
    common = profile.get('common_categories', [])
    if common:
        lines.append(f"  常消费: {', '.join(common)}")
    
    # 成员
    members = profile.get('members', [])
    if members:
        lines.append(f"  成员: {', '.join(members)}")
    
    notes = profile.get('notes', '')
    if notes:
        lines.append(f"  备注: {notes}")
    
    return "\n".join(lines)


# 基于画像的消费建议
CATEGORY_ADVICE = {
    "水电燃气": "建议开通自动缴费，避免欠费停电",
    "食品饮料": "注意查看保质期和营养成分",
    "母婴用品": "建议选择安全、环保的产品",
    "数码产品": "建议关注售后保修服务",
    "家电": "建议选择能效高的产品，省电耐用",
    "服装鞋帽": "建议关注性价比，逢年过节再购买",
    "日用品": "可以趁促销活动多囤一些",
    "教育培训": "建议先体验再决定",
    "医疗保健": "建议遵医嘱，不要盲目购买",
    "家具": "建议选择环保材质",
    "交通工具": "建议关注安全性，特别是给小孩用",
    "娱乐产品": "建议适度消费",
    "服务": "可以先了解口碑再决定",
    "通讯费": "建议对比套餐，选择性价比高的"
}

def get_spending_advice(category: str, profile: dict = None, intent_stage: str = None) -> str:
    """根据家庭画像和商品类别给出消费建议"""
    if profile is None:
        profile = load_profile()
    
    income = profile.get('income_level', '中等')
    habit = profile.get('spending_habit', '中等')
    budget = profile.get('budget_level', '中等')
    
    advice = []
    
    # 根据收入和预算给出建议
    if income == "高" or budget == "高":
        advice.append("经济条件较好，可以考虑品质更好的产品")
    elif income == "低" or budget == "低":
        advice.append("建议关注性价比，选择实惠产品")
    else:
        advice.append("中等消费，建议货比三家")
    
    # 根据商品类别给出具体建议
    if category and category in CATEGORY_ADVICE:
        advice.append(CATEGORY_ADVICE[category])
    elif category and category != "unknown":
        advice.append("建议理性消费，按需购买")
    
    # 有特殊成员时的建议
    if profile.get('has_child'):
        if category in ["食品饮料", "母婴用品", "服装鞋帽", "交通工具"]:
            advice.append("有小孩建议优先考虑安全性")
    
    if profile.get('has_pregnant'):
        if category in ["医疗保健", "食品饮料", "母婴用品"]:
            advice.append("孕妇使用需特别注意")
    
    if profile.get('has_elderly'):
        if category in ["医疗保健", "家电"]:
            advice.append("老人使用建议关注适配性")
    
    # 根据意图阶段给出建议
    if intent_stage == "awareness":
        advice.append("目前只是感兴趣阶段，可以多比较后再决定")
    elif intent_stage == "consideration":
        advice.append("考虑阶段，建议多看看评价和对比价格")
    elif intent_stage == "purchase":
        advice.append("购买阶段，请确认预算和需求后再下单")
    
    return "，".join(advice)


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python family_profile.py [get|set|help]")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == "get":
        print(format_profile())
    elif cmd == "help":
        print("家庭画像管理:")
        print("  python family_profile.py get                    # 查看画像")
        print("  python family_profile.py set income_level 高   # 设置收入水平")
        print("  python family_profile.py set has_child true    # 设置有小孩")
    elif cmd == "set":
        if len(sys.argv) < 4:
            print("Usage: python family_profile.py set <key> <value>")
            sys.exit(1)
        key = sys.argv[2]
        value = sys.argv[3]
        
        # 转换布尔值
        if value.lower() == "true":
            value = True
        elif value.lower() == "false":
            value = False
        
        profile = set_profile(**{key: value})
        print("✅ 已更新")
        print(format_profile(profile))
    else:
        print(f"Unknown command: {cmd}")
