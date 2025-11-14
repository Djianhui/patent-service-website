<template>
  <div class="landing-page">
    <!-- 顶部导航栏 -->
    <header class="landing-header">
      <div class="container">
        <div class="header-content">
          <!-- Logo区域 -->
          <div class="logo" @click="$router.push('/')">
            <div class="logo-icon-wrapper">
              <el-icon :size="28">
                <Star />
              </el-icon>
            </div>
            <span class="logo-text">{{ $t('landing.brand') }}</span>
          </div>

          <!-- 导航菜单 -->
          <nav class="nav-menu">
            <a href="#features" class="nav-link">
              <el-icon :size="18">
                <DataAnalysis />
              </el-icon>
              <span>{{ $t('landing.nav.features') }}</span>
            </a>
            <a href="#about" class="nav-link">
              <el-icon :size="18">
                <Document />
              </el-icon>
              <span>{{ $t('landing.nav.about') }}</span>
            </a>
            <a href="#contact" class="nav-link">
              <el-icon :size="18">
                <ChatDotSquare />
              </el-icon>
              <span>{{ $t('landing.nav.contact') }}</span>
            </a>
          </nav>
          <!-- 右侧操作区 -->
          <div class="header-actions">
            <!-- 未登录时显示登录注册按钮 -->
            <template v-if="!authStore.isLoggedIn">
              <el-button text class="login-btn" @click="goToLogin">
                <el-icon :size="18">
                  <User />
                </el-icon>
                <span>{{ $t('auth.login') }}</span>
              </el-button>
              <el-button type="primary" class="register-btn" @click="goToRegister">
                <el-icon :size="18">
                  <ArrowRight />
                </el-icon>
                <span>{{ $t('auth.register') }}</span>
              </el-button>
            </template>

            <!-- 已登录时显示用户信息和进入控制台按钮 -->
            <template v-else>
              <el-button type="primary" class="dashboard-btn" @click="goToDashboard">
                <el-icon :size="18">
                  <House />
                </el-icon>
                <span>{{ $t('landing.nav.dashboard') }}</span>
              </el-button>
              <el-dropdown trigger="click" @command="handleUserAction" class="user-dropdown">
                <el-button text class="user-btn">
                  <div class="user-avatar">
                    <el-icon :size="20">
                      <User />
                    </el-icon>
                  </div>
                  <span>{{ authStore.userName }}</span>
                  <el-icon class="dropdown-arrow" :size="14">
                    <ArrowRight />
                  </el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu class="user-dropdown-menu">
                    <el-dropdown-item command="dashboard">
                      <el-icon>
                        <House />
                      </el-icon>
                      <span>{{ $t('landing.nav.dashboard') }}</span>
                    </el-dropdown-item>
                    <el-dropdown-item command="profile">
                      <el-icon>
                        <User />
                      </el-icon>
                      <span>{{ $t('landing.nav.profile') }}</span>
                    </el-dropdown-item>
                    <el-dropdown-item divided command="logout">
                      <el-icon>
                        <SwitchButton />
                      </el-icon>
                      <span>{{ $t('auth.logout') }}</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </div>
        </div>
      </div>
    </header>

    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <!-- 中央主标题区域 -->
          <div class="hero-main">
            <div class="hero-badge">
              <el-icon :size="20">
                <Star />
              </el-icon>
              <span>AI智能专利服务平台</span>
            </div>
            <h1 class="hero-title">让专利申请
              <span class="title-highlight">化繁为简</span>
            </h1>
            <p class="hero-subtitle">三性分析·答辩支持·智能生成<br />专业AI驱动，助力创新保护</p>

            <!-- CTA按钮组 -->
            <div class="hero-actions">
              <el-button type="primary" size="large" class="cta-button" @click="goToRegister">
                <el-icon :size="20">
                  <ArrowRight />
                </el-icon>
                <span>立即开始</span>
              </el-button>
              <el-button size="large" class="demo-button" @click="goToLogin">
                <el-icon :size="20">
                  <ChatDotSquare />
                </el-icon>
                <span>体验Demo</span>
              </el-button>
            </div>

            <!-- 信任标识 -->
            <div class="trust-badges">
              <div class="trust-item">
                <el-icon class="trust-icon">
                  <Check />
                </el-icon>
                <span>专业可靠</span>
              </div>
              <div class="trust-divider"></div>
              <div class="trust-item">
                <el-icon class="trust-icon">
                  <Check />
                </el-icon>
                <span>安全保密</span>
              </div>
              <div class="trust-divider"></div>
              <div class="trust-item">
                <el-icon class="trust-icon">
                  <Check />
                </el-icon>
                <span>高效便捷</span>
              </div>
            </div>
          </div>

          <!-- 核心功能卡片展示 -->
          <div class="hero-features">
            <div class="feature-card-mini" v-for="(feature, index) in heroFeatures" :key="index">
              <div class="card-icon-wrapper" :style="{ background: feature.gradient }">
                <el-icon :size="32">
                  <component :is="feature.icon" />
                </el-icon>
              </div>
              <div class="card-info">
                <h4>{{ feature.title }}</h4>
                <p>{{ feature.desc }}</p>
              </div>
              <div class="card-arrow">
                <el-icon>
                  <ArrowRight />
                </el-icon>
              </div>
            </div>
          </div>

          <!-- 数据统计 -->
          <div class="hero-stats">
            <div class="stat-card">
              <div class="stat-number">10,000<span class="stat-plus">+</span></div>
              <div class="stat-label">活跃用户</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">50,000<span class="stat-plus">+</span></div>
              <div class="stat-label">处理专利</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">98<span class="stat-plus">%</span></div>
              <div class="stat-label">成功率</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">24/7</div>
              <div class="stat-label">在线服务</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 装饰元素 -->
      <div class="hero-decoration">
        <div class="deco-circle deco-1"></div>
        <div class="deco-circle deco-2"></div>
        <div class="deco-circle deco-3"></div>
      </div>
    </section>



    <!-- 功能特性区域 -->
    <section id="features" class="features-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">核心功能</h2>
          <p class="section-subtitle">AI智能驱动，为您的专利申请保驾护航</p>
        </div>
        <div class="features-grid-two">
          <!-- 答辩支持卡片 -->
          <div class="feature-card-large defense">
            <div class="card-header">
              <div class="feature-icon-large">
                <el-icon :size="48">
                  <ChatDotSquare />
                </el-icon>
              </div>
              <div class="feature-badge">AI智能</div>
            </div>
            <h3 class="feature-title-large">答辩支持</h3>
            <p class="feature-desc-large">智能生成审查意见通知书与答辩意见回复，专业高效</p>
            <div class="feature-highlights">
              <div class="highlight-item">
                <el-icon class="highlight-icon">
                  <Check />
                </el-icon>
                <span>模拟审查生成</span>
              </div>
              <div class="highlight-item">
                <el-icon class="highlight-icon">
                  <Check />
                </el-icon>
                <span>智能答辩回复</span>
              </div>
              <div class="highlight-item">
                <el-icon class="highlight-icon">
                  <Check />
                </el-icon>
                <span>专业意见分析</span>
              </div>
            </div>
            <el-button type="primary" class="feature-button" @click="$router.push('/app/defense-support')">
              立即使用
              <el-icon class="ml-2">
                <ArrowRight />
              </el-icon>
            </el-button>
          </div>

          <!-- 三性分析卡片 -->
          <div class="feature-card-large analysis">
            <div class="card-header">
              <div class="feature-icon-large">
                <el-icon :size="48">
                  <DataAnalysis />
                </el-icon>
              </div>
              <div class="feature-badge">深度分析</div>
            </div>
            <h3 class="feature-title-large">三性分析</h3>
            <p class="feature-desc-large">AI智能评估专利的新颖性、创造性和实用性，助力成功申请</p>
            <div class="feature-highlights">
              <div class="highlight-item">
                <el-icon class="highlight-icon">
                  <Check />
                </el-icon>
                <span>新颖性评估</span>
              </div>
              <div class="highlight-item">
                <el-icon class="highlight-icon">
                  <Check />
                </el-icon>
                <span>创造性分析</span>
              </div>
              <div class="highlight-item">
                <el-icon class="highlight-icon">
                  <Check />
                </el-icon>
                <span>实用性检测</span>
              </div>
            </div>
            <el-button type="primary" class="feature-button" @click="$router.push('/app/three-analysis/new')">
              立即使用
              <el-icon class="ml-2">
                <ArrowRight />
              </el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </section>

    <!-- 数据可视化展示区域 -->
    <!-- <section class="stats-visual-section">
      <div class="container">
        <div class="stats-content">
          <div class="stats-text">
            <h2>{{ $t('landing.stats.title') }}</h2>
            <p>{{ $t('landing.stats.subtitle') }}</p>
            <div class="stats-list">
              <div class="stat-box">
                <div class="stat-icon">
                  <el-icon :size="32">
                    <DataAnalysis />
                  </el-icon>
                </div>
                <div class="stat-info">
                  <h3>5000K+</h3>
                  <p>{{ $t('landing.stats.patentDatabase') }}</p>
                </div>
              </div>
              <div class="stat-box">
                <div class="stat-icon">
                  <el-icon :size="32">
                    <Document />
                  </el-icon>
                </div>
                <div class="stat-info">
                  <h3>10K+</h3>
                  <p>{{ $t('landing.stats.successCases') }}</p>
                </div>
              </div>
              <div class="stat-box">
                <div class="stat-icon">
                  <el-icon :size="32">
                    <Star />
                  </el-icon>
                </div>
                <div class="stat-info">
                  <h3>99%</h3>
                  <p>{{ $t('landing.stats.customerSatisfaction') }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="stats-visual">
            <div class="visual-mockup">
              <div class="mockup-screen" style="background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);">
                <div class="screen-content">
                  <img src="/0001.png" alt="Data Analysis" style="width: 530px; height: 400px; object-fit: cover;" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section> -->

    <!-- 价格方案区域 -->
    <!-- <section id="pricing" class="pricing-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ $t('landing.pricing.title') }}</h2>
          <p class="section-subtitle">{{ $t('landing.pricing.subtitle') }}</p>
        </div>
        <div class="pricing-grid">
          <div class="pricing-card" v-for="(plan, index) in pricingPlans" :key="index"
            :class="{ popular: plan.popular }">
            <div v-if="plan.popular" class="popular-badge">{{ $t('landing.pricing.popular') }}</div>
            <h3 class="plan-name">{{ $t(plan.nameKey) }}</h3>
            <div class="plan-price">
              <span class="currency">$</span>
              <span class="amount">{{ plan.price }}</span>
              <span class="period">{{ $t('landing.pricing.perMonth') }}</span>
            </div>
            <ul class="plan-features">
              <li v-for="(featureKey, idx) in plan.featuresKeys" :key="idx">
                <el-icon class="check-icon">
                  <Check />
                </el-icon>
                {{ $t(featureKey) }}
              </li>
            </ul>
            <el-button :type="plan.popular ? 'primary' : 'default'" size="large" class="plan-button"
              @click="goToRegister">
              {{ $t('landing.pricing.choosePlan') }}
            </el-button>
          </div>
        </div>
      </div>
    </section> -->

    <!-- 关于我们区域 -->
    <section id="about" class="about-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">关于我们</h2>
          <p class="section-subtitle">专业团队·创新技术·值得信赖</p>
        </div>

        <!-- 使命愿景卡片 -->
        <div class="about-main-cards">
          <div class="about-card-new mission">
            <div class="card-icon-wrapper">
              <el-icon :size="56">
                <Star />
              </el-icon>
            </div>
            <div class="card-content">
              <h3>我们的使命</h3>
              <p>{{ $t('landing.about.mission.content') }}</p>
            </div>
            <div class="card-decoration"></div>
          </div>
          <div class="about-card-new vision">
            <div class="card-icon-wrapper">
              <el-icon :size="56">
                <DataAnalysis />
              </el-icon>
            </div>
            <div class="card-content">
              <h3>我们的愿景</h3>
              <p>{{ $t('landing.about.vision.content') }}</p>
            </div>
            <div class="card-decoration"></div>
          </div>
        </div>

        <!-- 核心价值观 -->
        <div class="values-section">
          <div class="values-header">
            <h3 class="values-title">核心价值观</h3>
            <p class="values-subtitle">坚持专业，追求卓越</p>
          </div>
          <div class="values-grid">
            <div class="value-item">
              <div class="value-icon-wrapper">
                <el-icon :size="40">
                  <Star />
                </el-icon>
              </div>
              <h4>{{ $t('landing.about.values.innovation') }}</h4>
              <p>{{ $t('landing.about.values.innovationDesc') }}</p>
              <div class="value-number">01</div>
            </div>
            <div class="value-item">
              <div class="value-icon-wrapper">
                <el-icon :size="40">
                  <Document />
                </el-icon>
              </div>
              <h4>{{ $t('landing.about.values.professional') }}</h4>
              <p>{{ $t('landing.about.values.professionalDesc') }}</p>
              <div class="value-number">02</div>
            </div>
            <div class="value-item">
              <div class="value-icon-wrapper">
                <el-icon :size="40">
                  <DataAnalysis />
                </el-icon>
              </div>
              <h4>{{ $t('landing.about.values.efficiency') }}</h4>
              <p>{{ $t('landing.about.values.efficiencyDesc') }}</p>
              <div class="value-number">03</div>
            </div>
            <div class="value-item">
              <div class="value-icon-wrapper">
                <el-icon :size="40">
                  <Check />
                </el-icon>
              </div>
              <h4>{{ $t('landing.about.values.integrity') }}</h4>
              <p>{{ $t('landing.about.values.integrityDesc') }}</p>
              <div class="value-number">04</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系我们区域 -->
    <section id="contact" class="contact-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">联系我们</h2>
          <p class="section-subtitle">随时为您提供专业咨询服务</p>
        </div>
        <div class="contact-content">
          <div class="contact-info">
            <div class="contact-info-header">
              <h3>联系方式</h3>
              <p>欢迎通过以下方式与我们取得联系</p>
            </div>
            <div class="info-list">
              <div class="info-item">
                <div class="info-icon">
                  <el-icon :size="28">
                    <More />
                  </el-icon>
                </div>
                <div class="info-content">
                  <h4>公司地址</h4>
                  <p>50 Bukit Batok Street 23,#07-14<br />Midview building, Singapore 659578</p>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon">
                  <el-icon :size="28">
                    <Document />
                  </el-icon>
                </div>
                <div class="info-content">
                  <h4>电子邮箱</h4>
                  <p>ipsrvc@outlook.com</p>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon">
                  <el-icon :size="28">
                    <DataAnalysis />
                  </el-icon>
                </div>
                <div class="info-content">
                  <h4>服务时间</h4>
                  <p>{{ $t('landing.contact.info.hoursContent') }}</p>
                </div>
              </div>
            </div>
            <div class="social-links">
              <h4>关注我们</h4>
              <div class="social-icons">
                <el-button class="social-btn" circle>
                  <el-icon :size="20">
                    <More />
                  </el-icon>
                </el-button>
                <el-button class="social-btn" circle>
                  <el-icon :size="20">
                    <Star />
                  </el-icon>
                </el-button>
                <el-button class="social-btn" circle>
                  <el-icon :size="20">
                    <Document />
                  </el-icon>
                </el-button>
              </div>
            </div>
          </div>
          <div class="contact-form-wrapper">
            <div class="form-header">
              <h3>在线留言</h3>
              <p>请填写以下信息，我们将尽快与您联系</p>
            </div>
            <el-form class="contact-form" label-position="top">
              <div class="form-row">
                <el-form-item :label="$t('landing.contact.form.name')">
                  <el-input :placeholder="$t('landing.contact.form.namePlaceholder')" size="large" />
                </el-form-item>
                <el-form-item :label="$t('landing.contact.form.email')">
                  <el-input type="email" :placeholder="$t('landing.contact.form.emailPlaceholder')" size="large" />
                </el-form-item>
              </div>
              <el-form-item :label="$t('landing.contact.form.subject')">
                <el-input :placeholder="$t('landing.contact.form.subjectPlaceholder')" size="large" />
              </el-form-item>
              <el-form-item :label="$t('landing.contact.form.message')">
                <el-input type="textarea" :rows="5" :placeholder="$t('landing.contact.form.messagePlaceholder')" />
              </el-form-item>
              <el-button type="primary" size="large" class="submit-button">
                <el-icon :size="18">
                  <ArrowRight />
                </el-icon>
                <span>{{ $t('landing.contact.form.submit') }}</span>
              </el-button>
            </el-form>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA 区域 -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">{{ $t('landing.cta.title') }}</h2>
          <p class="cta-subtitle">{{ $t('landing.cta.subtitle') }}</p>
          <el-button type="primary" size="large" class="cta-button" @click="goToRegister">
            {{ $t('landing.cta.startNow') }}
            <el-icon class="ml-1">
              <ArrowRight />
            </el-icon>
          </el-button>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="landing-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <div class="footer-logo" @click="$router.push('/')" style="cursor: pointer;">
              <!-- <img src="/favicon.ico" class="logo-icon" alt="Logo" /> -->
              <span class="logo-text">{{ $t('landing.brand') }}</span>
            </div>
            <p class="footer-description">{{ $t('landing.footer.description') }}</p>
          </div>
          <div class="footer-section">
            <h4 class="footer-title">{{ $t('landing.footer.product') }}</h4>
            <ul class="footer-links">
              <li><a href="#features">{{ $t('landing.nav.features') }}</a></li>
              <li><a href="#pricing">{{ $t('landing.nav.pricing') }}</a></li>
              <li><a href="#">{{ $t('landing.footer.api') }}</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4 class="footer-title">{{ $t('landing.footer.company') }}</h4>
            <ul class="footer-links">
              <li><a href="#about">{{ $t('landing.nav.about') }}</a></li>
              <li><a href="#">{{ $t('landing.footer.blog') }}</a></li>
              <li><a href="#contact">{{ $t('landing.nav.contact') }}</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4 class="footer-title">{{ $t('landing.footer.legal') }}</h4>
            <ul class="footer-links">
              <li><a href="#">{{ $t('landing.footer.privacy') }}</a></li>
              <li><a href="#">{{ $t('landing.footer.terms') }}</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 {{ $t('landing.brand') }}. {{ $t('landing.footer.copyright') }}</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import {
  ArrowRight,
  Document,
  Search,
  Edit,
  Check,
  DataAnalysis,
  ChatDotSquare,
  Star,
  More,
  User,
  House,
  SwitchButton,
} from '@element-plus/icons-vue'

const router = useRouter()
const { locale, t } = useI18n()
const authStore = useAuthStore()

// 当前轮播索引
const currentSlide = ref(0)

// 英雄区域核心功能数据
const heroFeatures = [
  {
    icon: markRaw(DataAnalysis),
    title: '三性分析',
    desc: 'AI智能评估新颖性、创造性、实用性',
    gradient: 'linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%)'
  },
  {
    icon: markRaw(ChatDotSquare),
    title: '答辩支持',
    desc: '智能生成审查意见与答辩回复',
    gradient: 'linear-gradient(135deg, #6A5ACD 0%, #8B7FE8 100%)'
  }
]

// 服务数据
const allServices = [
  {
    icon: markRaw(DataAnalysis),
    titleKey: 'landing.services.intelligentAnalysis.title',
    descriptionKey: 'landing.services.intelligentAnalysis.description',
    gradient: 'linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%)'
  },
  {
    icon: markRaw(Search),
    titleKey: 'landing.services.globalSearch.title',
    descriptionKey: 'landing.services.globalSearch.description',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    icon: markRaw(Edit),
    titleKey: 'landing.services.patentDraft.title',
    descriptionKey: 'landing.services.patentDraft.description',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    icon: markRaw(ChatDotSquare),
    titleKey: 'landing.services.threeAnalysis.title',
    descriptionKey: 'landing.services.threeAnalysis.description',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    icon: markRaw(Document),
    titleKey: 'landing.services.techReport.title',
    descriptionKey: 'landing.services.techReport.description',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  },
  {
    icon: markRaw(Star),
    titleKey: 'landing.services.defenseSupport.title',
    descriptionKey: 'landing.services.defenseSupport.description',
    gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
  }
]

// 将服务分组，每组3个一组
const serviceGroups = computed(() => {
  const groups = []
  for (let i = 0; i < allServices.length; i += 3) {
    groups.push(allServices.slice(i, i + 3))
  }
  return groups
})

// 跳转到指定幻灯片
const goToSlide = (index: number) => {
  currentSlide.value = index
  // 这里需要通过 ref 控制 carousel 组件
}

// 监听轮播变化
const handleCarouselChange = (current: number) => {
  currentSlide.value = current
}

const languageMap: Record<string, string> = {
  'zh-CN': '简体中文',
  'en-US': 'English',
  'ja-JP': '日本語',
  'de-DE': 'Deutsch',
  'fr-FR': 'Français',
  'ru-RU': 'Русский',
  'ar-SA': 'العربية',
}

const flagMap: Record<string, string> = {
  'zh-CN': '🇨🇳',
  'en-US': '🇺🇸',
  'ja-JP': '🇯🇵',
  'de-DE': '🇩🇪',
  'fr-FR': '🇫🇷',
  'ru-RU': '🇷🇺',
  'ar-SA': '🇸🇦',
}

// 备用：如果 emoji 不显示，使用文本缩写
const flagTextMap: Record<string, string> = {
  'zh-CN': 'CN',
  'en-US': 'US',
  'ja-JP': 'JP',
  'de-DE': 'DE',
  'fr-FR': 'FR',
  'ru-RU': 'RU',
  'ar-SA': 'SA',
}

const currentLanguageLabel = computed(() => languageMap[locale.value] || 'English')
const currentLanguageFlag = computed(() => flagMap[locale.value] || '🇺🇸')

// 获取国旗代码
const getFlagCode = (lang: string) => {
  const codeMap: Record<string, string> = {
    'zh-CN': 'cn',
    'en-US': 'us',
    'ja-JP': 'jp',
    'de-DE': 'de',
    'fr-FR': 'fr',
    'ru-RU': 'ru',
    'ar-SA': 'sa',
  }
  return codeMap[lang] || 'us'
}

const handleLanguageChange = (lang: string) => {
  locale.value = lang
  localStorage.setItem('language', lang)
}

const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/register')
}

const goToDashboard = () => {
  router.push('/app/dashboard')
}

const handleUserAction = async (command: string) => {
  switch (command) {
    case 'dashboard':
      router.push('/app/dashboard')
      break
    case 'profile':
      router.push('/app/profile')
      break
    case 'logout':
      await authStore.logout()
      router.push('/home')
      break
  }
}

const features = [
  {
    icon: markRaw(Document),
    titleKey: 'landing.features.items.techReport.title',
    descKey: 'landing.features.items.techReport.desc',
    color: 'linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%)',
  },
  {
    icon: markRaw(Search),
    titleKey: 'landing.features.items.patentSearch.title',
    descKey: 'landing.features.items.patentSearch.desc',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    icon: markRaw(Edit),
    titleKey: 'landing.features.items.patentDraft.title',
    descKey: 'landing.features.items.patentDraft.desc',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    icon: markRaw(DataAnalysis),
    titleKey: 'landing.features.items.threeAnalysis.title',
    descKey: 'landing.features.items.threeAnalysis.desc',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
  {
    icon: markRaw(ChatDotSquare),
    titleKey: 'landing.features.items.defenseSupport.title',
    descKey: 'landing.features.items.defenseSupport.desc',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  {
    icon: markRaw(Star),
    titleKey: 'landing.features.items.aiPowered.title',
    descKey: 'landing.features.items.aiPowered.desc',
    color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  },
]

const pricingPlans = [
  {
    nameKey: 'landing.pricing.plans.free.name',
    price: 0,
    popular: false,
    featuresKeys: [
      'landing.pricing.plans.free.features.searches',
      'landing.pricing.plans.free.features.reports',
      'landing.pricing.plans.free.features.support',
    ],
  },
  {
    nameKey: 'landing.pricing.plans.pro.name',
    price: 49,
    popular: true,
    featuresKeys: [
      'landing.pricing.plans.pro.features.searches',
      'landing.pricing.plans.pro.features.reports',
      'landing.pricing.plans.pro.features.drafts',
      'landing.pricing.plans.pro.features.support',
      'landing.pricing.plans.pro.features.api',
    ],
  },
  {
    nameKey: 'landing.pricing.plans.enterprise.name',
    price: 199,
    popular: false,
    featuresKeys: [
      'landing.pricing.plans.enterprise.features.unlimited',
      'landing.pricing.plans.enterprise.features.team',
      'landing.pricing.plans.enterprise.features.custom',
      'landing.pricing.plans.enterprise.features.priority',
      'landing.pricing.plans.enterprise.features.dedicated',
    ],
  },
]
</script>

<style scoped lang="scss">
.landing-page {
  background: #fff;
  min-height: 100vh;
}

// 容器
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

// 顶部导航栏
.landing-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(15, 76, 129, 0.08);
  z-index: 1000;
  padding: 12px 0;
  box-shadow: 0 2px 16px rgba(15, 76, 129, 0.04);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 24px rgba(15, 76, 129, 0.08);
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 22px;
    font-weight: 700;
    color: #0F4C81;
    cursor: pointer;
    transition: all 0.3s;
    padding: 8px 16px;
    border-radius: 12px;

    &:hover {
      background: linear-gradient(135deg, rgba(15, 76, 129, 0.05) 0%, rgba(106, 90, 205, 0.05) 100%);
      transform: translateY(-2px);

      .logo-icon-wrapper {
        transform: rotate(15deg) scale(1.1);
        background: linear-gradient(135deg, #1a5f9e 0%, #7B68EE 100%);
      }
    }

    .logo-icon-wrapper {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: 0 4px 12px rgba(15, 76, 129, 0.25);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .logo-text {
      background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .nav-menu {
    display: flex;
    gap: 8px;

    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      padding: 10px 20px;
      border-radius: 10px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
        transform: scaleX(0);
        transition: transform 0.3s;
      }

      .el-icon {
        transition: all 0.3s;
      }

      &:hover {
        color: #0F4C81;
        background: linear-gradient(135deg, rgba(15, 76, 129, 0.05) 0%, rgba(106, 90, 205, 0.05) 100%);
        transform: translateY(-2px);

        &::before {
          transform: scaleX(1);
        }

        .el-icon {
          transform: scale(1.15) rotate(-5deg);
        }
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;

    .login-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1a1a1a;
      font-weight: 600;
      padding: 10px 20px;
      border-radius: 10px;
      transition: all 0.3s;

      &:hover {
        background: linear-gradient(135deg, rgba(15, 76, 129, 0.08) 0%, rgba(106, 90, 205, 0.08) 100%);
        color: #0F4C81;
        transform: translateY(-2px);
      }
    }

    .register-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      border-radius: 10px;
      font-weight: 700;
      background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
      border: none;
      color: #fff;
      box-shadow: 0 4px 12px rgba(15, 76, 129, 0.25);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: linear-gradient(135deg, #1a5f9e 0%, #7B68EE 100%);
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(15, 76, 129, 0.35);

        .el-icon {
          transform: translateX(3px);
        }
      }

      .el-icon {
        transition: transform 0.3s;
      }
    }

    .dashboard-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      border-radius: 10px;
      font-weight: 700;
      background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
      border: none;
      color: #fff;
      box-shadow: 0 4px 12px rgba(15, 76, 129, 0.25);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: linear-gradient(135deg, #1a5f9e 0%, #7B68EE 100%);
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(15, 76, 129, 0.35);
      }
    }

    .user-dropdown {
      .user-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 16px 6px 6px;
        border-radius: 12px;
        transition: all 0.3s;
        background: rgba(15, 76, 129, 0.05);
        border: 1px solid rgba(15, 76, 129, 0.1);

        &:hover {
          background: rgba(15, 76, 129, 0.1);
          border-color: rgba(15, 76, 129, 0.2);
          transform: translateY(-2px);
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 3px 10px rgba(15, 76, 129, 0.2);
        }

        span {
          color: #1a1a1a;
          font-weight: 600;
          font-size: 14px;
        }

        .dropdown-arrow {
          color: #999;
          transform: rotate(90deg);
          transition: transform 0.3s;
        }

        &:hover .dropdown-arrow {
          transform: rotate(90deg) translateX(2px);
        }
      }
    }
  }
}

// 用户下拉菜单
.user-dropdown-menu {
  :deep(.el-dropdown-menu__item) {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    font-size: 14px;
    transition: all 0.3s;

    .el-icon {
      color: #0F4C81;
      font-size: 18px;
    }

    span {
      color: #1a1a1a;
      font-weight: 500;
    }

    &:hover {
      background: linear-gradient(135deg, rgba(15, 76, 129, 0.08) 0%, rgba(106, 90, 205, 0.08) 100%);

      .el-icon {
        transform: scale(1.1);
      }
    }
  }
}

// 英雄区域
.hero-section {
  padding: 120px 0 80px;
  background: linear-gradient(180deg, #0F4C81 0%, #1a5f9e 50%, #6A5ACD 100%);
  position: relative;
  overflow: hidden;
  min-height: 85vh;

  // 移除原有的before和after背景效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(106, 90, 205, 0.15) 0%, transparent 50%);
    opacity: 0.6;
  }

  .hero-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 56px;
  }

  // 主标题区域
  .hero-main {
    max-width: 800px;
    width: 100%;
    color: #fff;

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 50px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 32px;
      transition: all 0.3s;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }

      .el-icon {
        color: #FFD700;
      }
    }

    .hero-title {
      font-size: 64px;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 24px;
      color: #fff;

      .title-highlight {
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        position: relative;
        display: inline-block;

        &::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          border-radius: 2px;
        }
      }
    }

    .hero-subtitle {
      font-size: 18px;
      line-height: 1.8;
      margin-bottom: 48px;
      opacity: 0.95;
      font-weight: 400;
    }

    .hero-actions {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin-bottom: 48px;

      .cta-button {
        padding: 16px 48px;
        font-size: 17px;
        font-weight: 700;
        border-radius: 50px;
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        border: none;
        color: #1a1a1a;
        box-shadow: 0 8px 24px rgba(255, 215, 0, 0.4);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        gap: 12px;

        &:hover {
          background: linear-gradient(135deg, #FFA500 0%, #FFD700 100%);
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 12px 32px rgba(255, 215, 0, 0.5);
        }

        .el-icon {
          transition: transform 0.3s;
        }

        &:hover .el-icon {
          transform: translateX(4px);
        }
      }

      .demo-button {
        padding: 16px 48px;
        font-size: 17px;
        font-weight: 600;
        border-radius: 50px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.5);
        color: #fff;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        gap: 12px;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.8);
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(255, 255, 255, 0.2);
        }
      }
    }

    .trust-badges {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      padding: 20px 0;

      .trust-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 500;
        opacity: 0.9;

        .trust-icon {
          color: #10b981;
          font-size: 18px;
        }
      }

      .trust-divider {
        width: 1px;
        height: 20px;
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }

  // 核心功能卡片
  .hero-features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    max-width: 900px;
    width: 100%;

    .feature-card-mini {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 28px 32px;
      display: flex;
      align-items: center;
      gap: 20px;
      border: 2px solid rgba(255, 255, 255, 0.5);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;

      &:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 60px rgba(15, 76, 129, 0.3);
        border-color: rgba(255, 215, 0, 0.5);

        .card-arrow {
          opacity: 1;
          transform: translateX(4px);
        }
      }

      .card-icon-wrapper {
        width: 72px;
        height: 72px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        box-shadow: 0 8px 24px rgba(15, 76, 129, 0.25);
        flex-shrink: 0;
        transition: all 0.3s;
      }

      &:hover .card-icon-wrapper {
        transform: rotate(-5deg) scale(1.1);
        box-shadow: 0 12px 32px rgba(15, 76, 129, 0.35);
      }

      .card-info {
        flex: 1;
        text-align: left;

        h4 {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }

        p {
          font-size: 14px;
          color: #666;
          margin: 0;
          line-height: 1.5;
        }
      }

      .card-arrow {
        color: #0F4C81;
        font-size: 20px;
        opacity: 0.5;
        transition: all 0.3s;
        flex-shrink: 0;
      }
    }
  }

  // 数据统计
  .hero-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    max-width: 1000px;
    width: 100%;

    .stat-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      padding: 24px 20px;
      text-align: center;
      transition: all 0.3s;

      &:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.4);
        transform: translateY(-5px);
      }

      .stat-number {
        font-size: 36px;
        font-weight: 800;
        color: #fff;
        margin-bottom: 8px;
        line-height: 1;

        .stat-plus {
          font-size: 24px;
          color: #FFD700;
        }
      }

      .stat-label {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.85);
        font-weight: 500;
      }
    }
  }

  // 装饰元素
  .hero-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    pointer-events: none;

    .deco-circle {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
      animation: float 8s ease-in-out infinite;
    }

    .deco-1 {
      width: 400px;
      height: 400px;
      top: -100px;
      left: -100px;
      animation-delay: 0s;
    }

    .deco-2 {
      width: 300px;
      height: 300px;
      bottom: -50px;
      right: -50px;
      animation-delay: 2s;
    }

    .deco-3 {
      width: 200px;
      height: 200px;
      top: 50%;
      right: 10%;
      animation-delay: 4s;
    }
  }
}



@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 25px 70px rgba(15, 76, 129, 0.25);
  }

  50% {
    transform: scale(1.05);
    box-shadow: 0 30px 80px rgba(15, 76, 129, 0.35);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes backgroundFloat {

  0%,
  100% {
    opacity: 1;
    transform: translateY(0);
  }

  50% {
    opacity: 0.8;
    transform: translateY(-10px);
  }
}

@keyframes particleFloat {
  0% {
    background-position: 0% 0%, 100% 100%, 50% 50%, 0% 100%;
  }

  50% {
    background-position: 100% 100%, 0% 0%, 25% 75%, 100% 0%;
  }

  100% {
    background-position: 0% 0%, 100% 100%, 50% 50%, 0% 100%;
  }
}

@keyframes titleShine {

  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 特色服务展示区域
.services-showcase {
  padding: 100px 0;
  background: white;
  position: relative;

  .services-carousel {
    margin-top: 60px;

    :deep(.el-carousel__container) {
      height: 350px;
    }
  }

  .services-visual {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
    padding: 0 20px;
  }

  .service-image-card {
    text-align: center;
    transition: transform 0.3s;
    animation: fadeInUp 0.6s ease-out;

    &:hover {
      transform: translateY(-10px);
    }

    .image-placeholder {
      height: 200px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      transition: all 0.3s;
      background-color: #f8f9fa;

      &:hover {
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      }
    }

    h3 {
      font-size: 20px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 12px;
    }

    p {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
    }
  }

  // 自定义指示器
  .carousel-indicators {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 40px;

    .indicator-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #d1d5db;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: #9ca3af;
      }

      &.active {
        background: #0F4C81;
        width: 32px;
        border-radius: 6px;
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 数据可视化展示区域
.stats-visual-section {
  padding: 100px 0;
  background: #f8f9fa;

  .stats-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
  }

  .stats-text {
    h2 {
      font-size: 42px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 16px;
    }

    p {
      font-size: 18px;
      color: #666;
      margin-bottom: 40px;
    }
  }

  .stats-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .stat-box {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 24px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .stat-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .stat-info {
      h3 {
        font-size: 32px;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0 0 4px 0;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: #666;
      }
    }
  }

  .stats-visual {
    .visual-mockup {
      position: relative;
      padding: 20px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);

      .mockup-screen {
        height: 400px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        .screen-content {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          .chart-placeholder {
            animation: pulse 2s ease-in-out infinite;
          }
        }
      }
    }
  }
}

// 功能特性区域
.features-section {
  padding: 100px 0;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
}

.section-header {
  text-align: center;
  margin-bottom: 60px;

  .section-title {
    font-size: 42px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 16px;
  }

  .section-subtitle {
    font-size: 18px;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
  }
}

.features-grid-two {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  max-width: 1100px;
  margin: 0 auto;
}

.feature-card-large {
  background: #fff;
  padding: 48px 40px;
  border-radius: 24px;
  border: 2px solid transparent;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
    transform: scaleX(0);
    transition: transform 0.4s;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(15, 76, 129, 0.2);
    border-color: rgba(15, 76, 129, 0.1);

    &::before {
      transform: scaleX(1);
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .feature-icon-large {
    width: 88px;
    height: 88px;
    border-radius: 20px;
    background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    box-shadow: 0 8px 24px rgba(15, 76, 129, 0.3);
    transition: all 0.3s;
  }

  &:hover .feature-icon-large {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 12px 32px rgba(15, 76, 129, 0.4);
  }

  .feature-badge {
    padding: 8px 20px;
    background: linear-gradient(135deg, rgba(15, 76, 129, 0.1) 0%, rgba(106, 90, 205, 0.1) 100%);
    color: #0F4C81;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    border: 1px solid rgba(15, 76, 129, 0.2);
  }

  .feature-title-large {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .feature-desc-large {
    font-size: 16px;
    color: #666;
    line-height: 1.8;
    margin-bottom: 32px;
  }

  .feature-highlights {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 36px;

    .highlight-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #f8f9fa;
      border-radius: 12px;
      transition: all 0.3s;

      &:hover {
        background: #e7f0ff;
        transform: translateX(8px);
      }

      .highlight-icon {
        color: #10b981;
        font-size: 20px;
        flex-shrink: 0;
      }

      span {
        color: #1a1a1a;
        font-size: 15px;
        font-weight: 500;
      }
    }
  }

  .feature-button {
    width: 100%;
    padding: 14px 24px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
    border: none;
    transition: all 0.3s;

    .ml-2 {
      margin-left: 8px;
      transition: transform 0.3s;
    }

    &:hover {
      background: linear-gradient(135deg, #1a5f9e 0%, #7B68EE 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(15, 76, 129, 0.4);

      .ml-2 {
        transform: translateX(4px);
      }
    }
  }
}

// 价格方案区域
.pricing-section {
  padding: 100px 0;
  background: #fff;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.pricing-card {
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 40px 32px;
  position: relative;
  transition: all 0.3s;

  &:hover {
    border-color: #0F4C81;
    box-shadow: 0 12px 40px rgba(15, 76, 129, 0.15);
  }

  &.popular {
    border-color: #0F4C81;
    box-shadow: 0 12px 40px rgba(15, 76, 129, 0.15);
    transform: scale(1.05);
  }

  .popular-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
    color: #fff;
    padding: 4px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }

  .plan-name {
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 16px;
  }

  .plan-price {
    margin-bottom: 32px;

    .currency {
      font-size: 24px;
      color: #666;
      vertical-align: top;
    }

    .amount {
      font-size: 56px;
      font-weight: 700;
      color: #1a1a1a;
    }

    .period {
      font-size: 16px;
      color: #666;
      margin-left: 8px;
    }
  }

  .plan-features {
    list-style: none;
    padding: 0;
    margin: 0 0 32px 0;

    li {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      color: #666;

      .check-icon {
        color: #10b981;
        font-size: 20px;
      }
    }
  }

  .plan-button {
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    font-weight: 600;
    transition: all 0.3s;

    &.el-button--primary {
      background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
      border: none;

      &:hover {
        background: linear-gradient(135deg, #1a5f9e 0%, #7B68EE 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(15, 76, 129, 0.3);
      }
    }

    &.el-button--default {
      border: 2px solid #e7f0ff;
      color: #0F4C81;

      &:hover {
        border-color: #0F4C81;
        background: #f0f4ff;
      }
    }
  }
}

// CTA 区域
.cta-section {
  padding: 100px 0;
  background: linear-gradient(135deg, #0F4C81 0%, #1a5f9e 50%, #6A5ACD 100%);
  color: #fff;
  text-align: center;

  .cta-title {
    font-size: 42px;
    font-weight: 700;
    margin-bottom: 16px;
  }

  .cta-subtitle {
    font-size: 18px;
    margin-bottom: 40px;
    opacity: 0.9;
  }

  .cta-button {
    padding: 14px 40px;
    font-size: 16px;
    border-radius: 12px;
    background: #fff;
    color: #0F4C81;
    border: none;
    font-weight: 600;
    transition: all 0.3s;

    &:hover {
      background: rgba(255, 255, 255, 0.95);
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(255, 255, 255, 0.3);
    }

    .ml-1 {
      margin-left: 8px;
    }
  }
}

// 关于我们区域
.about-section {
  padding: 100px 0;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);

  .about-main-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
    margin-bottom: 80px;
  }

  .about-card-new {
    background: #fff;
    padding: 48px 40px;
    border-radius: 24px;
    border: 2px solid transparent;
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 6px;
      background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
      transform: scaleX(0);
      transition: transform 0.4s;
    }

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(15, 76, 129, 0.15);
      border-color: rgba(15, 76, 129, 0.1);

      &::before {
        transform: scaleX(1);
      }

      .card-icon-wrapper {
        transform: scale(1.1) rotate(5deg);
        box-shadow: 0 12px 32px rgba(15, 76, 129, 0.4);
      }

      .card-decoration {
        transform: scale(1.2);
        opacity: 0.3;
      }
    }

    .card-icon-wrapper {
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      margin-bottom: 28px;
      box-shadow: 0 8px 24px rgba(15, 76, 129, 0.3);
      transition: all 0.4s;
    }

    .card-content {
      h3 {
        font-size: 28px;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 16px;
        background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      p {
        font-size: 16px;
        color: #666;
        line-height: 1.8;
        margin: 0;
      }
    }

    .card-decoration {
      position: absolute;
      bottom: -20px;
      right: -20px;
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, rgba(15, 76, 129, 0.05) 0%, rgba(106, 90, 205, 0.05) 100%);
      border-radius: 50%;
      transition: all 0.4s;
      opacity: 0.2;
    }
  }

  .values-section {
    .values-header {
      text-align: center;
      margin-bottom: 60px;

      .values-title {
        font-size: 36px;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 12px;
      }

      .values-subtitle {
        font-size: 16px;
        color: #666;
      }
    }
  }

  .values-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 28px;
  }

  .value-item {
    text-align: center;
    padding: 40px 28px;
    background: #fff;
    border-radius: 20px;
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
      transform: scaleX(0);
      transition: transform 0.4s;
    }

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 16px 40px rgba(15, 76, 129, 0.15);

      &::before {
        transform: scaleX(1);
      }

      .value-icon-wrapper {
        transform: scale(1.15) rotate(-10deg);
        background: linear-gradient(135deg, #1a5f9e 0%, #7B68EE 100%);
      }

      .value-number {
        opacity: 0.3;
        transform: scale(1.2);
      }
    }

    .value-icon-wrapper {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      margin: 0 auto 24px;
      transition: all 0.4s;
      box-shadow: 0 6px 20px rgba(15, 76, 129, 0.25);
    }

    h4 {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 12px;
    }

    p {
      font-size: 14px;
      color: #666;
      line-height: 1.7;
      margin: 0;
    }

    .value-number {
      position: absolute;
      bottom: 20px;
      right: 20px;
      font-size: 48px;
      font-weight: 800;
      color: rgba(15, 76, 129, 0.08);
      transition: all 0.4s;
      opacity: 0.2;
    }
  }
}

// 联系我们区域
.contact-section {
  padding: 100px 0;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);

  .contact-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: start;
  }

  .contact-info {
    .contact-info-header {
      margin-bottom: 40px;

      h3 {
        font-size: 32px;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 12px;
      }

      p {
        font-size: 16px;
        color: #666;
        margin: 0;
      }
    }
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 48px;
  }

  .info-item {
    display: flex;
    gap: 20px;
    padding: 28px;
    background: #fff;
    border-radius: 20px;
    border: 2px solid transparent;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
      transform: scaleY(0);
      transition: transform 0.4s;
    }

    &:hover {
      transform: translateX(8px);
      box-shadow: 0 8px 24px rgba(15, 76, 129, 0.12);
      border-color: rgba(15, 76, 129, 0.1);

      &::before {
        transform: scaleY(1);
      }

      .info-icon {
        transform: scale(1.1) rotate(-5deg);
        background: linear-gradient(135deg, #1a5f9e 0%, #7B68EE 100%);
      }
    }

    .info-icon {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
      transition: all 0.4s;
      box-shadow: 0 6px 20px rgba(15, 76, 129, 0.25);
    }

    .info-content {
      flex: 1;

      h4 {
        font-size: 18px;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0 0 8px 0;
      }

      p {
        margin: 0;
        font-size: 15px;
        color: #666;
        line-height: 1.6;
      }
    }
  }

  .social-links {
    h4 {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 20px;
    }
  }

  .social-icons {
    display: flex;
    gap: 16px;

    .social-btn {
      width: 56px;
      height: 56px;
      background: #fff;
      border: 2px solid rgba(15, 76, 129, 0.2);
      transition: all 0.3s;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);

      &:hover {
        background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
        border-color: transparent;
        color: #fff;
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(15, 76, 129, 0.3);
      }
    }
  }

  .contact-form-wrapper {
    background: #fff;
    padding: 48px;
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(15, 76, 129, 0.1);
    border: 2px solid rgba(15, 76, 129, 0.08);
    transition: all 0.4s;

    &:hover {
      box-shadow: 0 12px 48px rgba(15, 76, 129, 0.15);
      border-color: rgba(15, 76, 129, 0.15);
    }

    .form-header {
      margin-bottom: 36px;

      h3 {
        font-size: 28px;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 8px;
        background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      p {
        font-size: 14px;
        color: #666;
        margin: 0;
      }
    }
  }

  .contact-form {
    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    :deep(.el-form-item__label) {
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 8px;
    }

    :deep(.el-input__wrapper) {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 12px rgba(15, 76, 129, 0.1);
      }

      &.is-focus {
        box-shadow: 0 4px 16px rgba(15, 76, 129, 0.2);
      }
    }

    :deep(.el-textarea__inner) {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 12px rgba(15, 76, 129, 0.1);
      }

      &:focus {
        box-shadow: 0 4px 16px rgba(15, 76, 129, 0.2);
      }
    }

    .submit-button {
      width: 100%;
      height: 52px;
      font-size: 16px;
      font-weight: 700;
      border-radius: 12px;
      background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
      border: none;
      margin-top: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: linear-gradient(135deg, #1a5f9e 0%, #7B68EE 100%);
        transform: translateY(-3px);
        box-shadow: 0 8px 24px rgba(15, 76, 129, 0.4);

        .el-icon {
          transform: translateX(4px);
        }
      }

      .el-icon {
        transition: transform 0.3s;
      }
    }
  }
}

// 页脚
.landing-footer {
  background: #1a1a1a;
  color: #fff;
  padding: 60px 0 20px;

  .footer-content {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
  }

  .footer-section {
    .footer-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      color: #fff;
      transition: all 0.3s;

      &:hover {
        color: #6A5ACD;
        transform: translateY(-1px);
      }

      .logo-icon {
        width: 28px;
        height: 28px;
        object-fit: contain;
      }
    }

    .footer-description {
      color: #999;
      line-height: 1.6;
    }

    .footer-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin-bottom: 12px;

        a {
          color: #999;
          text-decoration: none;
          transition: color 0.3s;

          &:hover {
            color: #fff;
          }
        }
      }
    }
  }

  .footer-bottom {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: #999;
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .hero-content {
    gap: 40px;
  }

  .hero-main .hero-title {
    font-size: 48px;
  }

  .hero-features {
    grid-template-columns: 1fr;
  }

  .hero-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .features-grid,
  .features-grid-two,
  .pricing-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .services-visual {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-content {
    grid-template-columns: 1fr;
  }

  .values-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .about-main-cards {
    grid-template-columns: 1fr;
  }

  .contact-content {
    grid-template-columns: 1fr;
  }

  .footer-content {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }

  .hero-main .hero-title {
    font-size: 36px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .hero-actions {
    flex-direction: column;

    .cta-button,
    .demo-button {
      width: 100%;
    }
  }

  .hero-features {
    grid-template-columns: 1fr;
  }

  .hero-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .features-grid,
  .features-grid-two,
  .pricing-grid,
  .services-visual,
  .values-grid {
    grid-template-columns: 1fr;
  }

  .about-main-cards {
    grid-template-columns: 1fr;
  }

  .contact-content {
    grid-template-columns: 1fr;
  }

  .contact-form .form-row {
    grid-template-columns: 1fr;
  }

  .hero-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    .stat-number {
      font-size: 24px;
    }

    .stat-label {
      font-size: 12px;
    }
  }

  .about-content {
    grid-template-columns: 1fr;
  }

  .footer-content {
    grid-template-columns: 1fr;
  }
}
</style>
