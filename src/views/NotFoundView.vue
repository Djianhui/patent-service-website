<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-illustration">
        <div class="error-code">404</div>
        <div class="error-icon">
          <el-icon><Warning /></el-icon>
        </div>
      </div>
      
      <div class="error-info">
        <h2 class="error-title">页面不存在</h2>
        <p class="error-description">
          抱歉，您访问的页面不存在或已被移除
        </p>
        
        <div class="error-actions">
          <el-button type="primary" @click="$router.push('/app/dashboard')">
            返回首页
          </el-button>
          <el-button @click="$router.go(-1)">
            返回上页
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Warning } from '@element-plus/icons-vue'
</script>

<style scoped lang="scss">
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-secondary);
}

.not-found-content {
  text-align: center;
  max-width: 500px;
  padding: var(--spacing-2xl);

  .error-illustration {
    margin-bottom: var(--spacing-2xl);
    position: relative;

    .error-code {
      font-size: 120px;
      font-weight: var(--font-weight-bold);
      color: var(--color-primary);
      line-height: 1;
      margin-bottom: var(--spacing-md);
    }

    .error-icon {
      font-size: 64px;
      color: var(--color-warning);
    }
  }

  .error-info {
    .error-title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-md);
    }

    .error-description {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
      margin-bottom: var(--spacing-2xl);
      line-height: var(--line-height-relaxed);
    }

    .error-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: center;
      
      @media (max-width: 480px) {
        flex-direction: column;
      }
    }
  }
}
</style>