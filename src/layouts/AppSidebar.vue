<template>
  <aside class="app-sidebar" :class="{ collapsed }">
    <!-- 侧边栏顶部装饰 -->
    <div class="sidebar-header">
      <div class="header-decoration"></div>
    </div>

    <el-menu :default-active="activeMenuId" :collapse="collapsed" :unique-opened="true" mode="vertical" router
      @select="handleMenuSelect">
      <template v-for="item in menuItems" :key="item.id">
        <!-- 有子菜单的项 -->
        <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.id">
          <template #title>
            <div class="menu-icon-wrapper">
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
            </div>
            <span class="menu-title">{{ item.title }}</span>
          </template>

          <el-menu-item v-for="child in item.children" :key="child.id" :index="child.path">
            <span class="submenu-dot"></span>
            <span class="submenu-title">{{ child.title }}</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 无子菜单的项 -->
        <el-menu-item v-else :index="item.path">
          <div class="menu-icon-wrapper">
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
          </div>
          <template #title>
            <span class="menu-title">{{ item.title }}</span>
          </template>
        </el-menu-item>
      </template>
    </el-menu>

    <!-- 侧边栏底部装饰 -->
    <div class="sidebar-footer" v-if="!collapsed">
      <div class="footer-text">AI驱动·智能服务</div>
    </div>
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
  background: linear-gradient(180deg, #f8f9fc 0%, #f0f2f8 100%);
  border-right: 1px solid #e3e8f0;
  box-shadow: 2px 0 12px rgba(15, 76, 129, 0.08);
  transition: width var(--transition-base);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, sans-serif;

  &.collapsed {
    width: 64px;

    .sidebar-header {
      padding: 8px;
    }

    .sidebar-footer {
      opacity: 0;
    }
  }

  // 顶部装饰
  .sidebar-header {
    padding: 16px;
    transition: all 0.3s ease;

    .header-decoration {
      height: 4px;
      background: linear-gradient(90deg, #0F4C81 0%, #6A5ACD 100%);
      border-radius: 2px;
      box-shadow: 0 2px 8px rgba(15, 76, 129, 0.3);
    }
  }

  // 底部装饰
  .sidebar-footer {
    margin-top: auto;
    padding: 20px 16px;
    text-align: center;
    transition: opacity 0.3s ease;

    .footer-text {
      font-size: 12px;
      color: #6A5ACD;
      font-weight: 600;
      letter-spacing: 1px;
      background: linear-gradient(90deg, #0F4C81 0%, #6A5ACD 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  :deep(.el-menu) {
    border-right: none;
    flex: 1;
    overflow-y: auto;
    background: transparent;
    padding: 8px 0;

    .menu-icon-wrapper {
      width: 36px;
      height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: linear-gradient(135deg, #e7f0ff 0%, #d5e5ff 100%);
      margin-right: 12px;
      transition: all 0.3s ease;
      flex-shrink: 0;

      .el-icon {
        font-size: 18px;
        color: #0F4C81;
        transition: all 0.3s ease;
      }
    }

    .menu-title {
      font-size: 14px;
      font-weight: 600;
      color: #2c3e50;
      letter-spacing: 0.3px;
    }

    .el-menu-item {
      height: 52px;
      line-height: 52px;
      margin: 4px 12px;
      border-radius: 12px;
      color: var(--color-text-primary);
      font-weight: 500;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: linear-gradient(180deg, #0F4C81 0%, #6A5ACD 100%);
        transform: scaleY(0);
        transition: transform 0.3s ease;
        border-radius: 0 2px 2px 0;
      }

      &:hover {
        background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
        box-shadow: 0 4px 12px rgba(15, 76, 129, 0.12);
        transform: translateX(4px);

        .menu-icon-wrapper {
          background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
          box-shadow: 0 4px 12px rgba(15, 76, 129, 0.3);

          .el-icon {
            color: #fff;
            transform: scale(1.1);
          }
        }

        .menu-title {
          color: #0F4C81;
        }
      }

      &.is-active {
        background: linear-gradient(135deg, #0F4C81 0%, #1a5f9e 50%, #6A5ACD 100%);
        box-shadow: 0 6px 16px rgba(15, 76, 129, 0.25);
        transform: translateX(4px);

        &::before {
          transform: scaleY(1);
        }

        .menu-icon-wrapper {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

          .el-icon {
            color: #fff;
            transform: scale(1.15);
          }
        }

        .menu-title {
          color: #fff;
          font-weight: 700;
        }
      }
    }

    .el-sub-menu {
      .el-sub-menu__title {
        height: 52px;
        line-height: 52px;
        margin: 4px 12px;
        border-radius: 12px;
        color: var(--color-text-primary);
        font-weight: 500;
        transition: all 0.3s ease;
        position: relative;

        &:hover {
          background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
          box-shadow: 0 4px 12px rgba(15, 76, 129, 0.12);

          .menu-icon-wrapper {
            background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
            box-shadow: 0 4px 12px rgba(15, 76, 129, 0.3);

            .el-icon {
              color: #fff;
              transform: scale(1.1);
            }
          }

          .menu-title {
            color: #0F4C81;
          }
        }

        .el-sub-menu__icon-arrow {
          margin-top: -3px;
          color: #6A5ACD;
          font-weight: bold;
        }
      }

      &.is-active>.el-sub-menu__title {
        background: linear-gradient(135deg, #e7f0ff 0%, #d5e5ff 100%);

        .menu-title {
          color: #0F4C81;
          font-weight: 700;
        }

        .menu-icon-wrapper {
          background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);

          .el-icon {
            color: #fff;
          }
        }
      }

      .el-menu {
        background: linear-gradient(135deg, #fafbfd 0%, #f5f7fc 100%);
        border-radius: 0 0 12px 12px;
        margin: 0 12px 8px 12px;
        padding: 8px 0;
        border-left: 2px solid #d5e5ff;

        .el-menu-item {
          margin: 2px 12px;
          padding-left: 20px !important;
          height: 44px;
          line-height: 44px;
          background: transparent;
          position: relative;

          .submenu-dot {
            display: inline-block;
            width: 6px;
            height: 6px;
            background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
            border-radius: 50%;
            margin-right: 12px;
            transition: all 0.3s ease;
          }

          .submenu-title {
            font-size: 13px;
            font-weight: 500;
            color: #5a6c7d;
          }

          &:hover {
            background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
            box-shadow: 0 2px 8px rgba(15, 76, 129, 0.1);
            transform: translateX(4px);

            .submenu-dot {
              transform: scale(1.5);
              box-shadow: 0 0 8px rgba(15, 76, 129, 0.4);
            }

            .submenu-title {
              color: #0F4C81;
              font-weight: 600;
            }
          }

          &.is-active {
            background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
            box-shadow: 0 4px 12px rgba(15, 76, 129, 0.25);
            transform: translateX(4px);

            &::before {
              display: none;
            }

            .submenu-dot {
              background: #fff;
              transform: scale(1.3);
              box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
            }

            .submenu-title {
              color: #fff;
              font-weight: 700;
            }
          }
        }
      }
    }

    // 折叠状态下的样式
    &.el-menu--collapse {

      .el-menu-item,
      .el-sub-menu .el-sub-menu__title {
        margin: 4px 8px;
        text-align: center;
        padding: 0 !important;
        display: flex;
        justify-content: center;
        align-items: center;

        .menu-icon-wrapper {
          margin-right: 0;
        }
      }
    }
  }

  // 滚动条样式
  :deep(.el-menu::-webkit-scrollbar) {
    width: 6px;
  }

  :deep(.el-menu::-webkit-scrollbar-track) {
    background: transparent;
  }

  :deep(.el-menu::-webkit-scrollbar-thumb) {
    background: linear-gradient(180deg, #0F4C81 0%, #6A5ACD 100%);
    border-radius: 3px;

    &:hover {
      background: linear-gradient(180deg, #1a5f9e 0%, #7B68EE 100%);
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
    box-shadow: 4px 0 20px rgba(15, 76, 129, 0.15);

    &:not(.collapsed) {
      transform: translateX(0);
    }
  }
}
</style>
