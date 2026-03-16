#!/usr/bin/env python3
"""
Family Profile Manager - 家庭画像管理
支持多家庭管理、消费特征、历史消费记录
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional

STORAGE_FILE = os.path.join(
    os.path.dirname(__file__), 
    "family_profiles.json"
)


class FamilyProfileManager:
    """家庭画像管理器"""
    
    def __init__(self, storage_file: str = None):
        self.storage_file = storage_file or STORAGE_FILE
        self.families = self._load()
    
    def _load(self) -> Dict:
        """加载家庭数据"""
        if os.path.exists(self.storage_file):
            with open(self.storage_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {"families": [], "version": "1.0"}
    
    def _save(self):
        """保存家庭数据"""
        with open(self.storage_file, 'w', encoding='utf-8') as f:
            json.dump(self.families, f, ensure_ascii=False, indent=2)
    
    def create_family(self, profile: Dict) -> str:
        """
        创建新家庭
        
        Args:
            profile: 家庭画像
            
        Returns:
            str: family_id
        """
        family_id = f"family_{len(self.families['families']) + 1}"
        
        # 默认值
        default_profile = {
            "family_id": family_id,
            "family_name": profile.get("family_name", "新家庭"),
            "members": profile.get("members", []),
            "children_age": profile.get("children_age", []),
            "income_level": profile.get("income_level", "中"),  # 高/中/低
            "consume_style": profile.get("consume_style", "中等"),  # 理性/节俭/中等/大方/奢侈
            "preferred_brands": profile.get("preferred_brands", []),
            "historical_consumption": profile.get("historical_consumption", {}),
            "budget_range": profile.get("budget_range", {}),
            "has_child": profile.get("has_child", False),
            "has_elderly": profile.get("has_elderly", False),
            "has_pregnant": profile.get("has_pregnant", False),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        self.families['families'].append(default_profile)
        self._save()
        
        return family_id
    
    def get_family(self, family_id: str) -> Optional[Dict]:
        """获取家庭画像"""
        for family in self.families['families']:
            if family['family_id'] == family_id:
                return family
        return None
    
    def get_family_by_name(self, family_name: str) -> Optional[Dict]:
        """通过名称获取家庭"""
        for family in self.families['families']:
            if family['family_name'] == family_name:
                return family
        return None
    
    def update_family(self, family_id: str, updates: Dict) -> bool:
        """更新家庭画像"""
        for family in self.families['families']:
            if family['family_id'] == family_id:
                family.update(updates)
                family['updated_at'] = datetime.now().isoformat()
                self._save()
                return True
        return False
    
    def delete_family(self, family_id: str) -> bool:
        """删除家庭"""
        original_len = len(self.families['families'])
        self.families['families'] = [
            f for f in self.families['families'] 
            if f['family_id'] != family_id
        ]
        
        if len(self.families['families']) < original_len:
            self._save()
            return True
        return False
    
    def list_families(self) -> List[Dict]:
        """列出所有家庭"""
        return self.families['families']
    
    def add_consumption_record(self, family_id: str, intent_type: str, product: str, budget: int = None):
        """添加消费记录"""
        family = self.get_family(family_id)
        if not family:
            return False
        
        # 初始化历史消费
        if 'historical_consumption' not in family:
            family['historical_consumption'] = {}
        
        if intent_type not in family['historical_consumption']:
            family['historical_consumption'][intent_type] = []
        
        # 添加记录
        record = {
            "product": product,
            "budget": budget,
            "timestamp": datetime.now().isoformat()
        }
        
        family['historical_consumption'][intent_type].append(record)
        
        # 更新预算范围
        if budget:
            if 'budget_range' not in family:
                family['budget_range'] = {}
            
            if intent_type not in family['budget_range']:
                family['budget_range'][intent_type] = [budget, budget]
            else:
                current = family['budget_range'][intent_type]
                family['budget_range'][intent_type] = [
                    min(current[0], budget),
                    max(current[1], budget)
                ]
        
        family['updated_at'] = datetime.now().isoformat()
        self._save()
        return True
    
    def get_recommendation_context(self, family_id: str) -> Dict:
        """获取推荐上下文"""
        family = self.get_family(family_id)
        if not family:
            return {}
        
        return {
            "income_level": family.get("income_level"),
            "consume_style": family.get("consume_style"),
            "preferred_brands": family.get("preferred_brands", []),
            "historical_consumption": family.get("historical_consumption", {}),
            "budget_range": family.get("budget_range", {}),
            "has_child": family.get("has_child", False),
            "has_elderly": family.get("has_elderly", False)
        }


def format_family(family: Dict) -> str:
    """格式化家庭信息"""
    lines = [f"🏠 {family['family_name']}", ""]
    lines.append(f"👥 成员: {', '.join(family.get('members', []))}")
    lines.append(f"💰 收入: {family.get('income_level', '中')}")
    lines.append(f"🛒 消费风格: {family.get('consume_style', '中等')}")
    
    if family.get('historical_consumption'):
        lines.append("")
        lines.append("📝 历史消费:")
        for category, items in family['historical_consumption'].items():
            products = [item['product'] for item in items[-3:]]  # 最近3个
            lines.append(f"  {category}: {', '.join(products)}")
    
    return "\n".join(lines)


if __name__ == "__main__":
    manager = FamilyProfileManager()
    
    # 测试创建
    family_id = manager.create_family({
        "family_name": "测试家庭",
        "members": ["爸爸", "妈妈"],
        "income_level": "中",
        "consume_style": "理性"
    })
    print(f"创建家庭: {family_id}")
    
    # 列出所有
    print("\n所有家庭:")
    for f in manager.list_families():
        print(format_family(f))
