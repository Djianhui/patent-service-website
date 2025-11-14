<template>
  <div class="dashboard-container">
    <!-- 顶部欢迎区域 -->
    <div class="welcome-banner">
      <div class="banner-content">
        <div class="banner-left">
          <h1 class="greeting">
            {{ getGreeting() }}，{{ authStore.userName || '用户' }}
          </h1>
          <p class="subtitle">欢迎使用AI驱动的专利服务平台</p>
        </div>
        <div class="banner-right">
          <div class="date-info">
            <el-icon :size="20">
              <Calendar />
            </el-icon>
            <span>{{ formatDate(new Date(), 'YYYY年MM月DD日') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 核心功能卡片 -->
    <div class="main-features">
      <div class="feature-card" @click="$router.push('/app/three-analysis/new')">
        <div class="card-icon three-analysis">
          <el-icon :size="48">
            <DataAnalysis />
          </el-icon>
        </div>
        <div class="card-content">
          <h3 class="card-title">三性分析</h3>
          <p class="card-desc">AI智能分析专利新颖性、创造性、实用性</p>
        </div>
        <div class="card-action">
          <el-button type="primary" size="large" :icon="Plus">
            立即使用
          </el-button>
        </div>
      </div>

      <div class="feature-card" @click="$router.push('/app/defense-support/simulation')">
        <div class="card-icon defense-support">
          <el-icon :size="48">
            <ChatDotSquare />
          </el-icon>
        </div>
        <div class="card-content">
          <h3 class="card-title">答辩支持</h3>
          <p class="card-desc">专业的专利答辩策略生成与模拟演练</p>

        </div>
        <div class="card-action">
          <el-button type="primary" size="large" :icon="Plus">
            立即使用
          </el-button>
        </div>
      </div>
    </div>

    <!-- 快速入口 -->
    <div class="quick-access-section">
      <div class="section-header">
        <h2 class="section-title">快速开始</h2>
        <p class="section-subtitle">选择下方功能立即开始使用AI专利服务</p>
      </div>
    </div>

    <!-- 使用指南 -->
    <div class="guide-section">
      <div class="guide-header">
        <div class="guide-icon-wrapper">
          <el-icon :size="32">
            <Promotion />
          </el-icon>
        </div>
        <div class="guide-text">
          <h3>如何使用?</h3>
          <p>三步完成专利分析或答辩准备</p>
        </div>
      </div>

      <div class="guide-steps">
        <div class="step-item">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>选择功能</h4>
            <p>点击上方功能卡片选择三性分析或答辩支持</p>
          </div>
        </div>
        <div class="step-arrow">
          <el-icon>
            <ArrowRight />
          </el-icon>
        </div>
        <div class="step-item">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>填写信息</h4>
            <p>根据引导填写专利相关信息和需求</p>
          </div>
        </div>
        <div class="step-arrow">
          <el-icon>
            <ArrowRight />
          </el-icon>
        </div>
        <div class="step-item">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>获取结果</h4>
            <p>AI快速生成专业报告，支持下载导出</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能特色 -->
    <div class="features-highlight">
      <h2 class="section-title">功能特色</h2>
      <div class="highlight-grid">
        <div class="highlight-card">
          <div class="highlight-icon">
            <el-icon :size="40">
              <MagicStick />
            </el-icon>
          </div>
          <h4>AI智能分析</h4>
          <p>基于深度学习的专利分析引擎，准确率高达95%</p>
        </div>
        <div class="highlight-card">
          <div class="highlight-icon">
            <el-icon :size="40">
              <Timer />
            </el-icon>
          </div>
          <h4>高效快捷</h4>
          <p>5分钟完成分析，节省90%的时间成本</p>
        </div>
        <div class="highlight-card">
          <div class="highlight-icon">
            <el-icon :size="40">
              <DocumentChecked />
            </el-icon>
          </div>
          <h4>专业报告</h4>
          <p>符合行业标准的专业报告，支持多种格式导出</p>
        </div>
        <div class="highlight-card">
          <div class="highlight-icon">
            <el-icon :size="40">
              <Service />
            </el-icon>
          </div>
          <h4>全程支持</h4>
          <p>专业团队在线指导，答疑解惑全程护航</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/utils'
import {
  Plus,
  DataAnalysis,
  ChatDotSquare,
  Calendar,
  ArrowRight,
  Promotion,
  MagicStick,
  Timer,
  DocumentChecked,
  Service
} from '@element-plus/icons-vue'

// Composables
const router = useRouter()
const authStore = useAuthStore()

// 获取问候语
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 17) return '下午好'
  if (hour < 19) return '傍晚好'
  if (hour < 22) return '晚上好'
  return '夜深了'
}

// 生命周期
onMounted(async () => {
  // 页面初始化
})
</script>

<style scoped lang="scss">
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #e8eef5 100%);
  padding: 0;
  font-family: 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  // 欢迎横幅
  .welcome-banner {
    background: linear-gradient(135deg, #0F4C81 0%, #1a5f9e 50%, #6A5ACD 100%);
    padding: 48px 32px;
    margin-bottom: 32px;
    box-shadow: 0 4px 20px rgba(15, 76, 129, 0.15);

    .banner-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #fff;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
      }

      .banner-left {
        .greeting {
          font-size: 36px;
          font-weight: 700;
          margin: 0 0 12px 0;
          line-height: 1.3;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

          @media (max-width: 768px) {
            font-size: 28px;
          }
        }

        .subtitle {
          font-size: 16px;
          opacity: 0.95;
          margin: 0;
          line-height: 1.5;
        }
      }

      .banner-right {
        .date-info {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 50px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);

          .el-icon {
            font-size: 20px;
          }
        }
      }
    }
  }

  // 核心功能卡片
  .main-features {
    max-width: 1400px;
    margin: 0 auto 48px;
    padding: 0 32px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 32px;

    @media (max-width: 1100px) {
      grid-template-columns: 1fr;
      gap: 24px;
    }

    @media (max-width: 768px) {
      padding: 0 16px;
    }

    .feature-card {
      background: #fff;
      border-radius: 20px;
      padding: 36px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid transparent;
      display: flex;
      flex-direction: column;
      gap: 24px;

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 16px 40px rgba(15, 76, 129, 0.2);
        border-color: #0F4C81;
      }

      .card-icon {
        width: 88px;
        height: 88px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 48px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

        &.three-analysis {
          background: linear-gradient(135deg, #0F4C81 0%, #1a5f9e 100%);
        }

        &.defense-support {
          background: linear-gradient(135deg, #6A5ACD 0%, #8B7EC8 100%);
        }
      }

      .card-content {
        flex: 1;

        .card-title {
          font-size: 26px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 12px 0;
        }

        .card-desc {
          font-size: 15px;
          color: #666;
          line-height: 1.6;
          margin: 0 0 24px 0;
        }

        .card-stats {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 20px;
          background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
          border-radius: 12px;

          .stat-item {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .stat-value {
              font-size: 24px;
              font-weight: 700;
              color: #0F4C81;
            }

            .stat-label {
              font-size: 13px;
              color: #666;
            }
          }

          .stat-divider {
            width: 1px;
            height: 36px;
            background: linear-gradient(180deg, transparent 0%, #d0d7de 50%, transparent 100%);
          }
        }
      }

      .card-action {
        .el-button {
          width: 100%;
          height: 52px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
          border: none;

          &:hover {
            background: linear-gradient(135deg, #1a5f9e 0%, #7B68EE 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(15, 76, 129, 0.3);
          }
        }
      }
    }
  }

  // 快速入口
  .quick-access-section {
    max-width: 1400px;
    margin: 0 auto 48px;
    padding: 0 32px;

    @media (max-width: 768px) {
      padding: 0 16px;
      margin-bottom: 32px;
    }

    .section-header {
      text-align: center;

      .section-title {
        font-size: 32px;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0 0 12px 0;
      }

      .section-subtitle {
        font-size: 16px;
        color: #666;
        margin: 0;
      }
    }
  }

  // 使用指南
  .guide-section {
    max-width: 1200px;
    margin: 0 auto 56px;
    padding: 0 32px;

    @media (max-width: 768px) {
      padding: 0 16px;
      margin-bottom: 40px;
    }

    .guide-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 40px;
      padding: 32px;
      background: linear-gradient(135deg, #fff5e6 0%, #ffe8cc 100%);
      border-radius: 20px;
      border: 2px solid #ffd699;

      @media (max-width: 640px) {
        flex-direction: column;
        text-align: center;
      }

      .guide-icon-wrapper {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ff9800 0%, #ff6f00 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        flex-shrink: 0;
        box-shadow: 0 4px 16px rgba(255, 152, 0, 0.3);
      }

      .guide-text {
        h3 {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }

        p {
          font-size: 15px;
          color: #666;
          margin: 0;
        }
      }
    }

    .guide-steps {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;

      @media (max-width: 900px) {
        flex-direction: column;
        gap: 24px;
      }

      .step-item {
        flex: 1;
        min-width: 220px;
        max-width: 280px;
        background: #fff;
        border-radius: 16px;
        padding: 28px 24px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        text-align: center;
        transition: all 0.3s ease;
        border: 2px solid #e9ecef;

        &:hover {
          transform: translateY(-6px);
          box-shadow: 0 8px 24px rgba(15, 76, 129, 0.15);
          border-color: #0F4C81;
        }

        .step-number {
          width: 48px;
          height: 48px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(15, 76, 129, 0.3);
        }

        .step-content {
          h4 {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0 0 12px 0;
          }

          p {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
            margin: 0;
          }
        }
      }

      .step-arrow {
        color: #0F4C81;
        font-size: 28px;
        flex-shrink: 0;

        @media (max-width: 900px) {
          transform: rotate(90deg);
        }
      }
    }
  }

  // 功能特色
  .features-highlight {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 32px 56px;

    @media (max-width: 768px) {
      padding: 0 16px 40px;
    }

    .section-title {
      font-size: 32px;
      font-weight: 700;
      color: #1a1a1a;
      text-align: center;
      margin: 0 0 40px 0;
    }

    .highlight-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }

      .highlight-card {
        background: #fff;
        border-radius: 16px;
        padding: 32px 24px;
        text-align: center;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        transition: all 0.3s ease;
        border: 2px solid transparent;

        &:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 32px rgba(15, 76, 129, 0.15);
          border-color: #0F4C81;

          .highlight-icon {
            transform: scale(1.1);
          }
        }

        .highlight-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          background: linear-gradient(135deg, #e7f0ff 0%, #d5e5ff 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0F4C81;
          transition: all 0.3s ease;
        }

        h4 {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 12px 0;
        }

        p {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
          margin: 0;
        }
      }
    }
  }


}
</style>
