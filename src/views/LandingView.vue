<template>
  <div class="landing-page">
    <!-- 顶部导航栏 -->
    <header class="landing-header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <img src="/favicon.ico" class="logo-icon" alt="Logo" />
            <span class="logo-text">{{ $t('landing.brand') }}</span>
          </div>
          <nav class="nav-menu">
            <a href="#features" class="nav-link">{{ $t('landing.nav.features') }}</a>
            <a href="#pricing" class="nav-link">{{ $t('landing.nav.pricing') }}</a>
            <a href="#about" class="nav-link">{{ $t('landing.nav.about') }}</a>
            <a href="#contact" class="nav-link">{{ $t('landing.nav.contact') }}</a>
          </nav>
          <div class="header-actions">
            <el-dropdown trigger="click" @command="handleLanguageChange">
              <el-button text class="language-btn">
                <span :class="`fi fi-${getFlagCode(locale)}`" class="flag-icon-round"></span>
                <span>{{ currentLanguageLabel }}</span>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="zh-CN">
                    <span class="fi fi-cn flag-icon-round"></span>
                    <span>简体中文</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="en-US">
                    <span class="fi fi-us flag-icon-round"></span>
                    <span>English</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="ja-JP">
                    <span class="fi fi-jp flag-icon-round"></span>
                    <span>日本語</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="de-DE">
                    <span class="fi fi-de flag-icon-round"></span>
                    <span>Deutsch</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="fr-FR">
                    <span class="fi fi-fr flag-icon-round"></span>
                    <span>Français</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="ru-RU">
                    <span class="fi fi-ru flag-icon-round"></span>
                    <span>Русский</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="ar-SA">
                    <span class="fi fi-sa flag-icon-round"></span>
                    <span>العربية</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button text class="login-btn" @click="goToLogin">
              {{ $t('auth.login') }}
            </el-button>
            <el-button type="primary" class="register-btn" @click="goToRegister">
              {{ $t('auth.register') }}
            </el-button>
          </div>
        </div>
      </div>
    </header>

    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">{{ $t('landing.hero.title') }}</h1>
            <p class="hero-subtitle">{{ $t('landing.hero.subtitle') }}</p>
            <div class="hero-actions">
              <el-button type="primary" size="large" class="cta-button" @click="goToRegister">
                {{ $t('landing.hero.getStarted') }}
                <el-icon class="ml-1">
                  <ArrowRight />
                </el-icon>
              </el-button>
              <el-button size="large" class="demo-button" @click="goToLogin">
                {{ $t('landing.hero.viewDemo') }}
              </el-button>
            </div>
            <div class="hero-stats">
              <div class="stat-item">
                <div class="stat-number">10K+</div>
                <div class="stat-label">{{ $t('landing.hero.stats.users') }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">50K+</div>
                <div class="stat-label">{{ $t('landing.hero.stats.patents') }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">98%</div>
                <div class="stat-label">{{ $t('landing.hero.stats.satisfaction') }}</div>
              </div>
            </div>
          </div>
          <div class="hero-image">
            <div class="hero-visual">
              <div class="visual-card visual-card-1">
                <div class="card-content">
                  <el-icon class="card-icon">
                    <Document />
                  </el-icon>
                  <div class="card-text">
                    <h4>{{ $t('landing.hero.floatingCards.techReport') }}</h4>
                    <p>AI智能分析</p>
                  </div>
                </div>
              </div>
              <div class="visual-card visual-card-2">
                <div class="card-content">
                  <el-icon class="card-icon">
                    <Search />
                  </el-icon>
                  <div class="card-text">
                    <h4>{{ $t('landing.hero.floatingCards.patentSearch') }}</h4>
                    <p>全球专利数据库</p>
                  </div>
                </div>
              </div>
              <div class="visual-card visual-card-3">
                <div class="card-content">
                  <el-icon class="card-icon">
                    <Edit />
                  </el-icon>
                  <div class="card-text">
                    <h4>{{ $t('landing.hero.floatingCards.patentDraft') }}</h4>
                    <p>专业文档生成</p>
                  </div>
                </div>
              </div>
              <div class="center-circle">
                <div class="circle-inner">
                  <el-icon :size="48">
                    <Star />
                  </el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 特色服务区域 -->
    <section class="services-showcase">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ $t('landing.services.title') }}</h2>
          <p class="section-subtitle">{{ $t('landing.services.subtitle') }}</p>
        </div>
        <el-carousel :interval="3000" arrow="never" indicator-position="none" height="350px" class="services-carousel"
          @change="handleCarouselChange">
          <el-carousel-item v-for="(group, index) in serviceGroups" :key="index">
            <div class="services-visual">
              <div class="service-image-card" v-for="(service, idx) in group" :key="idx">
                <div class="image-placeholder" :style="{ background: service.gradient }">
                  <el-icon :size="64" style="color: white;">
                    <component :is="service.icon" />
                  </el-icon>
                </div>
                <h3>{{ $t(service.titleKey) }}</h3>
                <p>{{ $t(service.descriptionKey) }}</p>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
        <!-- 自定义指示器 -->
        <div class="carousel-indicators">
          <span v-for="(group, index) in serviceGroups" :key="index" class="indicator-dot"
            :class="{ active: currentSlide === index }" @click="goToSlide(index)"></span>
        </div>
      </div>
    </section>

    <!-- 功能特性区域 -->
    <section id="features" class="features-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ $t('landing.features.title') }}</h2>
          <p class="section-subtitle">{{ $t('landing.features.subtitle') }}</p>
        </div>
        <div class="features-grid">
          <div class="feature-card" v-for="(feature, index) in features" :key="index">
            <div class="feature-icon" :style="{ background: feature.color }">
              <el-icon :size="32">
                <component :is="feature.icon" />
              </el-icon>
            </div>
            <h3 class="feature-title">{{ $t(feature.titleKey) }}</h3>
            <p class="feature-description">{{ $t(feature.descKey) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 数据可视化展示区域 -->
    <section class="stats-visual-section">
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
                  <h3>5000万+</h3>
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
                  <h3>10万+</h3>
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
              <div class="mockup-screen" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div class="screen-content">
                  <img src="/0001.png" alt="Data Analysis" style="width: 530px; height: 400px; object-fit: cover;" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 价格方案区域 -->
    <section id="pricing" class="pricing-section">
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
    </section>

    <!-- 关于我们区域 -->
    <section id="about" class="about-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ $t('landing.about.title') }}</h2>
          <p class="section-subtitle">{{ $t('landing.about.subtitle') }}</p>
        </div>
        <div class="about-content">
          <div class="about-card">
            <div class="about-icon">
              <el-icon :size="48">
                <Star />
              </el-icon>
            </div>
            <h3>{{ $t('landing.about.mission.title') }}</h3>
            <p>{{ $t('landing.about.mission.content') }}</p>
          </div>
          <div class="about-card">
            <div class="about-icon">
              <el-icon :size="48">
                <DataAnalysis />
              </el-icon>
            </div>
            <h3>{{ $t('landing.about.vision.title') }}</h3>
            <p>{{ $t('landing.about.vision.content') }}</p>
          </div>
        </div>
        <div class="values-section">
          <h3 class="values-title">{{ $t('landing.about.values.title') }}</h3>
          <div class="values-grid">
            <div class="value-item">
              <el-icon :size="32" class="value-icon">
                <Star />
              </el-icon>
              <h4>{{ $t('landing.about.values.innovation') }}</h4>
              <p>{{ $t('landing.about.values.innovationDesc') }}</p>
            </div>
            <div class="value-item">
              <el-icon :size="32" class="value-icon">
                <Document />
              </el-icon>
              <h4>{{ $t('landing.about.values.professional') }}</h4>
              <p>{{ $t('landing.about.values.professionalDesc') }}</p>
            </div>
            <div class="value-item">
              <el-icon :size="32" class="value-icon">
                <DataAnalysis />
              </el-icon>
              <h4>{{ $t('landing.about.values.efficiency') }}</h4>
              <p>{{ $t('landing.about.values.efficiencyDesc') }}</p>
            </div>
            <div class="value-item">
              <el-icon :size="32" class="value-icon">
                <Check />
              </el-icon>
              <h4>{{ $t('landing.about.values.integrity') }}</h4>
              <p>{{ $t('landing.about.values.integrityDesc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系我们区域 -->
    <section id="contact" class="contact-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ $t('landing.contact.title') }}</h2>
          <p class="section-subtitle">{{ $t('landing.contact.subtitle') }}</p>
        </div>
        <div class="contact-content">
          <div class="contact-info">
            <h3>{{ $t('landing.contact.info.title') }}</h3>
            <div class="info-list">
              <div class="info-item">
                <el-icon :size="24">
                  <More />
                </el-icon>
                <div>
                  <h4>{{ $t('landing.contact.info.address') }}</h4>
                  <p>{{ $t('landing.contact.info.addressContent') }}</p>
                </div>
              </div>
              <div class="info-item">
                <el-icon :size="24">
                  <Document />
                </el-icon>
                <div>
                  <h4>{{ $t('landing.contact.info.email') }}</h4>
                  <p>{{ $t('landing.contact.info.emailContent') }}</p>
                </div>
              </div>
              <div class="info-item">
                <el-icon :size="24">
                  <More />
                </el-icon>
                <div>
                  <h4>{{ $t('landing.contact.info.phone') }}</h4>
                  <p>{{ $t('landing.contact.info.phoneContent') }}</p>
                </div>
              </div>
              <div class="info-item">
                <el-icon :size="24">
                  <DataAnalysis />
                </el-icon>
                <div>
                  <h4>{{ $t('landing.contact.info.hours') }}</h4>
                  <p>{{ $t('landing.contact.info.hoursContent') }}</p>
                </div>
              </div>
            </div>
            <div class="social-links">
              <h4>{{ $t('landing.contact.social.title') }}</h4>
              <div class="social-icons">
                <el-button circle><el-icon>
                    <More />
                  </el-icon></el-button>
                <el-button circle><el-icon>
                    <Star />
                  </el-icon></el-button>
                <el-button circle><el-icon>
                    <Document />
                  </el-icon></el-button>
              </div>
            </div>
          </div>
          <div class="contact-form-wrapper">
            <h3>{{ $t('landing.contact.form.title') }}</h3>
            <el-form class="contact-form" label-position="top">
              <el-form-item :label="$t('landing.contact.form.name')">
                <el-input :placeholder="$t('landing.contact.form.namePlaceholder')" />
              </el-form-item>
              <el-form-item :label="$t('landing.contact.form.email')">
                <el-input type="email" :placeholder="$t('landing.contact.form.emailPlaceholder')" />
              </el-form-item>
              <el-form-item :label="$t('landing.contact.form.subject')">
                <el-input :placeholder="$t('landing.contact.form.subjectPlaceholder')" />
              </el-form-item>
              <el-form-item :label="$t('landing.contact.form.message')">
                <el-input type="textarea" :rows="4" :placeholder="$t('landing.contact.form.messagePlaceholder')" />
              </el-form-item>
              <el-button type="primary" size="large" class="submit-button">
                {{ $t('landing.contact.form.submit') }}
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
            <div class="footer-logo">
              <img src="/favicon.ico" class="logo-icon" alt="Logo" />
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
} from '@element-plus/icons-vue'

const router = useRouter()
const { locale, t } = useI18n()

// 当前轮播索引
const currentSlide = ref(0)

// 服务数据
const allServices = [
  {
    icon: markRaw(DataAnalysis),
    titleKey: 'landing.services.intelligentAnalysis.title',
    descriptionKey: 'landing.services.intelligentAnalysis.description',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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

const features = [
  {
    icon: markRaw(Document),
    titleKey: 'landing.features.items.techReport.title',
    descKey: 'landing.features.items.techReport.desc',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  z-index: 1000;
  padding: 16px 0;

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;

    .logo-icon {
      width: 28px;
      height: 28px;
      object-fit: contain;
    }
  }

  .nav-menu {
    display: flex;
    gap: 32px;

    .nav-link {
      color: #666;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s;

      &:hover {
        color: #409eff;
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;

    .language-btn {
      font-size: 14px;
      color: #666;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .flag-icon-round {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      overflow: hidden;
      display: inline-block;
      background-size: cover;
      background-position: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      flex-shrink: 0;
    }

    :deep(.el-dropdown-menu__item) {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
    }

    .login-btn {
      color: #1a1a1a;
      font-weight: 500;
    }

    .register-btn {
      padding: 8px 24px;
      border-radius: 8px;
      font-weight: 500;
    }
  }
}

// 英雄区域
.hero-section {
  padding: 140px 0 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.3;
  }

  .hero-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .hero-text {
    color: #fff;
  }

  .hero-title {
    font-size: 56px;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 24px;
    background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0.8));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-subtitle {
    font-size: 20px;
    line-height: 1.6;
    margin-bottom: 40px;
    opacity: 0.9;
  }

  .hero-actions {
    display: flex;
    gap: 16px;
    margin-bottom: 60px;

    .cta-button {
      padding: 12px 32px;
      font-size: 16px;
      border-radius: 12px;
      background: #fff;
      color: #667eea;
      border: none;

      &:hover {
        background: rgba(255, 255, 255, 0.95);
        transform: translateY(-2px);
      }
    }

    .demo-button {
      padding: 12px 32px;
      font-size: 16px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: #fff;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.5);
      }
    }

    .ml-1 {
      margin-left: 8px;
    }
  }

  .hero-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;

    .stat-item {
      .stat-number {
        font-size: 36px;
        font-weight: 700;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        opacity: 0.8;
      }
    }
  }

  .hero-image {
    position: relative;
    height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;

    .hero-visual {
      position: relative;
      width: 500px;
      height: 500px;

      .center-circle {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 150px;
        height: 150px;
        background: white;
        border-radius: 50%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;

        .circle-inner {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          animation: rotate 20s linear infinite;
        }
      }

      .visual-card {
        position: absolute;
        background: white;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        animation: float 4s ease-in-out infinite;
        z-index: 1;

        .card-content {
          display: flex;
          align-items: center;
          gap: 16px;

          .card-icon {
            font-size: 32px;
            color: #667eea;
            background: rgba(102, 126, 234, 0.1);
            width: 56px;
            height: 56px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .card-text {
            h4 {
              margin: 0 0 4px 0;
              font-size: 16px;
              font-weight: 600;
              color: #1a1a1a;
            }

            p {
              margin: 0;
              font-size: 13px;
              color: #666;
            }
          }
        }

        &.visual-card-1 {
          top: 0;
          left: 0;
          animation-delay: 0s;
        }

        &.visual-card-2 {
          top: 0;
          right: 0;
          animation-delay: 1.3s;
        }

        &.visual-card-3 {
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          animation-delay: 2.6s;
        }
      }
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
    opacity: 0.5;
  }

  50% {
    transform: scale(1.1);
    opacity: 0.3;
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
        background: #667eea;
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  background: #f8f9fa;
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

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.feature-card {
  background: #fff;
  padding: 40px 32px;
  border-radius: 16px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  }

  .feature-icon {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    color: #fff;
  }

  .feature-title {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 12px;
  }

  .feature-description {
    font-size: 15px;
    color: #666;
    line-height: 1.6;
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
    border-color: #667eea;
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.15);
  }

  &.popular {
    border-color: #667eea;
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.15);
    transform: scale(1.05);
  }

  .popular-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    border-radius: 8px;
    font-weight: 500;
  }
}

// CTA 区域
.cta-section {
  padding: 100px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    padding: 12px 40px;
    font-size: 16px;
    border-radius: 12px;
    background: #fff;
    color: #667eea;
    border: none;

    &:hover {
      background: rgba(255, 255, 255, 0.95);
      transform: translateY(-2px);
    }

    .ml-1 {
      margin-left: 8px;
    }
  }
}

// 关于我们区域
.about-section {
  padding: 100px 0;
  background: white;

  .about-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
    margin-bottom: 60px;
  }

  .about-card {
    background: #f8f9fa;
    padding: 40px;
    border-radius: 16px;
    text-align: center;

    .about-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      color: white;
    }

    h3 {
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 16px;
    }

    p {
      font-size: 15px;
      color: #666;
      line-height: 1.8;
    }
  }

  .values-section {
    .values-title {
      font-size: 32px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 40px;
      color: #1a1a1a;
    }
  }

  .values-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 32px;
  }

  .value-item {
    text-align: center;
    padding: 32px 24px;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    transition: all 0.3s;

    &:hover {
      border-color: #667eea;
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.1);
    }

    .value-icon {
      color: #667eea;
      margin-bottom: 16px;
    }

    h4 {
      font-size: 18px;
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
}

// 联系我们区域
.contact-section {
  padding: 100px 0;
  background: #f8f9fa;

  .contact-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
  }

  .contact-info {
    h3 {
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 32px;
    }
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 40px;
  }

  .info-item {
    display: flex;
    gap: 16px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .el-icon {
      color: #667eea;
      flex-shrink: 0;
    }

    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 4px 0;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
  }

  .social-links {
    h4 {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 16px;
    }
  }

  .social-icons {
    display: flex;
    gap: 12px;

    .el-button {
      width: 48px;
      height: 48px;
      background: white;
      border: 2px solid #e5e7eb;

      &:hover {
        background: #667eea;
        border-color: #667eea;
        color: white;
      }
    }
  }

  .contact-form-wrapper {
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

    h3 {
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 32px;
    }
  }

  .contact-form {
    .submit-button {
      width: 100%;
      height: 48px;
      font-size: 16px;
      font-weight: 500;
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
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .hero-image {
    display: none;
  }

  .features-grid,
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

  .hero-title {
    font-size: 36px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .features-grid,
  .pricing-grid,
  .services-visual,
  .values-grid {
    grid-template-columns: 1fr;
  }

  .footer-content {
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
}
</style>
