import { request } from './http'
import type {
  ThreeAnalysis,
  Patent,
  NoveltyAnalysis,
  CreativityAnalysis,
  PracticalityAnalysis,
  OverallEvaluation,
} from '@/types'
import { convertImageUrl } from '@/utils'

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
  type: number // 3: 三性分析
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
      updateTime: string
      userId: number
      wordUrl: string
    }>
    total: number
  }
  msg: string
}

// 模拟三性分析数据
const mockThreeAnalyses: ThreeAnalysis[] = [
  {
    id: '1',
    patentInfo: {
      id: 'patent-1',
      title: '组装式食用菌种植棚',
      abstract:
        '本实用新型公开了一种组装式食用菌种植棚，包括底座、立柱、横梁、保温层和顶盖，底座采用预制混凝土结构，立柱采用钢管结构，横梁采用轻钢结构，保温层采用岩棉材料，顶盖采用透明阳光板。整体结构可快速装卸，便于运输和安装，保温效果好，透光性强，有利于食用菌的生长。',
      applicant: '常州吴县某农业科技有限公司',
      inventor: ['张明', '李华'],
      applicationNumber: 'CN202123456789.X',
      publicationNumber: 'CN215678901U',
      applicationDate: '2021-08-15',
      publicationDate: '2022-02-18',
      ipcClass: ['A01G1/04', 'A01G9/24', 'E04H15/20'],
      claims: [
        '一种组装式食用菌种植棚，其特征在于：包括底座(1)、立柱(2)、横梁(3)、保温层(4)和顶盖(5)；',
        '根据权利要求1所述的组装式食用菌种植棚，其特征在于：所述底座(1)采用预制混凝土结构，具有排水沟槽；',
        '根据权利要求1所述的组装式食用菌种植棚，其特征在于：所述立柱(2)采用热镀锌钢管，直径50mm，壁厚3mm；',
        '根据权利要求1所述的组装式食用菌种植棚，其特征在于：所述横梁(3)采用轻钢结构，截面为C型钢；',
      ],
      description:
        '本实用新型涉及农业设施技术领域，具体涉及一种组装式食用菌种植棚。\n\n背景技术：\n食用菌种植需要在特定的温度、湿度和光照条件下进行。传统的食用菌种植棚多采用固定式结构，建设成本高，不便于迁移和重复利用。现有的可移动种植棚存在保温性能差、结构不稳定、安装复杂等问题。\n\n发明内容：\n本实用新型的目的是提供一种组装式食用菌种植棚，解决现有技术中存在的保温性能差、结构不稳定、安装复杂的技术问题。\n\n具体实施方式：\n如图1所示，本实用新型包括底座1、立柱2、横梁3、保温层4和顶盖5。底座1采用预制混凝土结构，具有良好的稳定性和排水功能。立柱2采用热镀锌钢管，具有良好的防腐性能。横梁3采用轻钢结构，重量轻、强度高。保温层4采用岩棉材料，保温性能优异。顶盖5采用透明阳光板，透光率高，有利于植物生长。',
    },
    noveltyAnalysis: {
      hasNovelty: true,
      priorArt: [
        {
          id: 'prior-1',
          title: '可拆卸式蘑菇种植房',
          abstract: '一种可拆卸式蘑菇种植房，包括框架和保温材料，框架采用铝合金结构。',
          applicant: '某农业公司',
          inventor: ['王强'],
          applicationNumber: 'CN201920123456.7',
          publicationNumber: 'CN210123456U',
          applicationDate: '2019-03-20',
          publicationDate: '2020-01-15',
          ipcClass: ['A01G1/04'],
          claims: ['一种可拆卸式蘑菇种植房...'],
          description: '背景技术...',
        },
      ],
      analysis:
        '通过对现有技术的检索和分析，发现了若干相关的食用菌种植设施专利。现有技术主要存在以下特点：\n1. CN210123456U公开了可拆卸式蘑菇种植房，但其框架采用铝合金结构，成本较高，且未公开具体的保温方案；\n2. CN209876543U公开了食用菌种植大棚，但为固定式结构，不便于迁移；\n3. CN208765432U公开了模块化农业温室，但主要用于蔬菜种植，未针对食用菌的特殊需求进行优化。\n\n本申请的技术方案在以下方面与现有技术存在区别：\n1. 采用预制混凝土底座+钢管立柱+轻钢横梁的组合结构，既保证了稳定性又便于组装；\n2. 保温层采用岩棉材料，保温性能优于现有技术；\n3. 顶盖采用透明阳光板，透光性能好，专门针对食用菌种植优化。',
      conclusion:
        '经过检索分析，本申请的技术方案相对于现有技术具有明显的区别特征，在结构设计、材料选择和功能实现方面均有创新，具备新颖性。',
    },
    creativityAnalysis: {
      creativityLevel: 'high',
      technicalFeatures: [
        '预制混凝土底座结构',
        '热镀锌钢管立柱',
        '轻钢C型横梁',
        '岩棉保温层',
        '透明阳光板顶盖',
      ],
      technicalEffects: [
        '提高了结构稳定性',
        '便于快速组装和拆卸',
        '改善了保温性能',
        '增强了透光效果',
        '降低了建设成本',
      ],
      analysis:
        '本申请的技术方案通过合理的结构设计和材料选择，解决了现有食用菌种植棚存在的技术问题：\n\n1. 技术特征分析：\n- 预制混凝土底座：提供稳定的基础，具有排水功能，相比传统地基更加标准化和可重复利用；\n- 热镀锌钢管立柱：具有良好的防腐性能和强度，相比铝合金成本更低；\n- 轻钢C型横梁：重量轻、强度高，便于运输和安装；\n- 岩棉保温层：保温性能优异，防火性能好；\n- 透明阳光板顶盖：透光率高，重量轻，抗冲击性强。\n\n2. 技术效果分析：\n各技术特征的组合产生了协同效应，既保证了结构的稳定性和安全性，又实现了快速组装、良好保温和优异透光的综合效果。这种组合在现有技术中未见公开，属于非显而易知的技术方案。',
      conclusion:
        '本申请的技术方案通过多种技术特征的有机结合，产生了意想不到的技术效果，相对于现有技术具有突出的实质性特点和显著的进步，具备较高的创造性。',
    },
    practicalityAnalysis: {
      isPractical: true,
      implementationMethod:
        '本技术方案完全基于现有的成熟材料和工艺，具有良好的可实施性：\n1. 预制混凝土底座：采用标准的混凝土预制技术；\n2. 热镀锌钢管：市场上广泛应用的标准材料；\n3. 轻钢结构：成熟的建筑结构技术；\n4. 岩棉保温材料：广泛应用的保温材料；\n5. 阳光板：成熟的建筑材料。',
      analysis:
        '本申请的技术方案在实用性方面表现优异：\n\n1. 技术可行性：\n- 所有采用的材料和工艺均为现有成熟技术，技术风险低；\n- 结构设计合理，符合工程力学原理；\n- 制造工艺简单，易于批量生产。\n\n2. 经济可行性：\n- 材料成本合理，相比传统固定式种植棚具有成本优势；\n- 可重复使用，降低了长期使用成本；\n- 组装简单，降低了安装和维护成本。\n\n3. 实际应用价值：\n- 适用于食用菌规模化种植；\n- 可根据季节和需求灵活部署；\n- 有利于农业现代化发展。\n\n4. 环境适应性：\n- 结构稳定，能够适应不同的气候条件；\n- 保温性能好，适用于不同地区；\n- 材料环保，符合可持续发展要求。',
      conclusion:
        '本申请的技术方案具有良好的技术可行性和经济可行性，能够在农业生产中实际应用并产生积极的技术效果，具备实用性。',
    },
    overallEvaluation: {
      score: 88,
      level: 'excellent',
      risks: [
        '市场上可能存在类似的组合式结构产品',
        '部分技术特征可能被认为是常规技术手段的简单组合',
        '需要进一步完善产品的标准化和模块化设计',
      ],
      suggestions: [
        '建议补充更多的试验数据和性能对比分析',
        '可考虑增加智能化控制系统相关的技术内容',
        '建议完善产品的标准化接口设计',
        '可考虑申请发明专利，保护核心的结构设计方法',
        '建议进行更全面的现有技术检索，确保新颖性',
      ],
    },
    createTime: '2024-01-15T10:30:00Z',
    userId: 'user-123',
  },
  {
    id: '2',
    patentInfo: {
      id: 'patent-2',
      title: '食用菌自动化培养系统',
      abstract:
        '本发明公开了一种食用菌自动化培养系统，包括培养室、环境控制系统、自动化设备和监控系统。通过传感器实时监测温度、湿度、CO2浓度等参数，自动调节培养环境，实现食用菌的智能化培养。',
      applicant: '上海某生物科技有限公司',
      inventor: ['陈伟', '刘芳', '王建'],
      applicationNumber: 'CN202111234567.8',
      publicationNumber: 'CN113456789A',
      applicationDate: '2021-11-10',
      publicationDate: '2022-05-20',
      ipcClass: ['A01G18/20', 'G05D27/02'],
      claims: [
        '一种食用菌自动化培养系统，包括培养室、环境控制系统、自动化设备和监控系统；',
        '根据权利要求1所述的系统，其特征在于：环境控制系统包括温度控制模块、湿度控制模块和通风控制模块；',
        '根据权利要求1所述的系统，其特征在于：监控系统包括传感器网络和数据采集处理单元。',
      ],
      description: '一种食用菌自动化培养系统的详细描述...',
    },
    noveltyAnalysis: {
      hasNovelty: true,
      priorArt: [],
      analysis:
        '现有的食用菌培养系统多为人工控制或半自动化控制，本申请的全自动化智能控制系统具有明显的技术进步。',
      conclusion: '经检索分析，本申请具备新颖性。',
    },
    creativityAnalysis: {
      creativityLevel: 'high',
      technicalFeatures: ['多传感器融合监测', '智能算法控制', '自适应环境调节'],
      technicalEffects: ['提高培养效率', '降低人工成本', '提升产品质量'],
      analysis: '本申请通过多项技术的集成创新，实现了食用菌培养的智能化管理。',
      conclusion: '本申请具有较高的创造性水平。',
    },
    practicalityAnalysis: {
      isPractical: true,
      implementationMethod: '基于现有的传感器技术、控制技术和计算机技术实现。',
      analysis: '技术方案可行性高，具有良好的产业化前景。',
      conclusion: '本申请具备实用性。',
    },
    overallEvaluation: {
      score: 92,
      level: 'excellent',
      risks: ['技术复杂度较高', '投资成本较大'],
      suggestions: ['建议申请发明专利', '可考虑国际专利布局'],
    },
    createTime: '2024-01-10T14:20:00Z',
    userId: 'user-123',
  },
  {
    id: '3',
    patentInfo: {
      id: 'patent-3',
      title: '新型食用菌接种装置',
      abstract:
        '本实用新型公开了一种新型食用菌接种装置，包括接种箱体、无菌操作室、空气过滤系统和紫外线消毒系统。该装置能够为食用菌接种提供无菌环境，提高接种成功率。',
      applicant: '北京某农业设备有限公司',
      inventor: ['赵敏'],
      applicationNumber: 'CN202023456789.1',
      publicationNumber: 'CN212345678U',
      applicationDate: '2020-12-05',
      publicationDate: '2021-08-15',
      ipcClass: ['A01G18/60'],
      claims: ['一种新型食用菌接种装置，包括接种箱体、无菌操作室、空气过滤系统和紫外线消毒系统；'],
      description: '一种新型食用菌接种装置的详细描述...',
    },
    noveltyAnalysis: {
      hasNovelty: false,
      priorArt: [],
      analysis: '现有技术中已存在类似的无菌接种设备，本申请的技术方案与现有技术差异较小。',
      conclusion: '本申请的新颖性存在一定风险。',
    },
    creativityAnalysis: {
      creativityLevel: 'medium',
      technicalFeatures: ['无菌操作环境', '多重消毒系统'],
      technicalEffects: ['提高接种成功率', '减少污染风险'],
      analysis: '技术方案较为常规，创造性水平一般。',
      conclusion: '本申请的创造性处于中等水平。',
    },
    practicalityAnalysis: {
      isPractical: true,
      implementationMethod: '采用常规的无菌技术和消毒技术。',
      analysis: '技术方案简单实用，具有良好的可操作性。',
      conclusion: '本申请具备实用性。',
    },
    overallEvaluation: {
      score: 68,
      level: 'average',
      risks: ['新颖性风险较高', '创造性水平一般'],
      suggestions: ['建议增加更多创新性技术特征', '完善现有技术检索'],
    },
    createTime: '2024-01-08T09:15:00Z',
    userId: 'user-123',
  },
]

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

// 模拟API接口
export const threeAnalysisService = {
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
  // 创建三性分析（提交到后端）
  async createAnalysis(data: {
    title?: string
    technicalSolution?: string
    analysisTypes: string[]
    fileUrls?: string[]
  }): Promise<any> {
    try {
      console.log('=== 开始三性分析 ===')
      console.log('专利标题:', data.title)
      console.log('技术方案:', data.technicalSolution)
      console.log('文件路径:', data.fileUrls)

      // 构建请求参数
      const requestData: any = {
        type: 3, // 3: 三性分析
      }

      // 如果有文件，优先使用文件
      if (data.fileUrls && data.fileUrls.length > 0) {
        requestData.fileUrls = data.fileUrls
        // 如果同时提供了文本信息，作为 prompt
        if (data.title || data.technicalSolution) {
          const prompt = '专利标题：' + data.title + '\n' + '技术方案：' + data.technicalSolution

          if (prompt) {
            requestData.prompt = prompt
          } else {
            requestData.prompt = '无输入'
          }
        }
      } else {
        // 没有文件，使用文本输入（拼接 prompt：专利标题 + 技术方案）
        const prompt = '专利标题：' + data.title + '\n' + '技术方案：' + data.technicalSolution
        requestData.prompt = prompt.trim()
      }

      // 调用API生成三性分析报告
      const response = await request.post<any>('/manus/task', requestData)

      console.log('三性分析提交响应:', response)

      if (response.code === 200) {
        return response
      } else {
        throw new Error(response.msg || '分析失败')
      }
    } catch (error: any) {
      console.error('=== 三性分析失败 ===')
      console.error(error)

      // 如果是登录过期错误，直接返回，不再显示错误
      if (error.message === '登录已过期') {
        return Promise.reject(error)
      }

      // 处理其他错误
      if (error.response && error.response.data) {
        const backendError = error.response.data
        throw new Error(backendError.msg || backendError.message || '分析失败')
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error('网络错误，请检查网络连接')
      }
    }
  },

  // 获取三性分析历史列表
  async getAnalysisHistory(
    params: {
      page?: number
      pageSize?: number
      keyword?: string
      status?: string
    } = {},
  ) {
    try {
      console.log('=== 获取三性分析历史 ===')
      console.log('请求参数:', params)

      const requestData: PageQueryRequest = {
        keyword: params.keyword || '',
        pageIndex: params.page || 1,
        pageSize: params.pageSize || 10,
        type: 3, // 3: 三性分析
      }

      // 状态映射
      if (params.status) {
        const statusMap: Record<string, number> = {
          generating: 0,
          completed: 1,
          failed: 2,
        }
        requestData.state = statusMap[params.status]
      }

      console.log('最终请求数据:', requestData)

      const response = await request.post<PageQueryResponse>('/task/getPage', requestData)

      console.log('后端返回数据:', response)

      if (response.code === 200 && response.data) {
        // 转换为 ThreeAnalysis 类型
        const analyses: ThreeAnalysis[] = response.data.records.map((record) => {
          // 解析 taskJson
          let title = '三性分析报告'
          let abstract = ''
          let technicalSolution = ''

          try {
            if (record.taskJson) {
              const taskData = JSON.parse(record.taskJson)
              const promptLines = taskData.prompt ? taskData.prompt.split('\n') : []
              if (promptLines.length > 0) {
                title = promptLines[0] || '三性分析报告'
              }
              if (promptLines.length > 1) {
                technicalSolution = promptLines.slice(1).join('\n')
                abstract = technicalSolution.substring(0, 200) + '...'
              }
            }
          } catch (e) {
            console.warn('解析 taskJson 失败:', e)
          }

          return {
            id: String(record.id),
            patentInfo: {
              id: String(record.id),
              title,
              abstract: abstract || '正在分析中...',
              applicant: '系统生成',
              inventor: [],
              applicationNumber: record.taskId || String(record.id),
              publicationNumber: record.taskId || String(record.id),
              applicationDate: record.createTime,
              publicationDate: record.createTime,
              ipcClass: [],
              claims: [],
              description: technicalSolution,
            },
            noveltyAnalysis: {
              hasNovelty: true,
              priorArt: [],
              analysis: '',
              conclusion: '',
            },
            creativityAnalysis: {
              creativityLevel: 'medium',
              technicalFeatures: [],
              technicalEffects: [],
              analysis: '',
              conclusion: '',
            },
            practicalityAnalysis: {
              isPractical: true,
              implementationMethod: '',
              analysis: '',
              conclusion: '',
            },
            overallEvaluation: {
              score: 0,
              level: 'average',
              risks: [],
              suggestions: [],
            },
            createTime: record.createTime,
            userId: String(record.userId),
            // 扩展字段
            firstImgUrl: convertImageUrl(record.firstImgUrl),
            pdfUrl: record.pdfUrl,
            wordUrl: record.wordUrl,
            mdUrl: record.mdUrl,
            state: record.state,
          } as ThreeAnalysis & {
            firstImgUrl?: string
            pdfUrl?: string
            wordUrl?: string
            mdUrl?: string
            state?: number
          }
        })

        console.log('转换后的分析列表:', analyses)

        return {
          data: analyses,
          total: response.data.total,
          page: params.page || 1,
          pageSize: params.pageSize || 10,
        }
      } else {
        throw new Error(response.msg || '获取分析历史失败')
      }
    } catch (error: any) {
      console.error('=== 获取分析历史失败 ===')
      console.error(error)

      // 如果是登录过期错误，直接返回，不再显示错误
      if (error.message === '登录已过期') {
        return Promise.reject(error)
      }

      // 处理其他错误
      if (error.response && error.response.data) {
        const backendError = error.response.data
        throw new Error(backendError.msg || backendError.message || '获取分析历史失败')
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error('网络错误，请检查网络连接')
      }
    }
  },

  // 获取三性分析详情
  async getAnalysisDetail(id: string): Promise<ThreeAnalysis> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const analysis = mockThreeAnalyses.find((item) => item.id === id)
    if (!analysis) {
      throw new Error('分析报告不存在')
    }

    return analysis
  },

  // 删除三性分析
  async deleteAnalysis(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const index = mockThreeAnalyses.findIndex((item) => item.id === id)
    if (index > -1) {
      mockThreeAnalyses.splice(index, 1)
    }
  },
}
