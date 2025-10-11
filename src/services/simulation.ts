import { request } from './http'
import type { SimulationReview, PatentFileInfo, ExaminationOpinion, RejectionReason, CitedPrior } from '@/types'
import { SimulationStatus } from '@/types'

// 模拟审查数据
const mockSimulationReviews: SimulationReview[] = [
  {
    id: '1',
    patentFile: {
      name: '组装式食用菌种植棚专利申请书.pdf',
      size: 2048576,
      type: 'application/pdf',
      url: '/mock-files/patent1.pdf',
      status: 'success'
    },
    patentInfo: {
      title: '组装式食用菌种植棚',
      applicationNumber: 'CN202123456789.X',
      applicant: '常州吴县某农业科技有限公司',
      inventor: ['张明', '李华'],
      technicalField: '农业设施技术领域',
      abstract: '本实用新型公开了一种组装式食用菌种植棚，包括底座、立柱、横梁、保温层和顶盖，底座采用预制混凝土结构，立柱采用钢管结构，横梁采用轻钢结构，保温层采用岩棉材料，顶盖采用透明阳光板。整体结构可快速装卸，便于运输和安装，保温效果好，透光性强，有利于食用菌的生长。',
      claims: [
        '一种组装式食用菌种植棚，其特征在于：包括底座(1)、立柱(2)、横梁(3)、保温层(4)和顶盖(5)；',
        '根据权利要求1所述的组装式食用菌种植棚，其特征在于：所述底座(1)采用预制混凝土结构，具有排水沟槽；',
        '根据权利要求1所述的组装式食用菌种植棚，其特征在于：所述立柱(2)采用热镀锌钢管，直径50mm，壁厚3mm；',
        '根据权利要求1所述的组装式食用菌种植棚，其特征在于：所述横梁(3)采用轻钢结构，截面为C型钢；'
      ],
      description: '本实用新型涉及农业设施技术领域，具体涉及一种组装式食用菌种植棚。现有的食用菌种植棚多采用固定式结构，建设成本高，不便于迁移和重复利用。本实用新型提供一种组装式食用菌种植棚，解决现有技术中存在的保温性能差、结构不稳定、安装复杂的技术问题。'
    },
    examinationOpinion: {
      id: 'exam-001',
      reviewNumber: '第202123456789.X号',
      content: '经实质审查，申请人提交的实用新型专利申请不符合专利法的相关规定，现通知如下审查意见：',
      rejectionReasons: [
        {
          type: 'novelty',
          description: '权利要求1-4不具备新颖性',
          citedPriors: [
            {
              publicationNumber: 'CN210123456U',
              title: '可拆卸式蘑菇种植房',
              publicationDate: '2020-01-15',
              relevantSections: ['权利要求1-3', '说明书第2-3段']
            },
            {
              publicationNumber: 'CN209876543U',
              title: '食用菌种植大棚',
              publicationDate: '2019-12-20',
              relevantSections: ['权利要求1', '说明书第4段']
            }
          ],
          legalBasis: ['专利法第22条第2款'],
          claimsAffected: [1, 2, 3, 4]
        },
        {
          type: 'creativity',
          description: '权利要求2-4相对于权利要求1和现有技术的结合不具备创造性',
          citedPriors: [
            {
              publicationNumber: 'CN210123456U',
              title: '可拆卸式蘑菇种植房',
              publicationDate: '2020-01-15',
              relevantSections: ['权利要求1-3']
            }
          ],
          legalBasis: ['专利法第22条第3款'],
          claimsAffected: [2, 3, 4]
        }
      ],
      examinerComments: '1. 权利要求1所述的技术方案与对比文件1公开的技术方案基本相同，仅在材料选择上存在细微差别，不足以产生预料不到的技术效果。\n\n2. 权利要求2-4所述的技术特征均为本领域技术人员根据实际需要进行的常规选择，不具备突出的实质性特点和显著的进步。\n\n3. 说明书中未充分说明本申请相对于现有技术的优势和创新点。',
      legalBasis: [
        '中华人民共和国专利法第二十二条',
        '专利审查指南第二部分第三章',
        '专利审查指南第二部分第四章'
      ],
      deadline: '2024-12-15',
      severity: 'high'
    },
    status: SimulationStatus.COMPLETED,
    createTime: '2024-01-20T10:30:00Z',
    userId: 'user-123'
  },
  {
    id: '2',
    patentFile: {
      name: '食用菌自动化培养系统专利申请书.pdf',
      size: 3145728,
      type: 'application/pdf',
      url: '/mock-files/patent2.pdf',
      status: 'success'
    },
    patentInfo: {
      title: '食用菌自动化培养系统',
      applicationNumber: 'CN202111234567.8',
      applicant: '上海某生物科技有限公司',
      inventor: ['陈伟', '刘芳', '王建'],
      technicalField: '生物技术领域',
      abstract: '本发明公开了一种食用菌自动化培养系统，包括培养室、环境控制系统、自动化设备和监控系统。通过传感器实时监测温度、湿度、CO2浓度等参数，自动调节培养环境，实现食用菌的智能化培养。',
      claims: [
        '一种食用菌自动化培养系统，包括培养室、环境控制系统、自动化设备和监控系统；',
        '根据权利要求1所述的系统，其特征在于：环境控制系统包括温度控制模块、湿度控制模块和通风控制模块；'
      ],
      description: '本发明涉及生物技术领域，具体涉及一种食用菌自动化培养系统。现有的食用菌培养多依赖人工操作，效率低下且难以保证环境参数的精确控制。'
    },
    examinationOpinion: {
      id: 'exam-002',
      reviewNumber: '第202111234567.8号',
      content: '经实质审查，申请人提交的发明专利申请基本符合专利法的相关规定，但存在以下需要完善的地方：',
      rejectionReasons: [
        {
          type: 'clarity',
          description: '权利要求书表述不够清楚',
          citedPriors: [],
          legalBasis: ['专利法第26条第4款'],
          claimsAffected: [1, 2]
        },
        {
          type: 'support',
          description: '权利要求得不到说明书的支持',
          citedPriors: [],
          legalBasis: ['专利法第26条第4款'],
          claimsAffected: [2]
        }
      ],
      examinerComments: '1. 建议在权利要求1中进一步明确各系统之间的连接关系和工作原理。\n\n2. 权利要求2中的"控制模块"概念过于宽泛，建议具体化。\n\n3. 说明书中应补充更多技术细节和实施例。',
      legalBasis: [
        '中华人民共和国专利法第二十六条',
        '专利审查指南第二部分第二章'
      ],
      deadline: '2024-11-30',
      severity: 'medium'
    },
    status: SimulationStatus.COMPLETED,
    createTime: '2024-01-18T14:20:00Z',
    userId: 'user-123'
  },
  {
    id: '3',
    patentFile: {
      name: '智能食用菌接种设备专利申请书.pdf',
      size: 1572864,
      type: 'application/pdf',
      url: '/mock-files/patent3.pdf',
      status: 'success'
    },
    patentInfo: {
      title: '智能食用菌接种设备',
      applicationNumber: 'CN202123456790.1',
      applicant: '北京某农业设备有限公司',
      inventor: ['赵敏', '孙强'],
      technicalField: '农业机械技术领域',
      abstract: '本实用新型公开了一种智能食用菌接种设备，包括接种箱体、机械臂、控制系统和消毒系统。设备能够自动完成菌种接种过程，提高接种效率和成功率。',
      claims: [
        '一种智能食用菌接种设备，包括接种箱体、机械臂、控制系统和消毒系统；'
      ],
      description: '本实用新型涉及农业机械技术领域，具体涉及一种智能食用菌接种设备。传统的食用菌接种主要依靠人工操作，存在效率低、污染率高等问题。'
    },
    examinationOpinion: {
      id: 'exam-003',
      reviewNumber: '第202123456790.1号',
      content: '经实质审查，申请人提交的实用新型专利申请符合专利法的相关规定，予以授权。',
      rejectionReasons: [],
      examinerComments: '该申请的技术方案具有新颖性、创造性和实用性，权利要求书表述清楚，说明书充分公开了技术方案，符合授权条件。',
      legalBasis: [
        '中华人民共和国专利法第二十二条',
        '中华人民共和国专利法第二十六条'
      ],
      deadline: '2024-10-20',
      severity: 'low'
    },
    status: SimulationStatus.COMPLETED,
    createTime: '2024-01-15T09:45:00Z',
    userId: 'user-123'
  }
]

// 模拟API接口
export const simulationService = {
  // 获取模拟审查列表
  async getSimulationList(params: {
    page?: number
    pageSize?: number
    keyword?: string
    status?: SimulationStatus
  } = {}) {
    const { page = 1, pageSize = 10, keyword = '', status } = params

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 800))

    let filteredReviews = [...mockSimulationReviews]

    // 关键词过滤
    if (keyword) {
      const searchKeyword = keyword.toLowerCase()
      filteredReviews = filteredReviews.filter(review =>
        review.patentInfo.title.toLowerCase().includes(searchKeyword) ||
        review.patentInfo.applicant.toLowerCase().includes(searchKeyword) ||
        review.patentInfo.abstract.toLowerCase().includes(searchKeyword)
      )
    }

    // 状态过滤
    if (status) {
      filteredReviews = filteredReviews.filter(review => review.status === status)
    }

    // 分页
    const total = filteredReviews.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const data = filteredReviews.slice(start, end)

    return {
      data,
      total,
      page,
      pageSize
    }
  },

  // 获取模拟审查详情
  async getSimulationDetail(id: string): Promise<SimulationReview> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const review = mockSimulationReviews.find(item => item.id === id)
    if (!review) {
      throw new Error('审查记录不存在')
    }

    return review
  },

  // 上传专利文件并开始模拟审查
  async uploadPatentFile(file: File): Promise<SimulationReview> {
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 模拟文件分析和审查意见生成
    const newReview: SimulationReview = {
      id: Date.now().toString(),
      patentFile: {
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        status: 'success'
      },
      patentInfo: {
        title: '用户上传的专利申请',
        applicant: '用户自定义',
        inventor: ['发明人'],
        technicalField: '技术领域',
        abstract: '基于文件内容分析得出的摘要信息...',
        claims: ['权利要求内容...'],
        description: '说明书内容...'
      },
      examinationOpinion: {
        id: `exam-${Date.now()}`,
        reviewNumber: `第${Date.now()}号`,
        content: 'AI模拟审查意见：',
        rejectionReasons: [
          {
            type: Math.random() > 0.5 ? 'novelty' : 'creativity',
            description: 'AI分析发现的问题...',
            citedPriors: [],
            legalBasis: ['专利法相关条款'],
            claimsAffected: [1]
          }
        ],
        examinerComments: 'AI生成的审查意见和建议...',
        legalBasis: ['专利法相关条款'],
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
        severity: Math.random() > 0.5 ? 'medium' : 'low'
      },
      status: SimulationStatus.COMPLETED,
      createTime: new Date().toISOString(),
      userId: 'user-123'
    }

    mockSimulationReviews.unshift(newReview)
    return newReview
  },

  // 删除模拟审查记录
  async deleteSimulation(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const index = mockSimulationReviews.findIndex(item => item.id === id)
    if (index > -1) {
      mockSimulationReviews.splice(index, 1)
    }
  }
}
