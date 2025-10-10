import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import AppHeader from '@/layouts/AppHeader.vue'

describe('AppHeader', () => {
  it('renders properly', () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [createPinia()],
        stubs: {
          'el-button': true,
          'el-icon': true,
          'el-breadcrumb': true,
          'el-breadcrumb-item': true,
          'el-badge': true,
          'el-avatar': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-drawer': true,
          'el-empty': true
        }
      },
      props: {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com'
        },
        collapsed: false
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.app-header').exists()).toBe(true)
  })

  it('emits toggle-sidebar event when menu button is clicked', async () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [createPinia()],
        stubs: {
          'el-button': {
            template: '<button @click="$emit(\'click\')"><slot/></button>'
          },
          'el-icon': true,
          'el-breadcrumb': true,
          'el-breadcrumb-item': true,
          'el-badge': true,
          'el-avatar': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-drawer': true,
          'el-empty': true
        }
      },
      props: {
        user: null,
        collapsed: false
      }
    })

    const menuButton = wrapper.find('.menu-toggle')
    await menuButton.trigger('click')
    
    expect(wrapper.emitted('toggle-sidebar')).toBeTruthy()
  })
})