import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with correct default state', () => {
    const store = useAuthStore()
    
    expect(store.token).toBe(null)
    expect(store.user).toBe(null)
    expect(store.isLoggedIn).toBe(false)
    expect(store.loading).toBe(false)
  })

  it('should update login state correctly', async () => {
    const store = useAuthStore()
    
    // Mock successful login
    store.token = 'test-token'
    store.user = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    expect(store.isLoggedIn).toBe(true)
    expect(store.userName).toBe('testuser')
  })

  it('should clear state on logout', () => {
    const store = useAuthStore()
    
    // Set initial state
    store.token = 'test-token'
    store.user = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Clear state (simulate logout)
    store.token = null
    store.user = null
    
    expect(store.isLoggedIn).toBe(false)
    expect(store.userName).toBe(undefined)
  })
})