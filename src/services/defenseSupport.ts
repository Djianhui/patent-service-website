import { request } from './http'
import { convertImageUrl } from '@/utils'

// 答辩支持功能类型
export enum DefenseFunctionType {
  SIMULATION_REVIEW = 0, // 模拟审查
  DEFENSE_REPLY = 1, // 答辩意见回复
}

// 分页查询请求参数
export interface PageQueryRequest {
  keyword?: string
  pageIndex?: number
  pageSize?: number
  pageSorts?: Array<{
    asc: boolean
    column: string
  }>
  state?: number
  type: number // 5: 答辩支持
}

// 分页查询响应结果
export interface PageQueryResponse {
  code: number
  data: {
    pageIndex: number
    pageSize: number
    records: Array<{
      createTime: string
      firstImgUrl: string
      id: number
      mdUrl: string
      params: any
      pdfUrl: string
      state: number
      taskId: string
      taskJson: string
      type: number
      typeSub?: number // 功能子类型：0=模拟审查，1=答辩意见回复
      updateTime: string
      userId: number
      wordUrl: string
    }>
    total: number
  }
  msg: string
}

// 文件上传响应
export interface UploadFileResponse {
  code: number
  data: {
    fileName: string
    newFileName: string
    originalFilename: string
    url: string
  }
  msg: string
}

// 支付请求参数
export interface PayForTaskRequest {
  payType: 'tenpay' | 'alipay' // tenpay: 微信支付, alipay: 支付宝
  taskId: string
}

// 支付响应数据
export interface PayForTaskResponse {
  code: number
  data: {
    is_success: string
    msg: string
    qr_code_url: string // 微信支付二维码
    qr_pic_url: string // 支付宝二维码
    trade_no: string // 订单编号
  }
  msg: string
  time: string
}

// 答辩支持服务
export const defenseSupportService = {
  // 上传专利文件
  async uploadFile(file: File): Promise<string> {
    try {
      console.log('=== 开始上传文件 ===')
      console.log('文件名:', file.name)
      console.log('文件大小:', file.size)
      console.log('文件类型:', file.type)

      const formData = new FormData()
      formData.append('file', file)

      const response = await request.upload<UploadFileResponse>('/file/common/upload', formData)

      console.log('文件上传响应:', response)

      if (response.code === 200 && response.data) {
        return response.data.url
      } else {
        throw new Error(response.msg || '文件上传失败')
      }
    } catch (error: any) {
      console.error('=== 文件上传失败 ===')
      console.error(error)

      // 如果是登录过期错误，直接返回，不再显示错误
      if (error.message === '登录已过期') {
        return Promise.reject(error)
      }

      // 处理其他错误
      if (error.response && error.response.data) {
        const backendError = error.response.data
        throw new Error(backendError.msg || backendError.message || '文件上传失败')
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error('网络错误，请检查网络连接')
      }
    }
  },

  // 创建答辩支持任务
  async createDefenseTask(data: {
    functionType: DefenseFunctionType
    fileUrls: string[]
    prompt: string
  }): Promise<any> {
    try {
      console.log('=== 开始创建答辩支持任务 ===')
      console.log('功能类型:', data.functionType)
      console.log('文件路径:', data.fileUrls)
      console.log('答辩信息描述:', data.prompt)

      const response = await request.post<any>('/manus/task', {
        fileUrls: data.fileUrls,
        prompt: data.prompt,
        type: 5, // 5: 答辩支持
        typeSub: data.functionType,
      })

      console.log('答辩支持任务创建响应:', response)

      if (response.code === 200) {
        return response
      } else {
        throw new Error(response.msg || '创建任务失败')
      }
    } catch (error: any) {
      console.error('=== 答辩支持任务创建失败 ===')
      console.error(error)

      // 如果是登录过期错误，直接返回，不再显示错误
      if (error.message === '登录已过期') {
        return Promise.reject(error)
      }

      // 处理其他错误
      if (error.response && error.response.data) {
        const backendError = error.response.data
        throw new Error(backendError.msg || backendError.message || '创建任务失败')
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error('网络错误，请检查网络连接')
      }
    }
  },

  // 获取答辩支持任务列表
  async getDefenseList(
    params: {
      page?: number
      pageSize?: number
      keyword?: string
      state?: number
    } = {},
  ) {
    try {
      console.log('=== 获取答辩支持任务列表 ===')
      console.log('请求参数:', params)

      const requestData: PageQueryRequest = {
        keyword: params.keyword || '',
        pageIndex: params.page || 1,
        pageSize: params.pageSize || 10,
        type: 5, // 5: 答辩支持
      }

      if (params.state !== undefined) {
        requestData.state = params.state
      }

      console.log('最终请求数据:', requestData)

      const response = await request.post<PageQueryResponse>('/task/getPage', requestData)

      console.log('后端返回数据:', response)

      if (response.code === 200 && response.data) {
        // 转换为前端数据格式
        const defenseList = response.data.records.map((record) => {
          // 解析 taskJson
          let functionType = DefenseFunctionType.SIMULATION_REVIEW
          let description = ''
          let fileUrls: string[] = []

          console.log('=== 解析单条记录 ===')
          console.log('记录ID:', record.id)
          console.log('record对象:', record)
          console.log('record.typeSub:', record.typeSub)
          console.log('taskJson原始值:', record.taskJson)

          // 优先使用record上的typeSub字段（后端直接返回）
          if (record.typeSub !== undefined && record.typeSub !== null) {
            functionType = record.typeSub
            console.log('✅ 使用record.typeSub:', functionType)
          }

          try {
            if (record.taskJson) {
              const taskData = JSON.parse(record.taskJson)
              console.log('解析后的taskData:', taskData)
              console.log('taskData.typeSub:', taskData.typeSub)

              // 如果record没有typeSub，尝试从taskData获取
              if (
                (record.typeSub === undefined || record.typeSub === null) &&
                taskData.typeSub !== undefined
              ) {
                functionType = taskData.typeSub
                console.log('✅ 使用taskData.typeSub:', functionType)
              }

              description = taskData.prompt || ''
              fileUrls = taskData.fileUrls || []
            }
          } catch (e) {
            console.warn('⚠️ 解析 taskJson 失败:', e)
          }

          console.log('🎯 最终functionType值:', functionType)
          console.log('🎯 functionType类型:', typeof functionType)
          console.log('===================')

          return {
            id: String(record.id),
            taskId: record.taskId, // 直接保留taskId字段
            functionType,
            description,
            fileUrls,
            firstImgUrl: convertImageUrl(record.firstImgUrl),
            pdfUrl: record.pdfUrl,
            wordUrl: record.wordUrl,
            mdUrl: record.mdUrl,
            state: record.state,
            createTime: record.createTime,
            updateTime: record.updateTime,
          }
        })

        console.log('📋 转换后的任务列表:', defenseList)

        return {
          data: defenseList,
          total: response.data.total,
          page: params.page || 1,
          pageSize: params.pageSize || 10,
        }
      } else {
        throw new Error(response.msg || '获取任务列表失败')
      }
    } catch (error: any) {
      console.error('=== 获取答辩支持任务列表失败 ===')
      console.error(error)

      // 如果是登录过期错误，直接返回，不再显示错误
      if (error.message === '登录已过期') {
        return Promise.reject(error)
      }

      // 处理其他错误
      if (error.response && error.response.data) {
        const backendError = error.response.data
        throw new Error(backendError.msg || backendError.message || '获取任务列表失败')
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error('网络错误，请检查网络连接')
      }
    }
  },

  // 支付下载报告
  async payForTask(params: PayForTaskRequest): Promise<PayForTaskResponse> {
    try {
      console.log('=== 提交支付请求 ===')
      console.log('支付参数:', params)

      const response = await request.post<PayForTaskResponse>('/order/payForTask', params)

      console.log('支付响应:', response)

      if ((response.code === 0 || response.code === 200) && response.data) {
        return response
      } else {
        throw new Error(response.msg || '支付失败')
      }
    } catch (error: any) {
      console.error('=== 支付请求失败 ===')
      console.error(error)

      // 处理错误
      if (error.response && error.response.data) {
        const backendError = error.response.data
        throw new Error(backendError.msg || backendError.message || '支付失败')
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error('网络错误，请检查网络连接')
      }
    }
  },
}
