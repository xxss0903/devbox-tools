<template>
  <div class="resume-builder">
    <div class="resume-form">
      <div class="header">
        <div class="header-left">
          <h2>Resume Builder</h2>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showPreview">
            {{ currentLang === 'en' ? 'Preview' : '预览' }}
          </el-button>
          <el-button type="primary" @click="generatePDF">{{ t.generatePDF }}</el-button>
          <el-button type="primary" @click="generateWord">{{ t.generateWord }}</el-button>
          <el-button type="primary" @click="generateImage">{{ t.generateImage }}</el-button>
          <el-button type="success" @click="saveAsTemplate">{{ t.saveAsTemplate }}</el-button>
          <el-button @click="resetForm">{{ t.reset }}</el-button>
          <el-divider direction="vertical" />
          <el-button @click="toggleLanguage">
            {{ currentLang === 'en' ? '切换到中文' : 'Switch to English' }}
          </el-button>
          <el-button @click="showTemplateDialog = true">
            {{ t.manageTemplates }}
          </el-button>
        </div>
      </div>

      <div class="form-section">
        <h3>{{ t.personalInfo }}</h3>
        <el-form :model="resumeData" label-width="120px">
          <el-form-item :label="t.fullName">
            <el-input
              v-model="resumeData.fullName"
              :placeholder="currentLang === 'en' ? 'e.g. John Doe' : '例如：张三'"
            ></el-input>
          </el-form-item>
          <el-form-item :label="t.title">
            <el-input
              v-model="resumeData.title"
              :placeholder="currentLang === 'en' ? 'e.g. Software Engineer' : '例如：软件工程师'"
            ></el-input>
          </el-form-item>
          <el-form-item :label="t.email">
            <el-input
              v-model="resumeData.email"
              :placeholder="
                currentLang === 'en' ? 'e.g. john@example.com' : '例如：zhangsan@example.com'
              "
            ></el-input>
          </el-form-item>
          <el-form-item :label="t.phone">
            <el-input
              v-model="resumeData.phone"
              :placeholder="
                currentLang === 'en' ? 'e.g. +1 234 567 8900' : '例如：+86 123 4567 8900'
              "
            ></el-input>
          </el-form-item>
        </el-form>
      </div>

      <div class="form-section">
        <h3>{{ t.professionalSummary }}</h3>
        <el-form :model="resumeData" label-width="120px">
          <el-form-item :label="t.summary">
            <el-input
              type="textarea"
              v-model="resumeData.summary"
              :rows="4"
              :placeholder="
                currentLang === 'en' ? 'Brief professional summary...' : '简短的专业总结...'
              "
            ></el-input>
          </el-form-item>
        </el-form>
      </div>

      <div class="form-section">
        <h3>{{ t.workExperience }}</h3>
        <div v-for="(exp, index) in resumeData.experience" :key="index" class="experience-item">
          <el-form :model="exp" label-width="120px">
            <el-form-item :label="t.company">
              <el-input v-model="exp.company"></el-input>
            </el-form-item>
            <el-form-item :label="t.position">
              <el-input v-model="exp.position"></el-input>
            </el-form-item>
            <el-form-item :label="t.duration">
              <el-input v-model="exp.duration"></el-input>
            </el-form-item>
            <el-form-item :label="t.description">
              <el-input type="textarea" v-model="exp.description" :rows="3"></el-input>
            </el-form-item>
          </el-form>
          <el-button type="danger" @click="removeExperience(index)">{{ t.remove }}</el-button>
        </div>
        <el-button type="primary" @click="addExperience">{{ t.addExperience }}</el-button>
      </div>

      <div class="form-section">
        <h3>{{ t.education }}</h3>
        <div v-for="(edu, index) in resumeData.education" :key="index" class="education-item">
          <el-form :model="edu" label-width="120px">
            <el-form-item :label="t.school">
              <el-input v-model="edu.school"></el-input>
            </el-form-item>
            <el-form-item :label="t.degree">
              <el-input v-model="edu.degree"></el-input>
            </el-form-item>
            <el-form-item :label="t.year">
              <el-input v-model="edu.year"></el-input>
            </el-form-item>
          </el-form>
          <el-button type="danger" @click="removeEducation(index)">{{ t.remove }}</el-button>
        </div>
        <el-button type="primary" @click="addEducation">{{ t.addEducation }}</el-button>
      </div>

      <div class="form-section">
        <h3>{{ t.skills }}</h3>
        <el-form :model="resumeData" label-width="120px">
          <el-form-item :label="t.skills">
            <el-select
              v-model="resumeData.skills"
              multiple
              filterable
              allow-create
              default-first-option
              :placeholder="currentLang === 'en' ? 'Add skills' : '添加技能'"
            >
              <el-option v-for="skill in skillOptions" :key="skill" :label="skill" :value="skill">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="resume-preview">
      <resume-template :data="resumeData" :lang="currentLang"></resume-template>
    </div>

    <!-- 模板管理对话框 -->
    <el-dialog v-model="showTemplateDialog" :title="t.manageTemplates" width="60%">
      <el-table v-if="templates.length > 0" :data="templates" style="width: 100%">
        <el-table-column :label="t.templateName" prop="name" />
        <el-table-column :label="t.createTime" width="200">
          <template #default="scope">
            {{ new Date(scope.row.createTime).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column :label="t.actions" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" @click="loadTemplate(scope.row)">
              {{ t.load }}
            </el-button>
            <el-button type="danger" size="small" @click="deleteTemplate(scope.row)">
              {{ t.delete }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-else class="no-templates">
        {{ t.noTemplates }}
      </div>
    </el-dialog>

    <!-- 添加预览弹窗 -->
    <el-dialog
      v-model="showPreviewDialog"
      :title="currentLang === 'en' ? 'Resume Preview' : '简历预览'"
      width="90%"
      :fullscreen="true"
      :show-close="true"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
      class="preview-dialog"
    >
      <div class="preview-container">
        <resume-template :data="resumeData" :lang="currentLang"></resume-template>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import ResumeTemplate from './ResumeTemplate.vue'
import html2pdf from 'html2pdf.js'
import html2canvas from 'html2canvas'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import { ElMessageBox } from 'element-plus'

// 基础接口定义
interface Experience {
  company: string
  position: string
  duration: string
  description: string
}

interface Education {
  school: string
  degree: string
  year: string
}

interface ResumeData {
  fullName: string
  title: string
  email: string
  phone: string
  summary: string
  experience: Experience[]
  education: Education[]
  skills: string[]
}

// 模板相关接口
interface SavedTemplate {
  id: string
  name: string
  data: ResumeData
  createTime: number
}

// 语言文本接口
interface LanguageText {
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
}

// 语言文本定义
const languageTexts: Record<'en' | 'zh', LanguageText> = {
  en: {
    personalInfo: 'Personal Information',
    fullName: 'Full Name',
    title: 'Title',
    email: 'Email',
    phone: 'Phone',
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
    addExperience: 'Add Experience',
    addEducation: 'Add Education',
    remove: 'Remove',
    generatePDF: 'Generate PDF',
    generateWord: 'Generate Word',
    reset: 'Reset',
    manageTemplates: 'Manage Templates',
    saveAsTemplate: 'Save as Template',
    templateName: 'Template Name',
    createTime: 'Create Time',
    actions: 'Actions',
    load: 'Load',
    delete: 'Delete',
    noTemplates: 'No templates yet',
    generateImage: 'Save as Image'
  },
  zh: {
    personalInfo: '个人信息',
    fullName: '姓名',
    title: '职位',
    email: '邮箱',
    phone: '电话',
    professionalSummary: '专业总结',
    summary: '总结',
    workExperience: '工作经验',
    company: '公司',
    position: '职位',
    duration: '时间段',
    description: '描述',
    education: '教育经历',
    school: '学校',
    degree: '学位',
    year: '年份',
    skills: '技能',
    addExperience: '添加工作经验',
    addEducation: '添加教育经历',
    remove: '删除',
    generatePDF: '生成PDF',
    generateWord: '生成Word',
    reset: '重置',
    manageTemplates: '管理模板',
    saveAsTemplate: '保存为模板',
    templateName: '模板名称',
    createTime: '创建时间',
    actions: '操作',
    load: '加载',
    delete: '删除',
    noTemplates: '暂无模板',
    generateImage: '保存为图片'
  }
}

// 组件状态
const currentLang = ref<'en' | 'zh'>('en')
const t = computed(() => languageTexts[currentLang.value])
const templates = ref<SavedTemplate[]>([])
const showTemplateDialog = ref(false)
const showPreviewDialog = ref(false)

const skillOptions = [
  'JavaScript',
  'TypeScript',
  'Vue.js',
  'React',
  'Node.js',
  'Python',
  'Java',
  'SQL',
  'Git',
  'Agile'
]

const resumeData = reactive<ResumeData>({
  fullName: '',
  title: '',
  email: '',
  phone: '',
  summary: '',
  experience: [],
  education: [],
  skills: []
})

const addExperience = () => {
  resumeData.experience.push({
    company: '',
    position: '',
    duration: '',
    description: ''
  })
}

const removeExperience = (index: number) => {
  resumeData.experience.splice(index, 1)
}

const addEducation = () => {
  resumeData.education.push({
    school: '',
    degree: '',
    year: ''
  })
}

const removeEducation = (index: number) => {
  resumeData.education.splice(index, 1)
}

const generatePDF = async () => {
  const element = document.querySelector('.resume-template')
  const opt = {
    margin: 0,
    filename: `${resumeData.fullName.replace(/\s+/g, '_')}_resume.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }

  try {
    await html2pdf().set(opt).from(element).save()
  } catch (error) {
    console.error('Error generating PDF:', error)
    ElMessageBox.alert(
      currentLang.value === 'en' ? 'Failed to generate PDF' : '生成PDF失败',
      currentLang.value === 'en' ? 'Error' : '错误',
      { type: 'error' }
    )
  }
}

const generateWord = async () => {
  try {
    // 创建文档
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // 个人信息
            new Paragraph({
              text: resumeData.fullName,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              text: resumeData.title,
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '📧 ' + resumeData.email }),
                new TextRun({ text: '\n📱 ' + resumeData.phone })
              ],
              alignment: AlignmentType.CENTER
            }),

            // 专业总结
            new Paragraph({
              text: t.value.professionalSummary,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400 }
            }),
            new Paragraph({
              text: resumeData.summary
            }),

            // 工作经验
            new Paragraph({
              text: t.value.workExperience,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400 }
            }),
            ...resumeData.experience
              .map((exp) => [
                new Paragraph({
                  children: [
                    new TextRun({ text: exp.position, bold: true }),
                    new TextRun({ text: currentLang.value === 'en' ? ' at ' : ' @ ' }),
                    new TextRun({ text: exp.company, bold: true }),
                    new TextRun({ text: ' | ' + exp.duration })
                  ],
                  spacing: { before: 200 }
                }),
                new Paragraph({
                  text: exp.description
                })
              ])
              .flat(),

            // 教育经历
            new Paragraph({
              text: t.value.education,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400 }
            }),
            ...resumeData.education.map(
              (edu) =>
                new Paragraph({
                  children: [
                    new TextRun({ text: edu.school, bold: true }),
                    new TextRun({ text: ' | ' }),
                    new TextRun({ text: edu.degree }),
                    new TextRun({ text: ' | ' + edu.year })
                  ],
                  spacing: { before: 200 }
                })
            ),

            // 技能
            new Paragraph({
              text: t.value.skills,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400 }
            }),
            new Paragraph({
              text: resumeData.skills.join(', ')
            })
          ]
        }
      ]
    })

    // 生成文档
    const blob = await Packer.toBlob(doc)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${resumeData.fullName.replace(/\s+/g, '_')}_resume${currentLang.value === 'zh' ? '_中文' : ''}.docx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error generating Word document:', error)
  }
}

const resetForm = () => {
  Object.assign(resumeData, {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    summary: '',
    experience: [],
    education: [],
    skills: []
  })
}

// 添加默认模板数据
const seniorFrontendTemplate: SavedTemplate = {
  id: 'senior-frontend-template',
  name: 'Senior Frontend Engineer Template',
  createTime: Date.now(),
  data: {
    fullName: 'Alex Chen',
    title: 'Senior Frontend Engineer',
    email: 'alex.chen@example.com',
    phone: '+86 138 8888 8888',
    summary: `资深前端工程师，拥有8年 Web 开发经验。专注于构建高性能、可扩展的企业级应用。精通现代前端技术栈，具有丰富的大型项目架构经验。擅长团队管理和技术mentoring，推动过多个重要项目的技术改造和架构升级。`,
    experience: [
      {
        company: 'TechGiant Inc.',
        position: '高级前端工程师 / 技术负责人',
        duration: '2020 - 至今',
        description: `• 负责公司核心产品的前端架构设计和技术选型，将系统从 jQuery 重构为现代化的 Vue.js 架构
• 设计并实现了基于 Vite 的微前端解决方案，支持多团队并行开发
• 建立了完整的前端工程化体系，包括自动化测试、CI/CD、性能监控等
• 优化前端性能，使页面加载时间减少 50%，首屏渲染时间降低到 1.5s
• 管理 10 人的前端团队，制定技术规范，推动代码质量提升`
      },
      {
        company: 'InnovateSoft',
        position: '前端开发工程师',
        duration: '2018 - 2020',
        description: `• 负责企业级 SaaS 平台的前端开发，使用 Vue.js + TypeScript 技术栈
• 设计并实现了公司级别的组件库，提高了开发效率和产品一致性
• 引入 WebSocket 实现实时数据更新，优化用户体验
• 实现了复杂的数据可视化功能，使用 ECharts 展示大量实时数据`
      },
      {
        company: 'StartupTech',
        position: '前端开发工程师',
        duration: '2015 - 2018',
        description: `• 参与电商平台的前端开发，负责购物车和支付模块
• 使用 React 开发移动端 H5 页面，实现流畅的用户体验
• 优化网站 SEO，提升搜索引擎排名
• 实现了响应式设计，支持多种设备访问`
      }
    ],
    education: [
      {
        school: '清华大学',
        degree: '计算机科学与技术 硕士',
        year: '2015'
      },
      {
        school: '北京大学',
        degree: '软件工程 学士',
        year: '2012'
      }
    ],
    skills: [
      'JavaScript/TypeScript',
      'Vue.js/React',
      'Node.js',
      'Webpack/Vite',
      'Microservices',
      'CI/CD',
      'Performance Optimization',
      'Team Leadership',
      'System Architecture',
      'Testing (Jest/Cypress)'
    ]
  }
}

// 修改 loadTemplates 函数，添加默认模板
const loadTemplates = () => {
  const savedTemplates = localStorage.getItem('resumeTemplates')
  if (savedTemplates) {
    templates.value = JSON.parse(savedTemplates)
  }

  // 检查是否已存在默认模板
  const hasDefaultTemplate = templates.value.some((t) => t.id === seniorFrontendTemplate.id)
  if (!hasDefaultTemplate) {
    // 添加中文版本的模板
    const zhTemplate: SavedTemplate = {
      ...JSON.parse(JSON.stringify(seniorFrontendTemplate)),
      id: 'senior-frontend-template-zh',
      name: '资深前端工程师模板',
      data: {
        ...seniorFrontendTemplate.data,
        fullName: '陈明',
        title: '资深前端工程师',
        email: 'chen.ming@example.com',
        experience: seniorFrontendTemplate.data.experience.map((exp) => ({
          ...exp,
          position: exp.position
            .replace('高级前端工程师 / 技术负责人', '高级前端工程师 / 技术负责人')
            .replace('前端开发工程师', '前端开发工程师')
        }))
      }
    }

    templates.value.push(seniorFrontendTemplate, zhTemplate)
    saveTemplates()
  }
}

// 保存模板到localStorage
const saveTemplates = () => {
  localStorage.setItem('resumeTemplates', JSON.stringify(templates.value))
}

// 保存当前简历为模板
const saveAsTemplate = async () => {
  try {
    const { value: templateName } = await ElMessageBox.prompt(
      currentLang.value === 'en' ? 'Please enter template name' : '请输入模板名称',
      currentLang.value === 'en' ? 'Save as Template' : '保存为模板',
      {
        confirmButtonText: currentLang.value === 'en' ? 'Save' : '保存',
        cancelButtonText: currentLang.value === 'en' ? 'Cancel' : '取消'
      }
    )

    if (templateName) {
      const newTemplate: SavedTemplate = {
        id: Date.now().toString(),
        name: templateName,
        data: JSON.parse(JSON.stringify(resumeData)), // 深拷贝当前数据
        createTime: Date.now()
      }

      templates.value.push(newTemplate)
      saveTemplates()
      ElMessageBox.alert(
        currentLang.value === 'en' ? 'Template saved successfully' : '模板保存成功',
        currentLang.value === 'en' ? 'Success' : '成功',
        { type: 'success' }
      )
    }
  } catch (error) {
    // 用户取消操作
  }
}

// 加载模板
const loadTemplate = (template: SavedTemplate) => {
  ElMessageBox.confirm(
    currentLang.value === 'en'
      ? 'This will overwrite current content. Continue?'
      : '这将覆盖当前内容，是否继续？',
    currentLang.value === 'en' ? 'Warning' : '警告',
    {
      confirmButtonText: currentLang.value === 'en' ? 'Continue' : '继续',
      cancelButtonText: currentLang.value === 'en' ? 'Cancel' : '取消',
      type: 'warning'
    }
  )
    .then(() => {
      Object.assign(resumeData, JSON.parse(JSON.stringify(template.data))) // 深拷贝模板数据
      showTemplateDialog.value = false
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 删除模板
const deleteTemplate = (template: SavedTemplate) => {
  ElMessageBox.confirm(
    currentLang.value === 'en' ? 'Are you sure to delete this template?' : '确定要删除这个模板吗？',
    currentLang.value === 'en' ? 'Warning' : '警告',
    {
      confirmButtonText: currentLang.value === 'en' ? 'Delete' : '删除',
      cancelButtonText: currentLang.value === 'en' ? 'Cancel' : '取消',
      type: 'warning'
    }
  )
    .then(() => {
      const index = templates.value.findIndex((t) => t.id === template.id)
      if (index !== -1) {
        templates.value.splice(index, 1)
        saveTemplates()
        ElMessageBox.alert(
          currentLang.value === 'en' ? 'Template deleted successfully' : '模板删除成功',
          currentLang.value === 'en' ? 'Success' : '成功',
          { type: 'success' }
        )
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 修改 generateImage 函数
const generateImage = async () => {
  try {
    // 先打开预览对话框
    showPreviewDialog.value = true

    // 等待预览对话框内容渲染完成
    await nextTick()

    // 获取预览对话框中的简历内容
    const element = document.querySelector('.preview-container')
    if (!element) {
      throw new Error('预览内容未找到')
    }

    const canvas = await html2canvas(element, {
      scale: 1, // 不需要放大，因为预览已经是合适大小
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    // 将canvas转换为图片并下载
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = url
    link.download = `${resumeData.fullName.replace(/\s+/g, '_')}_resume${currentLang.value === 'zh' ? '_中文' : ''}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // 下载完成后关闭预览
    showPreviewDialog.value = false
  } catch (error) {
    console.error('生成图片时出错:', error)
    ElMessageBox.alert(
      currentLang.value === 'en' ? 'Failed to generate image' : '生成图片失败',
      currentLang.value === 'en' ? 'Error' : '错误',
      { type: 'error' }
    )
  }
}

// 在组件挂载时加载模板
onMounted(() => {
  loadTemplates()
})

// 切换语言函数
const toggleLanguage = () => {
  currentLang.value = currentLang.value === 'en' ? 'zh' : 'en'
}

const showPreview = () => {
  showPreviewDialog.value = true
}
</script>

<style scoped>
.resume-builder {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  max-width: 1800px;
  margin: 0 auto;
  min-height: calc(100vh - 4rem);
}

.resume-form {
  width: 600px;
  flex-shrink: 0;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 4rem);
  overflow-y: auto;
}

.resume-preview {
  flex: 1;
  position: sticky;
  top: 2rem;
  height: calc(100vh - 4rem);
  overflow-y: auto;
  padding: 1rem;
  background: #f0f2f5;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.resume-preview :deep(.resume-content) {
  transform-origin: top center;
  width: 794px;
  height: 1123px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  margin: 0 auto;
  overflow: hidden;
}

@media screen and (max-width: 1600px) {
  .resume-preview :deep(.resume-content) {
    transform: scale(0.4);
  }
}

@media screen and (max-width: 1400px) {
  .resume-preview :deep(.resume-content) {
    transform: scale(0.35);
  }
}

@media screen and (max-width: 1200px) {
  .resume-builder {
    flex-direction: column;
    align-items: center;
  }

  .resume-form {
    width: 100%;
    max-width: 600px;
  }

  .resume-preview {
    width: 100%;
    position: relative;
    top: 0;
    margin-top: 2rem;
    height: auto;
    min-height: 297mm;
  }

  .resume-preview :deep(.resume-content) {
    transform: scale(0.3);
  }
}

.form-section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
}

.experience-item,
.education-item {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  padding: 1rem;
  margin: -1rem -1rem 1rem -1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left h2 {
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.no-templates {
  text-align: center;
  padding: 2rem;
  color: #909399;
}

.preview-dialog {
  :deep(.el-dialog__body) {
    padding: 2rem;
    height: calc(100vh - 100px);
    overflow: auto;
    background: #f0f2f5;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  :deep(.el-dialog__header) {
    padding: 12px 20px;
    margin: 0;
    border-bottom: 1px solid #dcdfe6;
    background: white;
  }

  :deep(.el-dialog) {
    margin: 0 !important;
    height: 100vh;
    max-width: 100vw;
    display: flex;
    flex-direction: column;
  }
}

.preview-container {
  padding: 0;
  width: 210mm;
  min-height: 297mm;
  margin: 2rem auto;
  background: white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  position: relative;
}

.preview-container :deep(.resume-content) {
  width: 210mm;
  min-height: 297mm;
  padding: 20mm;
  background: white;
  box-sizing: border-box;
  position: relative;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  page-break-after: always;
}

.preview-container :deep(.resume-content:last-child) {
  margin-bottom: 0;
  page-break-after: avoid;
}

@media print {
  .preview-container {
    margin: 0;
    padding: 0;
    box-shadow: none;
  }

  .preview-container :deep(.resume-content) {
    margin: 0;
    box-shadow: none;
  }
}

@page {
  size: A4;
  margin: 0;
}
</style>
