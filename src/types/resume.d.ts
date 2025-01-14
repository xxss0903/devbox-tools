// 基础接口定义
export interface Experience {
  company: string
  position: string
  duration: string
  description: string
}

export interface Education {
  school: string
  degree: string
  year: string
}

export interface CustomSection {
  id: string
  title: string
  content: string
}

export interface ResumeData {
  fullName: string
  title: string
  email: string
  phone: string
  summary: string
  experience: Experience[]
  education: Education[]
  skills: string[]
  customSections: CustomSection[]
}

// 模板相关接口
export interface SavedTemplate {
  id: string
  name: string
  data: ResumeData
  createTime: number
}

// 语言文本接口
export interface LanguageText {
  personalInfo: string
  fullName: string
  title: string
  email: string
  phone: string
  professionalSummary: string
  summary: string
  workExperience: string
  company: string
  position: string
  duration: string
  description: string
  education: string
  school: string
  degree: string
  year: string
  skills: string
  addExperience: string
  addEducation: string
  remove: string
  generatePDF: string
  generateWord: string
  reset: string
  manageTemplates: string
  saveAsTemplate: string
  templateName: string
  createTime: string
  actions: string
  load: string
  delete: string
  noTemplates: string
  generateImage: string
  customSections: string
  addCustomSection: string
  sectionTitle: string
  sectionContent: string
  importTemplates: string
  exportTemplates: string
}
