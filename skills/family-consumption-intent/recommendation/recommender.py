#!/usr/bin/env python3
"""
Recommendation Engine - 个性化消费推荐
结合意图、家庭画像、历史消费生成推荐
"""

from typing import Dict, List, Optional

# 品牌推荐库
BRAND_RECOMMENDATIONS = {
    "education": {
        "rational": [
            {"brand": "晨光", "products": ["文具套装", "中性笔", "笔记本"], "price_range": [10, 50]},
            {"brand": "得力", "products": ["订书机", "剪刀", "胶水"], "price_range": [10, 30]}
        ],
        "frugal": [
            {"brand": "得力", "products": ["文具套装", "作业本"], "price_range": [5, 20]},
            {"brand": "齐心", "products": ["文件夹", "笔袋"], "price_range": [10, 25]}
        ],
        "moderate": [
            {"brand": "晨光", "products": ["文具盒", "书包", "彩笔"], "price_range": [30, 100]},
            {"brand": "得力", "products": ["台灯", "文具套装"], "price_range": [50, 150]}
        ],
        "generous": [
            {"brand": "MUJI", "products": ["文具系列", "笔记本"], "price_range": [50, 200]},
            {"brand": "LAMY", "products": ["钢笔", "墨水"], "price_range": [100, 500]}
        ],
        "luxury": [
            {"brand": "万宝龙", "products": ["钢笔", "铅笔"], "price_range": [500, 3000]},
            {"brand": "HERMES", "products": ["文具套装"], "price_range": [1000, 5000]}
        ]
    },
    "appliance": {
        "rational": [
            {"brand": "海尔", "products": ["冰箱", "洗衣机"], "price_range": [1000, 3000]},
            {"brand": "美的", "products": ["空调", "电饭煲"], "price_range": [500, 2000]}
        ],
        "frugal": [
            {"brand": "格力", "products": ["空调"], "price_range": [1500, 3000]},
            {"brand": "九阳", "products": ["豆浆机", "榨汁机"], "price_range": [200, 500]}
        ],
        "moderate": [
            {"brand": "美的", "products": ["冰箱", "空调", "微波炉"], "price_range": [1000, 4000]},
            {"brand": "海尔", "products": ["洗衣机", "冰箱"], "price_range": [2000, 5000]}
        ],
        "generous": [
            {"brand": "戴森", "products": ["吸尘器", "吹风机"], "price_range": [2000, 5000]},
            {"brand": "博世", "products": ["冰箱", "洗衣机"], "price_range": [5000, 15000]}
        ],
        "luxury": [
            {"brand": "LG", "products": ["冰箱", "电视"], "price_range": [10000, 30000]},
            {"brand": "Sony", "products": ["电视", "音响"], "price_range": [5000, 20000]}
        ]
    },
    "digital": {
        "rational": [
            {"brand": "小米", "products": ["手机", "耳机"], "price_range": [500, 2000]},
            {"brand": "红米", "products": ["手机", "平板"], "price_range": [500, 1500]}
        ],
        "frugal": [
            {"brand": "红米", "products": ["手机"], "price_range": [500, 1000]},
            {"brand": "小米", "products": ["手环", "耳机"], "price_range": [100, 300]}
        ],
        "moderate": [
            {"brand": "华为", "products": ["手机", "平板"], "price_range": [1500, 4000]},
            {"brand": "OPPO", "products": ["手机", "耳机"], "price_range": [1000, 3000]}
        ],
        "generous": [
            {"brand": "苹果", "products": ["iPhone", "iPad", "AirPods"], "price_range": [3000, 10000]},
            {"brand": "三星", "products": ["手机", "平板"], "price_range": [3000, 8000]}
        ],
        "luxury": [
            {"brand": "苹果", "products": ["iPhone Pro Max", "MacBook Pro"], "price_range": [10000, 30000]},
            {"brand": "Vertu", "products": ["手机"], "price_range": [50000, 100000]}
        ]
    },
    "food": {
        "rational": [
            {"brand": "应季水果", "products": ["苹果", "香蕉", "橙子"], "price_range": [10, 30]},
            {"brand": "常温牛奶", "products": ["伊利", "蒙牛"], "price_range": [20, 50]}
        ],
        "frugal": [
            {"brand": "散装食品", "products": ["大米", "面粉"], "price_range": [20, 50]},
            {"brand": "促销商品", "products": ["零食", "饮料"], "price_range": [10, 30]}
        ],
        "moderate": [
            {"brand": "盒马", "products": ["海鲜", "水果"], "price_range": [50, 150]},
            {"brand": "百果园", "products": ["进口水果"], "price_range": [50, 200]}
        ],
        "generous": [
            {"brand": "山姆会员店", "products": ["进口食品", "有机食品"], "price_range": [100, 500]},
            {"brand": "ole", "products": ["有机食品", "进口零食"], "price_range": [100, 300]}
        ],
        "luxury": [
            {"brand": "黑钻苹果", "products": ["高端水果"], "price_range": [200, 500]},
            {"brand": "和牛", "products": ["进口牛肉"], "price_range": [500, 2000]}
        ]
    },
    "clothing": {
        "rational": [
            {"brand": "优衣库", "products": ["T恤", "裤子", "内衣"], "price_range": [50, 300]},
            {"brand": "H&M", "products": ["T恤", "裙子"], "price_range": [50, 200]}
        ],
        "frugal": [
            {"brand": "真维斯", "products": ["T恤", "牛仔裤"], "price_range": [50, 150]},
            {"brand": "热风", "products": ["鞋子", "包"], "price_range": [50, 200]}
        ],
        "moderate": [
            {"brand": "美特斯邦威", "products": ["外套", "裤子"], "price_range": [100, 400]},
            {"brand": "森马", "products": ["T恤", "卫衣"], "price_range": [100, 300]}
        ],
        "generous": [
            {"brand": "NIKE", "products": ["运动鞋", "运动服"], "price_range": [300, 1500]},
            {"brand": "Adidas", "products": ["运动鞋", "背包"], "price_range": [300, 1200]}
        ],
        "luxury": [
            {"brand": "LV", "products": ["包", "皮带"], "price_range": [5000, 50000]},
            {"brand": "Gucci", "products": ["包", "衣服"], "price_range": [3000, 30000]}
        ]
    }
}

# 消费风格映射
STYLE_MAPPING = {
    "理性": "rational",
    "节俭": "frugal",
    "中等": "moderate",
    "大方": "generous",
    "奢侈": "luxury"
}


class Recommender:
    """个性化推荐引擎"""
    
    def __init__(self):
        pass
    
    def recommend(self, intent: Dict, family_context: Dict) -> Dict:
        """
        生成个性化推荐
        
        Args:
            intent: 消费意图
            family_context: 家庭画像上下文
            
        Returns:
            dict: 推荐结果
        """
        intent_type = intent.get("intent_type", "daily")
        consume_style = family_context.get("consume_style", "中等")
        income_level = family_context.get("income_level", "中")
        
        # 映射风格
        style_key = STYLE_MAPPING.get(consume_style, "moderate")
        
        # 获取品牌推荐
        brands = BRAND_RECOMMENDATIONS.get(intent_type, {}).get(style_key, [])
        
        # 筛选预算
        budget = intent.get("budget")
        recommendations = []
        
        for brand in brands:
            price_range = brand["price_range"]
            
            if budget:
                budget_min = budget.get("min", 0)
                budget_max = budget.get("max", 999999)
                
                # 检查价格范围是否重叠
                if price_range[1] >= budget_min and price_range[0] <= budget_max:
                    for product in brand["products"]:
                        recommendations.append({
                            "brand": brand["brand"],
                            "product": product,
                            "price_range": f"{price_range[0]}-{price_range[1]}元",
                            "reason": self._generate_reason(brand["brand"], style_key, income_level)
                        })
            else:
                # 无预算限制，返回全部
                for product in brand["products"]:
                    recommendations.append({
                        "brand": brand["brand"],
                        "product": product,
                        "price_range": f"{price_range[0]}-{price_range[1]}元",
                        "reason": self._generate_reason(brand["brand"], style_key, income_level)
                    })
        
        # 限制数量
        recommendations = recommendations[:6]
        
        return {
            "recommendations": recommendations,
            "intent_type": intent_type,
            "consume_style": consume_style,
            "based_on": "家庭消费风格"
        }
    
    def _generate_reason(self, brand: str, style: str, income: str) -> str:
        """生成推荐理由"""
        reasons = {
            "rational": f"性价比高，适合理性消费",
            "frugal": f"经济实惠，性价比首选",
            "moderate": f"品质适中，符合中等消费",
            "generous": f"品质优良，值得信赖",
            "luxury": f"高端品质，尽显品位"
        }
        return reasons.get(style, "符合您的消费风格")


def format_recommendations(result: Dict) -> str:
    """格式化推荐结果"""
    lines = ["🎁 为您推荐：", ""]
    
    for i, rec in enumerate(result["recommendations"], 1):
        lines.append(f"{i}. {rec['brand']} - {rec['product']}")
        lines.append(f"   💰 价格: {rec['price_range']}")
        lines.append(f"   💡 理由: {rec['reason']}")
        lines.append("")
    
    lines.append(f"（基于{result['based_on']}）")
    
    return "\n".join(lines)


if __name__ == "__main__":
    import sys
    import json
    
    if len(sys.argv) > 2:
        try:
            intent = json.loads(sys.argv[1])
            family_context = json.loads(sys.argv[2])
        except:
            print(json.dumps({"error": "Invalid JSON"}))
            sys.exit(1)
    else:
        intent = {}
        family_context = {}
    
    result = Recommender().recommend(intent, family_context)
    print(json.dumps(result, ensure_ascii=False))
