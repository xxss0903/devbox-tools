<template>
  <div class="resume-builder">
    <div class="resume-form">
      <div class="header">
        <h2>Resume Builder</h2>
        <el-button @click="toggleLanguage">
          {{ currentLang === 'en' ? '切换到中文' : 'Switch to English' }}
        </el-button>
      </div>

      <div class="form-section">
        <h3>{{ t.personalInfo }}</h3>
        <el-form :model="resumeData" label-width="120px">
          <el-form-item :label="t.fullName">
            <el-input v-model="resumeData.fullName" :placeholder="currentLang === 'en' ? 'e.g. John Doe' : '例如：张三'"></el-input>
          </el-form-item>
          <el-form-item :label="t.title">
            <el-input v-model="resumeData.title" :placeholder="currentLang === 'en' ? 'e.g. Software Engineer' : '例如：软件工程师'"></el-input>
          </el-form-item>
          <el-form-item :label="t.email">
            <el-input v-model="resumeData.email" :placeholder="currentLang === 'en' ? 'e.g. john@example.com' : '例如：zhangsan@example.com'"></el-input>
          </el-form-item>
          <el-form-item :label="t.phone">
            <el-input v-model="resumeData.phone" :placeholder="currentLang === 'en' ? 'e.g. +1 234 567 8900' : '例如：+86 123 4567 8900'"></el-input>
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
              :placeholder="currentLang === 'en' ? 'Brief professional summary...' : '简短的专业总结...'"
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
              <el-input
                type="textarea"
                v-model="exp.description"
                :rows="3"
              ></el-input>
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
              <el-option
                v-for="skill in skillOptions"
                :key="skill"
                :label="skill"
                :value="skill"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <div class="actions">
        <el-button type="primary" @click="generatePDF">{{ t.generatePDF }}</el-button>
        <el-button type="primary" @click="generateWord">{{ t.generateWord }}</el-button>
        <el-button @click="resetForm">{{ t.reset }}</el-button>
      </div>
    </div>

    <div class="resume-preview">
      <resume-template :data="resumeData" :lang="currentLang"></resume-template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import ResumeTemplate from './ResumeTemplate.vue'
import html2pdf from 'html2pdf.js'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'

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
  'Agile',
]

const resumeData = reactive<ResumeData>({
  fullName: '',
  title: '',
  email: '',
  phone: '',
  summary: '',
  experience: [],
  education: [],
  skills: [],
})

const addExperience = () => {
  resumeData.experience.push({
    company: '',
    position: '',
    duration: '',
    description: '',
  })
}

const removeExperience = (index: number) => {
  resumeData.experience.splice(index, 1)
}

const addEducation = () => {
  resumeData.education.push({
    school: '',
    degree: '',
    year: '',
  })
}

const removeEducation = (index: number) => {
  resumeData.education.splice(index, 1)
}

const generatePDF = async () => {
  const element = document.querySelector('.resume-preview')
  const opt = {
    margin: 1,
    filename: `${resumeData.fullName.replace(/\s+/g, '_')}_resume.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
  }

  try {
    await html2pdf().set(opt).from(element).save()
  } catch (error) {
    console.error('Error generating PDF:', error)
  }
}

const generateWord = async () => {
  try {
    // 创建文档
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // 个人信息
          new Paragraph({
            text: resumeData.fullName,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: resumeData.title,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '📧 ' + resumeData.email }),
              new TextRun({ text: '\n📱 ' + resumeData.phone }),
            ],
            alignment: AlignmentType.CENTER,
          }),

          // 专业总结
          new Paragraph({
            text: t.value.professionalSummary,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
          }),
          new Paragraph({
            text: resumeData.summary,
          }),

          // 工作经验
          new Paragraph({
            text: t.value.workExperience,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
          }),
          ...resumeData.experience.map(exp => [
            new Paragraph({
              children: [
                new TextRun({ text: exp.position, bold: true }),
                new TextRun({ text: currentLang.value === 'en' ? ' at ' : ' @ ' }),
                new TextRun({ text: exp.company, bold: true }),
                new TextRun({ text: ' | ' + exp.duration }),
              ],
              spacing: { before: 200 },
            }),
            new Paragraph({
              text: exp.description,
            }),
          ]).flat(),

          // 教育经历
          new Paragraph({
            text: t.value.education,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
          }),
          ...resumeData.education.map(edu => 
            new Paragraph({
              children: [
                new TextRun({ text: edu.school, bold: true }),
                new TextRun({ text: ' | ' }),
                new TextRun({ text: edu.degree }),
                new TextRun({ text: ' | ' + edu.year }),
              ],
              spacing: { before: 200 },
            }),
          ),

          // 技能
          new Paragraph({
            text: t.value.skills,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
          }),
          new Paragraph({
            text: resumeData.skills.join(', '),
          }),
        ],
      }],
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
    skills: [],
  })
}

// 添加语言相关的接口和常量
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
}

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
    reset: 'Reset'
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
    reset: '重置'
  }
}

// 添加当前语言状态
const currentLang = ref<'en' | 'zh'>('en')
const t = computed(() => languageTexts[currentLang.value])

// 切换语言函数
const toggleLanguage = () => {
  currentLang.value = currentLang.value === 'en' ? 'zh' : 'en'
}
</script>

<style scoped>
.resume-builder {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.resume-form {
  flex: 1;
  max-width: 600px;
}

.resume-preview {
  flex: 1;
  position: sticky;
  top: 2rem;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
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

.actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
}

h2 {
  margin-bottom: 2rem;
}

h3 {
  margin-bottom: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
</style> 