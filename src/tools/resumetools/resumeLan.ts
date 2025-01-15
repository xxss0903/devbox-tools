import type { LanguageText } from '@/types/resume'

// 语言文本定义
export interface LanguageText {
  personalInfo: string
  fullName: string
  title: string
  email: string
  phone: string
  github: string
  linkedin: string
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
  remove: string
  addExperience: string
  addEducation: string
  generatePDF: string
  generateWord: string
  generateImage: string
  reset: string
  customSections: string
  addCustomSection: string
  sectionTitle: string
  sectionContent: string
  manageTemplates: string
  templateName: string
  createTime: string
  actions: string
  load: string
  delete: string
  noTemplates: string
  saveAsTemplate: string
}

export const languageTexts: Record<'en' | 'zh', LanguageText> = {
  en: {
    personalInfo: 'Personal Information',
    fullName: 'Full Name',
    title: 'Title',
    email: 'Email',
    phone: 'Phone',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    professionalSummary: 'Professional Summary',
    summary: 'Summary',
    workExperience: 'Work Experience',
    company: 'Company',
    position: 'Position',
    duration: 'Duration',
    description: 'Description',
    education: 'Education',
    school: 'School',
    degree: 'Degree',
    year: 'Year',
    skills: 'Skills',
    remove: 'Remove',
    addExperience: 'Add Experience',
    addEducation: 'Add Education',
    generatePDF: 'Generate PDF',
    generateWord: 'Generate Word',
    generateImage: 'Save as Image',
    reset: 'Reset',
    customSections: '',
    addCustomSection: 'Add Custom Section',
    sectionTitle: 'Section Title',
    sectionContent: 'Section Content',
    manageTemplates: 'Manage Templates',
    templateName: 'Template Name',
    createTime: 'Create Time',
    actions: 'Actions',
    load: 'Load',
    delete: 'Delete',
    noTemplates: 'No templates yet',
    saveAsTemplate: 'Save as Template'
  },
  zh: {
    personalInfo: '个人信息',
    fullName: '姓名',
    title: '职位',
    email: '邮箱',
    phone: '电话',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    professionalSummary: '专业总结',
    summary: '总结',
    workExperience: '工作经验',
    company: '公司',
    position: '职位',
    duration: '时间',
    description: '描述',
    education: '教育经历',
    school: '学校',
    degree: '学位',
    year: '年份',
    skills: '技能',
    remove: '删除',
    addExperience: '添加工作经验',
    addEducation: '添加教育经历',
    generatePDF: '生成PDF',
    generateWord: '生成Word',
    generateImage: '保存为图片',
    reset: '重置',
    customSections: '',
    addCustomSection: '添加自定义模块',
    sectionTitle: '模块标题',
    sectionContent: '模块内容',
    manageTemplates: '管理模板',
    templateName: '模板名称',
    createTime: '创建时间',
    actions: '操作',
    load: '加载',
    delete: '删除',
    noTemplates: '暂无模板',
    saveAsTemplate: '保存为模板'
  }
}
