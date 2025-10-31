import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'
import ruRU from './locales/ru-RU'
import frFR from './locales/fr-FR'
import deDE from './locales/de-DE'
import jaJP from './locales/ja-JP'
import arSA from './locales/ar-SA'

// 类型声明
export type MessageSchema = typeof zhCN

// 支持的语言列表
export const SUPPORT_LOCALES = [
  'zh-CN',
  'en-US',
  'ru-RU',
  'fr-FR',
  'de-DE',
  'ja-JP',
  'ar-SA',
] as const
export type SupportLocale = (typeof SUPPORT_LOCALES)[number]

// 从本地存储获取保存的语言设置，默认为英文
const getDefaultLocale = (): SupportLocale => {
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale && SUPPORT_LOCALES.includes(savedLocale as SupportLocale)) {
    return savedLocale as SupportLocale
  }
  return 'en-US'
}

// 创建 i18n 实例
const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getDefaultLocale(), // 默认语言
  fallbackLocale: 'en-US', // 回退语言
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
    'ru-RU': ruRU,
    'fr-FR': frFR,
    'de-DE': deDE,
    'ja-JP': jaJP,
    'ar-SA': arSA,
  },
  globalInjection: true, // 全局注入 $t 函数
})

/**
 * 切换语言
 * @param locale 语言代码
 */
export function setLocale(locale: SupportLocale) {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)

  // 更新 HTML lang 属性
  document.querySelector('html')?.setAttribute('lang', locale)
}

/**
 * 获取当前语言
 */
export function getLocale(): SupportLocale {
  return i18n.global.locale.value
}

/**
 * 获取语言显示名称
 */
export function getLocaleName(locale: SupportLocale): string {
  const names: Record<SupportLocale, string> = {
    'zh-CN': '简体中文',
    'en-US': 'English',
    'ru-RU': 'Русский',
    'fr-FR': 'Français',
    'de-DE': 'Deutsch',
    'ja-JP': '日本語',
    'ar-SA': 'العربية',
  }
  return names[locale]
}

export default i18n
