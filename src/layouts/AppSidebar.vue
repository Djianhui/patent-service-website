<template>
  <aside class="app-sidebar" :class="{ collapsed }">
    <el-menu :default-active="activeMenuId" :collapse="collapsed" :unique-opened="true" mode="vertical" router
      @select="handleMenuSelect">
      <template v-for="item in menuItems" :key="item.id">
        <!-- 有子菜单的项 -->
        <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.id">
          <template #title>
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.title }}</span>
          </template>

          <el-menu-item v-for="child in item.children" :key="child.id" :index="child.path">
            {{ child.title }}
          </el-menu-item>
        </el-sub-menu>

        <!-- 无子菜单的项 -->
        <el-menu-item v-else :index="item.path">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </template>
    </el-menu>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// Props
interface MenuItem {
  id: string
  title: string
  icon: string
  path: string
  children?: Array<{
    id: string
    title: string
    path: string
  }>
}

interface Props {
  collapsed?: boolean
  menuItems: MenuItem[]
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false
})

// Emits
const emit = defineEmits<{
  'menu-select': [path: string]
}>()

// Composables
const route = useRoute()

// 计算属性
const activeMenuId = computed(() => {
  const currentPath = route.path

  // 查找匹配的菜单项
  for (const item of props.menuItems) {
    if (item.path === currentPath) {
      return item.path
    }

    if (item.children) {
      for (const child of item.children) {
        if (child.path === currentPath) {
          return child.path
        }
      }
    }
  }

  return currentPath
})

// 方法
const handleMenuSelect = (path: string) => {
  emit('menu-select', path)
}
</script>

<style scoped lang="scss">
.app-sidebar {
  width: 240px;
  height: calc(100vh - 64px);
  background-color: var(--color-bg-primary);
  box-shadow: var(--shadow-light);
  transition: width var(--transition-base);
  overflow: hidden;

  &.collapsed {
    width: 64px;
  }

  :deep(.el-menu) {
    border-right: none;
    height: 100%;
    overflow-y: auto;

    .el-menu-item {
      height: 48px;
      line-height: 48px;
      margin: var(--spacing-xs) var(--spacing-sm);
      border-radius: 8px;
      color: var(--color-text-primary);
      font-weight: var(--font-weight-medium);

      &:hover {
        background-color: var(--color-bg-tertiary);
        color: var(--color-primary);
      }

      &.is-active {
        background: var(--color-primary-gradient);
        color: white;

        &::before {
          display: none;
        }
      }

      .el-icon {
        margin-right: var(--spacing-sm);
        font-size: 18px;
      }
    }

    .el-sub-menu {
      .el-sub-menu__title {
        height: 48px;
        line-height: 48px;
        margin: var(--spacing-xs) var(--spacing-sm);
        border-radius: 8px;
        color: var(--color-text-primary);
        font-weight: var(--font-weight-medium);

        &:hover {
          background-color: var(--color-bg-tertiary);
          color: var(--color-primary);
        }

        .el-icon {
          margin-right: var(--spacing-sm);
          font-size: 18px;
        }

        .el-sub-menu__icon-arrow {
          margin-top: -3px;
        }
      }

      .el-menu {
        background-color: var(--color-bg-secondary);

        .el-menu-item {
          margin: var(--spacing-xs) var(--spacing-md);
          padding-left: calc(var(--spacing-lg) + 18px + var(--spacing-sm)) !important;

          &:hover {
            background-color: var(--color-bg-tertiary);
          }

          &.is-active {
            background: var(--color-primary-gradient);
            color: white;
          }
        }
      }
    }

    // 折叠状态下的样式
    &.el-menu--collapse {

      .el-menu-item,
      .el-sub-menu .el-sub-menu__title {
        margin: var(--spacing-xs);
        text-align: center;

        .el-icon {
          margin-right: 0;
        }
      }
    }
  }

  // 滚动条样式
  :deep(.el-menu::-webkit-scrollbar) {
    width: 4px;
  }

  :deep(.el-menu::-webkit-scrollbar-track) {
    background: transparent;
  }

  :deep(.el-menu::-webkit-scrollbar-thumb) {
    background: var(--color-border-base);
    border-radius: 2px;

    &:hover {
      background: var(--color-border-dark);
    }
  }
}

@media (max-width: 768px) {
  .app-sidebar {
    position: fixed;
    left: 0;
    top: 64px;
    z-index: var(--z-index-fixed);
    transform: translateX(-100%);
    transition: transform var(--transition-base);

    &:not(.collapsed) {
      transform: translateX(0);
    }
  }
}
</style>
