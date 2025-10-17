import { storage } from '@/utils'

export interface NotificationMessage {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type?: 'info' | 'success' | 'warning' | 'error'
}

class NotificationService {
  private eventSource: EventSource | null = null
  private abortController: AbortController | null = null
  private messageHandlers: ((message: NotificationMessage) => void)[] = []
  private reconnectTimer: number | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private currentUserId: string | number | null = null

  /**
   * 连接 SSE 服务 - 使用 fetch + ReadableStream 支持自定义请求头
   * @param userId 用户ID
   */
  connect(userId: string | number) {
    console.log('=== SSE Service: connect 方法被调用 ===')
    console.log('userId:', userId)

    // 如果已经有连接，先断开
    if (this.eventSource || this.abortController) {
      console.log('=== SSE Service: 检测到旧连接，先断开 ===')
      this.disconnect()
    }

    this.currentUserId = userId

    try {
      const token = storage.get<string>('token')
      if (!token) {
        console.error('=== SSE Service: 连接失败 - 未找到token ===')
        return
      }

      console.log('=== SSE Service: 获取到token ===')
      console.log('token 前30字符:', token.substring(0, 30) + '...')

      // 构建SSE连接URL，不在URL中传递token
      const baseUrl = 'https://patent.langdetech.cn/api/sse/connect'
      const url = `${baseUrl}/${userId}`

      console.log('=== SSE Service: 构建连接URL ===')
      console.log('完整URL:', url)

      // 创建 AbortController 用于取消请求
      this.abortController = new AbortController()

      // 使用 fetch 发起 SSE 请求，带上 Authorization 请求头
      console.log('=== SSE Service: 发起 fetch 请求 ===')
      fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        },
        signal: this.abortController.signal
      })
        .then(response => {
          console.log('=== SSE Service: 收到响应 ===')
          console.log('status:', response.status)
          console.log('statusText:', response.statusText)
          console.log('headers:', Object.fromEntries(response.headers.entries()))

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          if (!response.body) {
            throw new Error('Response body is null')
          }

          console.log('=== SSE Service: 连接已建立成功! ===')
          this.reconnectAttempts = 0

          if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
          }

          // 读取响应流
          const reader = response.body.getReader()
          const decoder = new TextDecoder()

          // 递归读取数据
          const readStream = () => {
            reader.read()
              .then(({ done, value }) => {
                if (done) {
                  console.log('=== SSE Service: 流结束 ===')
                  this.handleReconnect(userId)
                  return
                }

                // 解码数据
                const chunk = decoder.decode(value, { stream: true })
                console.log('=== SSE Service: 收到数据块 ===')
                console.log('原始数据:', chunk)

                // 解析 SSE 消息
                this.parseSSEMessage(chunk)

                // 继续读取
                readStream()
              })
              .catch(error => {
                if (error.name === 'AbortError') {
                  console.log('=== SSE Service: 连接被主动断开 ===')
                } else {
                  console.error('=== SSE Service: 读取流错误 ===')
                  console.error(error)
                  this.handleReconnect(userId)
                }
              })
          }

          // 开始读取流
          readStream()
        })
        .catch(error => {
          if (error.name === 'AbortError') {
            console.log('=== SSE Service: 请求被取消 ===')
          } else {
            console.error('=== SSE Service: 连接错误 ===')
            console.error(error)
            this.handleReconnect(userId)
          }
        })

      console.log('=== SSE Service: fetch 请求已发送，等待连接... ===')

    } catch (error) {
      console.error('=== SSE Service: 创建连接失败 ===')
      console.error(error)
    }
  }

  /**
   * 解析 SSE 消息
   */
  private parseSSEMessage(chunk: string) {
    // SSE 消息格式: data: {...}\n\n
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data:')) {
        const dataStr = line.substring(5).trim()
        if (!dataStr) continue

        console.log('=== SSE Service: 解析消息 ===')
        console.log('数据字符串:', dataStr)

        let notification: NotificationMessage

        try {
          // 尝试解析为 JSON
          const data = JSON.parse(dataStr)
          console.log('解析后的数据:', data)

          // 转换为标准通知格式
          notification = {
            id: data.id || `notification_${Date.now()}`,
            title: data.title || '新消息',
            message: data.message || data.content || data.msg || '',
            time: data.time || new Date().toISOString(),
            read: false,
            type: data.type || 'info'
          }
        } catch (error) {
          console.warn('=== SSE Service: JSON 解析失败，将消息作为纯文本处理 ===')
          console.warn('error:', error)

          // 如果 JSON 解析失败，将整个字符串作为消息内容
          notification = {
            id: `notification_${Date.now()}`,
            title: '系统通知',
            message: dataStr, // 直接使用原始文本
            time: new Date().toISOString(),
            read: false,
            type: 'info'
          }

          console.log('作为纯文本处理:', notification)
        }

        console.log('转换后的通知对象:', notification)
        console.log('=== SSE Service: 触发消息处理器 ===')
        console.log('处理器数量:', this.messageHandlers.length)

        // 触发所有消息处理器
        this.messageHandlers.forEach((handler, index) => {
          console.log(`执行处理器 ${index + 1}`)
          try {
            handler(notification)
            console.log(`处理器 ${index + 1} 执行成功`)
          } catch (error) {
            console.error(`处理器 ${index + 1} 执行失败:`, error)
          }
        })
      }
    }
  }

  /**
   * 处理重连逻辑
   */
  private handleReconnect(userId: string | number) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('=== SSE Service: 重连次数已达上限，停止重连 ===')
      console.error(`已尝试 ${this.reconnectAttempts} 次重连`)
      return
    }

    this.reconnectAttempts++
    console.log(`=== SSE Service: 连接断开，准备第 ${this.reconnectAttempts} 次重连 ===`)
    console.log(`${this.reconnectDelay / 1000}秒后尝试重连...`)

    this.reconnectTimer = window.setTimeout(() => {
      console.log('=== SSE Service: 开始重连 ===')
      this.connect(userId)
    }, this.reconnectDelay)
  }

  /**
   * 断开SSE连接
   */
  disconnect() {
    console.log('=== SSE Service: disconnect 方法被调用 ===')

    if (this.eventSource) {
      console.log('=== SSE Service: 关闭EventSource连接 ===')
      console.log('readyState 关闭前:', this.eventSource.readyState)
      this.eventSource.close()
      this.eventSource = null
      console.log('=== SSE Service: EventSource已关闭 ===')
    }

    if (this.abortController) {
      console.log('=== SSE Service: 取消 fetch 请求 ===')
      this.abortController.abort()
      this.abortController = null
      console.log('=== SSE Service: fetch 请求已取消 ===')
    }

    if (this.reconnectTimer) {
      console.log('=== SSE Service: 清除重连定时器 ===')
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.reconnectAttempts = 0
    this.currentUserId = null
    console.log('=== SSE Service: 断开完成 ===')
  }

  /**
   * 注册消息处理器
   * @param handler 消息处理函数
   * @returns 取消注册的函数
   */
  onMessage(handler: (message: NotificationMessage) => void): () => void {
    console.log('=== SSE Service: 注册消息处理器 ===')
    this.messageHandlers.push(handler)
    console.log('当前处理器总数:', this.messageHandlers.length)

    // 返回取消注册的函数
    return () => {
      console.log('=== SSE Service: 取消注册消息处理器 ===')
      const index = this.messageHandlers.indexOf(handler)
      if (index > -1) {
        this.messageHandlers.splice(index, 1)
        console.log('处理器已移除，剩余数量:', this.messageHandlers.length)
      }
    }
  }

  /**
   * 获取连接状态
   */
  getConnectionState(): number | null {
    if (this.eventSource) {
      return this.eventSource.readyState
    }
    if (this.abortController) {
      return 1 // 如果有abortController，说明连接存在
    }
    return null
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    if (this.eventSource) {
      return this.eventSource.readyState === EventSource.OPEN
    }
    // 对于fetch方式，检查abortController是否存在且没有被abort
    return this.abortController !== null && !this.abortController.signal.aborted
  }
}

// 导出单例
export const notificationService = new NotificationService()
