#!/usr/bin/env python3
"""
家庭消费意图识别 Agent
核心主程序：整合意图识别、槽位填充、家庭画像、推荐系统
"""

import sys
import os

# 添加 skills 路径
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "slots"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "family_profile"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "recommendation"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "memory"))

from intent_detector import detect_intent, format_intent
from slot_filler import check_and_fill, format_question, format_intent_summary, get_suggestions
from family_profile import FamilyProfileManager
from recommender import Recommender, format_recommendations
from consumption_memory import ConsumptionMemory


class ConsumptionAgent:
    """家庭消费意图识别 Agent"""
    
    def __init__(self):
        self.profile_manager = FamilyProfileManager()
        self.recommender = Recommender()
        self.memory = ConsumptionMemory()
        self.current_intent = {}
        self.current_family_id = None
    
    def set_family(self, family_id: str) -> bool:
        """设置当前家庭"""
        family = self.profile_manager.get_family(family_id)
        if family:
            self.current_family_id = family_id
            return True
        return False
    
    def process_message(self, message: str, family_id: str = None) -> str:
        """
        处理用户消息
        
        Args:
            message: 用户消息
            family_id: 家庭ID（可选）
            
        Returns:
            str: Agent 响应
        """
        # 0. 检查闲聊模式前缀
        if message.strip().startswith("+"):
            # 闲聊模式，直接回复
            return "你好！有什么可以帮你的吗？"
        
        # 设置家庭
        if family_id:
            self.set_family(family_id)
        elif self.current_family_id is None:
            # 默认使用第一个家庭
            families = self.profile_manager.list_families()
            if families:
                self.current_family_id = families[0]["family_id"]
        
        # 1. 意图识别
        intent = detect_intent(message)
        self.current_intent.update(intent)
        
        # 1.5 如果没有识别到任何消费类型，回复没识别到消费意图
        if not intent.get("intent_type"):
            return "没识别到消费意图"
        
        # 2. 槽位检查
        slot_result = check_and_fill(self.current_intent)
        
        # 3. 如果信息不完整，追问
        if not slot_result["is_complete"]:
            response = format_intent_summary(self.current_intent)
            response += "\n\n" + format_question(slot_result["next_question"])
            return response
        
        # 4. 信息完整，生成推荐
        family_context = {}
        if self.current_family_id:
            family_context = self.profile_manager.get_recommendation_context(self.current_family_id)
            # 添加历史偏好
            prefs = self.memory.get_preferences(self.current_family_id)
            family_context["preferences"] = prefs
        
        # 5. 生成推荐
        rec_result = self.recommender.recommend(self.current_intent, family_context)
        
        # 6. 记录到记忆
        if self.current_family_id:
            budget_val = None
            if self.current_intent.get("budget"):
                budget_val = self.current_intent.get("budget", {}).get("min")
            self.memory.record(
                family_id=self.current_family_id,
                intent_type=self.current_intent.get("intent_type"),
                product=self.current_intent.get("object") or "待定",
                target=self.current_intent.get("target"),
                budget=budget_val
            )
        
        # 7. 输出结果
        response = "✅ 识别完成！\n意图识别：家庭消费\n" + format_intent_summary(self.current_intent)
        
        # 添加选购建议
        suggestions = get_suggestions(self.current_intent, family_context)
        if suggestions:
            response += "\n选购建议：\n" + "\n".join([f"- {s}" for s in suggestions])
        
        # 重置当前意图
        self.current_intent = {}
        
        return response
    
    def handle_option(self, option: str) -> str:
        """
        处理选项回复
        
        Args:
            option: 用户选择的选项
            
        Returns:
            str: Agent 响应
        """
        # 尝试解析选项
        # 选项格式: "1" 或 "1. 自己" 或 "自己"
        
        option = option.strip()
        
        # 如果是数字选项
        if option.isdigit():
            # 需要知道当前在追问什么字段
            slot_result = check_and_fill(self.current_intent)
            if slot_result.get("next_question"):
                options = slot_result["next_question"].get("options", [])
                idx = int(option) - 1
                if 0 <= idx < len(options):
                    option_value = options[idx].get("value")
                    if isinstance(option_value, dict):
                        # 预算范围
                        self.current_intent["budget"] = option_value
                    else:
                        field = slot_result["next_question"]["field"]
                        self.current_intent[field] = option_value
        
        # 重新检查槽位
        return self.process_message("")  # 重新处理


def main():
    """测试入口"""
    agent = ConsumptionAgent()
    
    # 打印欢迎信息
    print("=" * 50)
    print("🎯 家庭消费意图识别 Agent")
    print("=" * 50)
    print("\n输入 'quit' 退出")
    print()
    
    # 对话循环
    while True:
        try:
            user_input = input("你: ").strip()
            
            if user_input.lower() in ["quit", "exit", "退出"]:
                print("再见！👋")
                break
            
            if not user_input:
                continue
            
            response = agent.process_message(user_input)
            print(f"\nAgent: {response}\n")
            
        except KeyboardInterrupt:
            print("\n\n再见！👋")
            break
        except Exception as e:
            print(f"\n错误: {e}\n")


if __name__ == "__main__":
    main()
