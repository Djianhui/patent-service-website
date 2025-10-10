// 通用类型定义
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

// 用户相关类型
export interface User {
  id: string
  username: string
  email: string
  phone?: string
  avatar?: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  VIP = 'vip'
}

export interface AuthState {
  token: string | null
  user: User | null
  isLoggedIn: boolean
}

// 技术方案报告类型
export interface TechReport {
  id: string
  title: string
  inputType: 'text' | 'file'
  inputContent: string
  reportContent: TechReportContent
  technicalField: string
  createTime: string
  status: ReportStatus
  userId: string
}

export interface TechReportContent {
  summary: string
  technicalField: string
  backgroundTechnology: string
  technicalProblem: string
  technicalSolution: string
  beneficialEffects: string
  implementationMethods: string[]
}

export enum ReportStatus {
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// 专利检索类型
export interface PatentSearchCriteria {
  keyword?: string
  title?: string
  abstract?: string
  applicant?: string
  inventor?: string
  ipcClass?: string
  applicationDateFrom?: string
  applicationDateTo?: string
  publicationDateFrom?: string
  publicationDateTo?: string
}

export interface Patent {
  id: string
  title: string
  abstract: string
  applicant: string
  inventor: string[]
  applicationNumber: string
  publicationNumber: string
  applicationDate: string
  publicationDate: string
  ipcClass: string[]
  claims: string[]
  description: string
  drawings?: string[]
}

export interface SearchResult {
  patents: Patent[]
  total: number
  page: number
  pageSize: number
}

// 三性分析类型
export interface ThreeAnalysis {
  id: string
  patentInfo: Patent
  noveltyAnalysis: NoveltyAnalysis
  creativityAnalysis: CreativityAnalysis
  practicalityAnalysis: PracticalityAnalysis
  overallEvaluation: OverallEvaluation
  createTime: string
  userId: string
}

export interface NoveltyAnalysis {
  hasNovelty: boolean
  priorArt: Patent[]
  analysis: string
  conclusion: string
}

export interface CreativityAnalysis {
  creativityLevel: 'high' | 'medium' | 'low'
  technicalFeatures: string[]
  technicalEffects: string[]
  analysis: string
  conclusion: string
}

export interface PracticalityAnalysis {
  isPractical: boolean
  implementationMethod: string
  analysis: string
  conclusion: string
}

export interface OverallEvaluation {
  score: number
  level: 'excellent' | 'good' | 'average' | 'poor'
  risks: string[]
  suggestions: string[]
}

// 专利撰写类型
export interface PatentDraft {
  id: string
  title: string
  technicalField: string
  backgroundTechnology: string
  technicalProblem: string
  technicalSolution: string
  claims: Claim[]
  description: string
  abstract: string
  drawings?: Drawing[]
  templateId?: string
  status: DraftStatus
  createTime: string
  updateTime: string
  userId: string
}

export interface Claim {
  id: string
  type: 'independent' | 'dependent'
  content: string
  dependsOn?: string
  order: number
}

export interface Drawing {
  id: string
  filename: string
  description: string
  url: string
}

export enum DraftStatus {
  DRAFT = 'draft',
  REVIEWING = 'reviewing',
  COMPLETED = 'completed'
}

export interface Template {
  id: string
  name: string
  type: 'invention' | 'utility' | 'design' | 'software' | 'chemistry'
  category: string
  content: TemplateContent
  isPublic: boolean
  userId: string
}

export interface TemplateContent {
  title: string
  technicalField: string
  backgroundTechnology: string
  technicalProblem: string
  technicalSolution: string
  claims: string[]
  description: string
  abstract: string
}

// 答辩支持类型
export interface DefenseCase {
  id: string
  patentDraftId: string
  examinationOpinion: ExaminationOpinion
  defenseStrategy: DefenseStrategy
  defenseDocument: string
  simulationResults?: SimulationResult[]
  status: DefenseStatus
  createTime: string
  updateTime: string
  userId: string
}

export interface ExaminationOpinion {
  id: string
  content: string
  rejectionReasons: RejectionReason[]
  examinerComments: string
  deadline: string
}

export interface RejectionReason {
  type: 'novelty' | 'creativity' | 'practicality' | 'clarity' | 'support'
  description: string
  citedPriors: Patent[]
  legalBasis: string[]
}

export interface DefenseStrategy {
  approach: string
  arguments: DefenseArgument[]
  amendmentSuggestions: string[]
  riskAssessment: string
}

export interface DefenseArgument {
  type: string
  content: string
  supportingEvidence: string[]
  legalBasis: string[]
}

export interface SimulationResult {
  scenario: string
  examinerQuestions: string[]
  suggestedAnswers: string[]
  successProbability: number
}

export enum DefenseStatus {
  PREPARING = 'preparing',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// 文件上传类型
export interface FileInfo {
  name: string
  size: number
  type: string
  url?: string
  status: 'uploading' | 'success' | 'error'
}