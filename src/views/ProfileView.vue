<template>
  <div class="profile-container">
    <div class="page-header">
      <h1 class="page-title">用户中心</h1>
    </div>
    
    <el-card>
      <div class="profile-content">
        <h3>个人信息</h3>
        <p>用户中心功能开发中...</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 用户中心页面
</script>

<style scoped lang="scss">
.profile-container {
  .page-header {
    margin-bottom: var(--spacing-lg);

    .page-title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0;
    }
  }

  .profile-content {
    padding: var(--spacing-lg);
  }
}
</style>