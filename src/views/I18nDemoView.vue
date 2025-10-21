<template>
  <div class="i18n-demo-container">
    <el-card>
      <template #header>
        <h2>{{ $t('common.info') }}: Vue I18n 多语言演示</h2>
      </template>

      <el-space direction="vertical" size="large" :fill="true">
        <!-- 基础用法 -->
        <el-card>
          <template #header>
            <h3>1. 基础翻译</h3>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="$t('common.confirm')">
              {{ $t('common.confirm') }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('common.cancel')">
              {{ $t('common.cancel') }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('common.save')">
              {{ $t('common.save') }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('common.delete')">
              {{ $t('common.delete') }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 菜单翻译 -->
        <el-card>
          <template #header>
            <h3>2. 菜单翻译</h3>
          </template>
          <el-menu :default-active="'1'" mode="horizontal">
            <el-menu-item index="1">{{ $t('menu.home') }}</el-menu-item>
            <el-menu-item index="2">{{ $t('menu.dashboard') }}</el-menu-item>
            <el-menu-item index="3">{{ $t('menu.patentSearch') }}</el-menu-item>
            <el-menu-item index="4">{{ $t('menu.techReport') }}</el-menu-item>
          </el-menu>
        </el-card>

        <!-- 表单翻译 -->
        <el-card>
          <template #header>
            <h3>3. 表单翻译</h3>
          </template>
          <el-form :model="form" label-width="120px">
            <el-form-item :label="$t('auth.username')">
              <el-input v-model="form.username" :placeholder="$t('auth.pleaseEnterUsername')" />
            </el-form-item>
            <el-form-item :label="$t('auth.password')">
              <el-input v-model="form.password" type="password" :placeholder="$t('auth.pleaseEnterPassword')" />
            </el-form-item>
            <el-form-item :label="$t('auth.email')">
              <el-input v-model="form.email" :placeholder="$t('auth.pleaseEnterEmail')" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary">{{ $t('common.submit') }}</el-button>
              <el-button>{{ $t('common.reset') }}</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 专利检索相关 -->
        <el-card>
          <template #header>
            <h3>4. 专利检索翻译</h3>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item :label="$t('patentSearch.patentTitle')">
              {{ $t('patentSearch.pleaseEnterTitle') }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('patentSearch.technicalSolution')">
              {{ $t('patentSearch.pleaseEnterSolution') }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag>{{ $t('patentSearch.completed') }}</el-tag>
              <el-tag type="warning">{{ $t('patentSearch.generating') }}</el-tag>
              <el-tag type="danger">{{ $t('patentSearch.failed') }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 在脚本中使用 -->
        <el-card>
          <template #header>
            <h3>5. 脚本中使用 (useI18n)</h3>
          </template>
          <el-button @click="showMessage">{{ $t('common.info') }}</el-button>
          <p>当前语言: {{ currentLocale }}</p>
        </el-card>

        <!-- 使用说明 -->
        <el-card>
          <template #header>
            <h3>使用说明</h3>
          </template>
          <el-alert type="info" :closable="false">
            <template #title>
              <div style="line-height: 1.8">
                <p><strong>1. 模板中使用：</strong></p>
                <code>{{ '{{ $t("common.confirm") }}' }}</code>
                <br><br>
                <p><strong>2. 脚本中使用：</strong></p>
                <code>const { t, locale } = useI18n()</code><br>
                <code>{{ 't("common.confirm")' }}</code>
                <br><br>
                <p><strong>3. 切换语言：</strong></p>
                <code>setLocale('zh-CN')</code> 或 <code>setLocale('en-US')</code>
                <br><br>
                <p><strong>4. 添加新翻译：</strong></p>
                编辑 <code>src/i18n/locales/zh-CN.ts</code> 和 <code>src/i18n/locales/en-US.ts</code>
              </div>
            </template>
          </el-alert>
        </el-card>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const { t, locale } = useI18n()

const form = ref({
  username: '',
  password: '',
  email: ''
})

const currentLocale = ref(locale.value)

const showMessage = () => {
  ElMessage({
    message: t('common.success'),
    type: 'success'
  })
}
</script>

<style scoped lang="scss">
.i18n-demo-container {
  padding: var(--spacing-lg);

  h2 {
    margin: 0;
    color: var(--color-primary);
  }

  h3 {
    margin: 0;
    color: var(--color-text-primary);
  }

  code {
    background-color: var(--color-bg-tertiary);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    color: var(--color-error);
  }
}
</style>
