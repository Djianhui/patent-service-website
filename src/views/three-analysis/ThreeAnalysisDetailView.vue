<template>
  <div class="three-analysis-detail-container">
    <el-result icon="info" title="功能开发中" sub-title="三性分析详情页面正在开发中，敬请期待">
      <template #extra>
        <el-button type="primary" @click="$router.back()">返回</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
// 占位组件
</script>

<style scoped lang="scss">
.three-analysis-detail-container {
  padding: var(--spacing-xl);
}
</style>
