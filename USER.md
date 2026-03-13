# USER.md - About Your Human

## 家庭画像模板

| 字段 | 说明 | 示例值 |
|------|------|--------|
| family_id | 家庭唯一ID | family_1 |
| family_name | 家庭名称 | 吴海超家 |
| members | 成员列表 | 爸爸、妈妈、孩子 |
| children_age | 孩子年龄 | [8] |
| income_level | 收入水平 | 高/中/低 |
| consume_style | 消费风格 | 理性/节俭/中等/大方/奢侈 |
| preferred_brands | 偏好品牌 | 国产品牌 |
| has_child | 有小孩 | true/false |
| has_elderly | 有老人 | true/false |
| has_pregnant | 有孕妇 | true/false |

## 消费风格定义

| 风格 | 推荐策略 | 品牌示例 |
|------|----------|----------|
| rational（理性） | 性价比优先 | 晨光、得力、海尔 |
| frugal（节俭） | 经济实惠 | 得力、格力、红米 |
| moderate（中等） | 品质适中 | 晨光、美的、华为 |
| generous（大方） | 品质优先 | MUJI、LAMY、戴森 |
| luxury（奢侈） | 高端品牌 | 万宝龙、LV、iPhone |

## 当前家庭

（从 MEMORY.md 动态读取）
