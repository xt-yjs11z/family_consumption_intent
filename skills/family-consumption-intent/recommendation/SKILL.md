# Recommendation Skill

基于消费意图、家庭画像、历史消费生成个性化推荐。

## 功能

1. **多维度推荐** - 结合意图、画像、历史
2. **品牌推荐** - 根据消费风格推荐品牌
3. **价格区间** - 基于预算和家庭收入
4. **历史参考** - 优先推荐历史购买过的类型

## 推荐逻辑

```
推荐得分 = 
  意图匹配度 * 0.3 +
  家庭风格匹配 * 0.3 +
  历史偏好 * 0.2 +
  预算匹配度 * 0.2
```

## 推荐品牌库

| 消费风格 | 教育 | 家电 | 数码 | 服装 |
|----------|------|------|------|------|
| 理性 | 晨光、得力 | 海尔、美的 | 小米 |优衣库 |
| 节俭 | 得力 | 格力 | 红米 | 真维斯 |
| 中等 | 晨光、得力 | 美的、海尔 | 华为、OPPO | 美特斯邦威 |
| 大方 | MUJI LAMY | 戴森、博世 | 苹果、三星 | NIKE、Adidas |
| 奢侈 | 万宝龙 | LG、Sony | iPhone、MacBook | LV、Gucci |

## 使用方法

```python
from recommender import Recommender

recommender = Recommender()

# 生成推荐
result = recommender.recommend(
    intent={
        "intent_type": "education",
        "target": "孩子",
        "budget": {"min": 100, "max": 300}
    },
    family_context={
        "income_level": "高",
        "consume_style": "大方",
        "historical_consumption": {
            "education": [{"product": "书包"}]
        }
    }
)

print(result["recommendations"])
```

## 输出格式

```json
{
  "recommendations": [
    {
      "brand": "品牌名",
      "product": "具体商品",
      "price_range": "100-200元",
      "reason": "推荐理由"
    }
  ],
  "reasoning": "基于xxx推荐"
}
```
