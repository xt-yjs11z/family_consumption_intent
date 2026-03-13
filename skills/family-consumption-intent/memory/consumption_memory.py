#!/usr/bin/env python3
"""
Consumption Memory - 消费记忆管理
长期记录家庭消费行为，支持查询和分析
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional

STORAGE_FILE = os.path.join(
    os.path.dirname(__file__), 
    "consumption_history.json"
)


class ConsumptionMemory:
    """消费记忆管理器"""
    
    def __init__(self, storage_file: str = None):
        self.storage_file = storage_file or STORAGE_FILE
        self.data = self._load()
    
    def _load(self) -> Dict:
        """加载数据"""
        if os.path.exists(self.storage_file):
            with open(self.storage_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {"families": {}, "version": "1.0"}
    
    def _save(self):
        """保存数据"""
        with open(self.storage_file, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)
    
    def record(
        self,
        family_id: str,
        intent_type: str,
        product: str,
        target: str = None,
        budget: int = None,
        completed: bool = False,
        notes: str = None
    ) -> str:
        """
        记录消费意图
        
        Args:
            family_id: 家庭ID
            intent_type: 消费类型
            product: 商品
            target: 消费对象
            budget: 预算
            completed: 是否已完成
            notes: 备注
            
        Returns:
            str: record_id
        """
        if family_id not in self.data["families"]:
            self.data["families"][family_id] = {"records": []}
        
        record_id = f"record_{len(self.data['families'][family_id]['records']) + 1}"
        
        record = {
            "id": record_id,
            "intent_type": intent_type,
            "product": product,
            "target": target,
            "budget": budget,
            "completed": completed,
            "notes": notes,
            "timestamp": datetime.now().isoformat()
        }
        
        self.data["families"][family_id]["records"].append(record)
        self._save()
        
        return record_id
    
    def get_history(
        self,
        family_id: str,
        intent_type: str = None,
        limit: int = 10
    ) -> List[Dict]:
        """获取消费历史"""
        if family_id not in self.data["families"]:
            return []
        
        records = self.data["families"][family_id]["records"]
        
        if intent_type:
            records = [r for r in records if r.get("intent_type") == intent_type]
        
        # 按时间倒序
        records.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        
        return records[:limit]
    
    def get_preferences(self, family_id: str) -> Dict:
        """获取消费偏好"""
        if family_id not in self.data["families"]:
            return {}
        
        records = self.data["families"][family_id]["records"]
        
        # 统计各类别频次
        type_counts = {}
        product_counts = {}
        brand_counts = {}
        budget_sum = {}
        
        for record in records:
            # 类型统计
            it = record.get("intent_type")
            if it:
                type_counts[it] = type_counts.get(it, 0) + 1
            
            # 商品统计
            prod = record.get("product")
            if prod:
                product_counts[prod] = product_counts.get(prod, 0) + 1
            
            # 品牌统计（从商品中提取）
            # 这里可以添加品牌提取逻辑
            
            # 预算统计
            budget = record.get("budget")
            if budget:
                if it not in budget_sum:
                    budget_sum[it] = []
                budget_sum[it].append(budget)
        
        # 计算平均预算
        avg_budget = {}
        for it, budgets in budget_sum.items():
            avg_budget[it] = sum(budgets) / len(budgets) if budgets else 0
        
        return {
            "preferred_types": sorted(type_counts.items(), key=lambda x: x[1], reverse=True)[:3],
            "preferred_products": sorted(product_counts.items(), key=lambda x: x[1], reverse=True)[:5],
            "avg_budget": avg_budget,
            "total_records": len(records)
        }
    
    def get_budget_range(self, family_id: str, intent_type: str) -> Dict:
        """获取特定类型的预算范围"""
        if family_id not in self.data["families"]:
            return {}
        
        records = self.data["families"][family_id]["records"]
        budgets = [r["budget"] for r in records if r.get("budget") and r.get("intent_type") == intent_type]
        
        if not budgets:
            return {}
        
        return {
            "min": min(budgets),
            "max": max(budgets),
            "avg": sum(budgets) / len(budgets)
        }
    
    def mark_completed(self, family_id: str, record_id: str) -> bool:
        """标记消费为已完成"""
        if family_id not in self.data["families"]:
            return False
        
        for record in self.data["families"][family_id]["records"]:
            if record["id"] == record_id:
                record["completed"] = True
                record["completed_at"] = datetime.now().isoformat()
                self._save()
                return True
        
        return False
    
    def get_recent_uncompleted(self, family_id: str, days: int = 7) -> List[Dict]:
        """获取最近未完成的消费意图"""
        if family_id not in self.data["families"]:
            return []
        
        cutoff = datetime.now() - timedelta(days=days)
        records = self.data["families"][family_id]["records"]
        
        uncompleted = [
            r for r in records 
            if not r.get("completed") and 
            datetime.fromisoformat(r.get("timestamp", "2000-01-01")) > cutoff
        ]
        
        return sorted(uncompleted, key=lambda x: x.get("timestamp", ""), reverse=True)
    
    def export_to_text(self, family_id: str) -> str:
        """导出为文本格式"""
        if family_id not in self.data["families"]:
            return "暂无记录"
        
        records = self.get_history(family_id)
        
        if not records:
            return "暂无消费记录"
        
        lines = ["📝 消费历史：", ""]
        
        for r in records:
            status = "✅" if r.get("completed") else "⏳"
            budget_str = f" {r.get('budget')}元" if r.get("budget") else ""
            lines.append(f"{status} {r.get('intent_type')} - {r.get('product')}{budget_str}")
            lines.append(f"   📅 {r.get('timestamp', '')[:10]}")
        
        return "\n".join(lines)


if __name__ == "__main__":
    import sys
    import json
    
    memory = ConsumptionMemory()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == 'record' and len(sys.argv) >= 4:
            family_id = sys.argv[2]
            intent_type = sys.argv[3]
            product = sys.argv[4]
            target = sys.argv[5] if len(sys.argv) > 5 else None
            budget = int(sys.argv[6]) if len(sys.argv) > 6 and sys.argv[6] else None
            
            record_id = memory.record(
                family_id=family_id,
                intent_type=intent_type,
                product=product,
                target=target,
                budget=budget
            )
            print(json.dumps({"success": True, "record_id": record_id}))
        
        elif command == 'history' and len(sys.argv) >= 3:
            family_id = sys.argv[2]
            history = memory.get_history(family_id)
            print(json.dumps(history, ensure_ascii=False))
        
        elif command == 'preferences' and len(sys.argv) >= 3:
            family_id = sys.argv[2]
            prefs = memory.get_preferences(family_id)
            print(json.dumps(prefs, ensure_ascii=False))
        
        else:
            print(json.dumps({"error": "Unknown command"}))
    else:
        # 测试
        memory.record(
            family_id="family_1",
            intent_type="education",
            product="书包",
            target="孩子",
            budget=300,
            completed=True
        )
        
        print(json.dumps(memory.get_history("family_1"), ensure_ascii=False))
