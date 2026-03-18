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
    
    # 检查必填字段
    for field in REQUIRED_FIELDS:
        if not intent.get(field):
            missing_fields.append(field)
    
    # 模糊词检查：如果只有"礼物"等模糊词，没有具体商品，需要追问商品
    keywords = intent.get('keywords', [])
    vague_keywords = ['礼物', '东西', '物件', '物品']
    specific_product_keywords = ['玩具', '游戏', '电影', '旅游', '手机', '电脑', '空调', '衣服', '鞋子', 
                                  '电视', '冰箱', '洗衣机', '平板', '耳机', '相机', '手表', '项链', 
                                  '化妆品', '口红', '面霜', '篮球', '足球']
    
    has_specific = any(kw in specific_product_keywords for kw in keywords)
    
    # 如果没有具体商品关键词，只有模糊词，需要追问商品
    if not has_specific and any(kw in vague_keywords for kw in keywords):
        if 'object' not in missing_fields:
            missing_fields.append('object')
    
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
    # 直接返回问题，不显示选项列表
    return question["question"]


# 类别中文映射
TYPE_MAP = {
    'digital': '数码',
    'appliance': '家电', 
    'food': '食品',
    'daily': '日用',
    'clothing': '服饰',
    'entertainment': '娱乐',
    'health': '健康',
    'service': '服务',
    'sports': '运动',
    'beauty': '美妆',
    'pet': '宠物',
    'car': '汽车',
    'furniture': '家具',
    'baby': '母婴',
    'education': '教育'
}

TIME_MAP = {
    'now': '立即购买',
    'soon': '近期购买',
    'future': '计划购买'
}

# 从关键词推断商品
def infer_object(intent: Dict) -> str:
    """从关键词推断商品名称"""
    keywords = intent.get('keywords', [])
    intent_type = intent.get('intent_type')
    
    # 类型到商品的映射
    type_to_product = {
        'digital': '数码产品',
        'appliance': '家电',
        'food': '食品',
        'daily': '日用品',
        'clothing': '服饰',
        'entertainment': '玩具/娱乐',
        'health': '保健品',
        'service': '服务',
        'sports': '运动用品',
        'beauty': '美妆用品',
        'pet': '宠物用品',
        'car': '汽车用品',
        'furniture': '家具',
        'baby': '母婴用品',
        'education': '学习用品'
    }
    
    # 常见商品关键词
    product_keywords = {
        '手机': '手机', '电脑': '电脑', '平板': '平板', '耳机': '耳机',
        '空调': '空调', '冰箱': '冰箱', '洗衣机': '洗衣机', '电视': '电视',
        '衣服': '衣服', '鞋子': '鞋子', '裤子': '裤子', '包': '包',
        '玩具': '玩具', '游戏': '游戏', '电影': '电影',
        '水果': '水果', '零食': '零食', '牛奶': '牛奶', '大米': '大米',
        '篮球': '篮球', '足球': '足球', '跑步机': '跑步机', '瑜伽垫': '瑜伽垫',
        '化妆品': '化妆品', '面霜': '面霜', '口红': '口红',
        '礼物': '礼物', '手表': '手表',
        '项链': '项链', '戒指': '戒指', '耳环': '耳环', '手链': '手链'
    }
    
    # 先从关键词中找具体商品
    for kw in keywords:
        if kw in product_keywords:
            return product_keywords[kw]
    
    # 没找到则用类型推断
    if intent_type in type_to_product:
        return type_to_product[intent_type]
    
    return '商品'

def format_intent_summary(intent: Dict) -> str:
    """格式化当前意图信息"""
    lines = []
    
    # 固定顺序输出
    field_order = ['target', 'object', 'intent_type', 'scene', 'budget', 'time']
    field_names = {
        'target': '消费对象',
        'object': '商品',
        'intent_type': '类别',
        'scene': '场景',
        'budget': '预算',
        'time': '时间'
    }
    
    for field in field_order:
        value = None
        
        if field == 'object':
            value = infer_object(intent)
        else:
            value = intent.get(field)
        
        # 场景：如果没有识别到，则默认显示"日常"
        if field == 'scene' and not value:
            value = '日常'
        
        if value:
            # 类型转换
            if field == "intent_type":
                value = TYPE_MAP.get(value, value)
            elif field == "time":
                value = TIME_MAP.get(value, value)
            
            if field == "budget" and isinstance(value, dict):
                if value.get("type") == "exact":
                    lines.append(f"- {field_names[field]}：{value['min']}元")
                else:
                    lines.append(f"- {field_names[field]}：{value['min']}-{value['max']}元")
            elif field != 'object' or value != '商品':  # 排除未识别的object
                lines.append(f"- {field_names[field]}：{value}")
    
    return "\n".join(lines)


# 选购建议模板
SUGGESTION_TEMPLATES = {
    'digital': [
        '预算范围内优先选择主流品牌机型',
        '关注屏幕素质和续航表现',
        '建议到正规渠道购买，售后更有保障'
    ],
    'appliance': [
        '根据家庭空间选择合适尺寸',
        '关注能效等级，节能省电',
        '建议选择主流品牌，售后更放心'
    ],
    'clothing': [
        '预算范围内选择适合自己风格的款式',
        '建议到实体店试穿后购买',
        '关注面料舒适度和做工'
    ],
    'entertainment': [
        '根据使用场景选择合适类型',
        '关注产品安全性',
        '建议到正规渠道购买'
    ],
    'sports': [
        '根据使用频率选择合适档次',
        '关注产品质量和安全性',
        '建议到正规体育用品店购买'
    ],
    'beauty': [
        '根据肤质选择合适产品',
        '建议先试用小样',
        '关注产品成分和保质期'
    ],
    'food': [
        '关注生产日期和保质期',
        '选择正规渠道购买',
        '注意保存条件'
    ],
    'health': [
        '遵医嘱或专业人士建议',
        '选择正规渠道购买',
        '关注产品资质和口碑'
    ],
    'service': [
        '可通过App/微信/支付宝在线办理',
        '建议绑定自动扣费，避免遗忘'
    ],
    'default': [
        '根据实际需求选择',
        '建议到正规渠道购买',
        '关注售后保障'
    ]
}

def get_suggestions(intent: Dict, family_context: Dict = None) -> list:
    """获取选购建议"""
    intent_type = intent.get('intent_type', 'default')
    target = intent.get('target', '自己')
    budget = intent.get('budget')
    consume_style = family_context.get('consume_style', '理性') if family_context else '理性'
    
    suggestions = []
    
    # 预算范围映射（根据消费风格）
    budget_ranges = {
        '节俭': {'digital': '1000-2000', 'appliance': '2000-3000', 'clothing': '500-1000'},
        '理性': {'digital': '2000-4000', 'appliance': '3000-5000', 'clothing': '1000-2000'},
        '适度': {'digital': '3000-5000', 'appliance': '4000-6000', 'clothing': '2000-3000'},
        '大方': {'digital': '5000-8000', 'appliance': '6000-10000', 'clothing': '3000-5000'}
    }
    
    # 添加预算建议
    if not budget:
        # 根据类型和风格推断预算
        range_info = budget_ranges.get(consume_style, {}).get(intent_type)
        if range_info:
            suggestions.append(f'参考预算：{range_info}元（{consume_style}风格）')
    
    # 根据类型获取建议
    type_suggestions = SUGGESTION_TEMPLATES.get(intent_type, SUGGESTION_TEMPLATES['default'])
    suggestions.extend(type_suggestions[:2])  # 最多2条类型建议
    
    # 根据消费对象添加建议
    if target == '孩子':
        suggestions.append('注意产品安全性和适用年龄')
    elif target == '父母':
        suggestions.append('考虑操作简便性')
    elif target == '老人':
        suggestions.append('考虑操作简便和安全性')
    
    return suggestions[:3]  # 最多返回3条


if __name__ == "__main__":
    import sys
    import json
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
