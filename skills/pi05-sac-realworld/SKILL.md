# π₀.5 + SAC 真机强化学习方案

> 基于 RLinf 框架的 DSRL 实现

## 方案概述

**DSRL (Diffusion Steering via RL)** = 使用 SAC 算法在潜在噪声空间训练一个轻量级 Agent 来控制预训练的 Diffusion Policy (π₀.5)

### 核心思想
```
π₀.5 (预训练 Diffusion Model)
       ↓
   噪声空间 (Noise Latent)
       ↓
  SAC Agent (控制噪声偏移)
       ↓
   机器人动作
```

---

## 🎯 配置方案

### 1. 基础配置 (realworld_dsrl_pi05.yaml)

```yaml
defaults:
  - env/realworld_button@env.train
  - env/realworld_button@env.eval
  - model/pi05@actor.model  # 使用 π₀.5 模型
  - training_backend/fsdp@actor.fsdp_config

cluster:
  num_nodes: 2
  component_placement:
    actor: 
      node_group: "4090"
      placement: 0-0
    env:
      node_group: franka  # 或 turtle2
      placement: 0
    rollout:
      node_group: "4090"
      placement: 0-0

algorithm:
  adv_type: embodied_sac      # 使用 SAC 计算 advantage
  loss_type: embodied_sac      # 使用 SAC 损失
  loss_agg_func: "token-mean"
  
  gamma: 0.999                # 折扣因子
  tau: 0.005                  # 目标网络软更新系数
  
  entropy_tuning:
    alpha_type: softplus      # 自动熵调节
    initial_alpha: 1.0
    target_entropy: -14       # 双臂目标熵
  
  replay_buffer:
    enable_cache: True
    cache_size: 200
    sample_window_size: 200
    min_buffer_size: 10
  
  target_update_freq: 1

actor:
  model:
    model_path: "/path/to/pi05_model"  # π₀.5 模型路径
    add_q_head: True      # 添加 Q 值头用于 SAC
    num_action_chunks: 5
    
    # DSRL 特定配置
    openpi:
      use_dsrl: True
      dsrl_state_dim: 8
      dsrl_action_noise_dim: 32
      dsrl_num_q_heads: 10
      dsrl_hidden_dims: [128, 128, 128]
      noise_method: "reinflow"
  
  optim:
    lr: 1.0e-4
    clip_grad: 3.5
  
  critic_optim:
    lr: 3.0e-4
    clip_grad: 10.0

env:
  train:
    total_num_envs: 1
    override_cfg:
      use_arm_ids: [0, 1]    # 双臂
      use_camera_ids: [0, 2]  # 双目
      max_episode_steps: 300
```

---

## 🔧 运行命令

### 仿真训练
```bash
cd examples/embodiment
bash run_embodiment.sh libero_spatial_dsrl_openpi
```

### 真机训练
```bash
cd examples/embodiment
# 单臂 (Franka)
bash run_realworld.sh realworld_button_franka_sac_pi05

# 双臂 (Turtle2)
bash run_realworld.sh realworld_button_turtle2_sac_pi05
```

---

## 📊 关键参数

| 参数 | 说明 | 推荐值 |
|:---|:---|:---|
| `gamma` | 折扣因子 | 0.999 |
| `tau` | 目标网络更新系数 | 0.005 |
| `target_entropy` | 目标熵 (单臂/双臂) | -7 / -14 |
| `dsrl_action_noise_dim` | 噪声空间维度 | 32 |
| `dsrl_num_q_heads` | Q 值头数量 | 10 |

---

## 🏗️ 支持的真机平台

| 平台 | 配置文件 |
|:---|:---|
| **Franka** | `realworld_button_franka_sac_cnn.yaml` |
| **Turtle2 (双臂)** | `realworld_button_turtle2_sac_cnn.yaml` |
| **XSquare Turtle2** | 支持真机 RL |

---

## 📚 参考

- RLinf 论文: https://arxiv.org/abs/2509.15965
- π₀ RL 论文: https://arxiv.org/abs/2510.25889
- DSRL 论文: https://arxiv.org/abs/2506.15799

---

## ⚡ 快速开始流程

1. **准备 π₀.5 模型**
   - 使用 SFT 预训练模型
   - 或使用 RLinf 提供的预训练模型

2. **配置真机环境**
   - 设置机器人 IP
   - 校准相机
   - 配置目标位置

3. **启动训练**
   - 初始阶段先在仿真中训练
   - 然后迁移到真机微调 (Sim-to-Real)

4. **监控训练**
   - TensorBoard 查看损失
   - 评估成功率
