<template>
  <div class="export-buttons" v-if="showExportButtons">
      <el-button type="primary" @click="$emit('generate-pdf')">
        {{ lang === 'en' ? 'Export PDF' : '导出PDF' }}
      </el-button>
    </div>
  <div class="resume-template">
    <div class="top-content">
      <div class="header">
        <h1>{{ data.fullName }}</h1>
        <h2>{{ data.title }}</h2>
        <div class="contact-info">
          <a v-if="data.email" :href="formatEmailUrl(data.email)" class="contact-link">
            <i class="fas fa-envelope"></i> {{ data.email }}
          </a>
          <span class="contact-separator" v-if="data.email && data.phone">|</span>
          <span v-if="data.phone"> <i class="fas fa-phone"></i> {{ data.phone }} </span>
          <span class="contact-separator" v-if="(data.email || data.phone) && data.github">|</span>
          <a
            v-if="data.github"
            :href="formatGithubUrl(data.github)"
            target="_blank"
            class="contact-link"
          >
            <i class="fab fa-github"></i> {{ data.github }}
          </a>
          <span
            class="contact-separator"
            v-if="(data.email || data.phone || data.github) && data.linkedin"
            >|</span
          >
          <a
            v-if="data.linkedin"
            :href="formatLinkedinUrl(data.linkedin)"
            target="_blank"
            class="contact-link"
          >
            <i class="fab fa-linkedin"></i> {{ data.linkedin }}
          </a>
        </div>
      </div>

      <div class="section summary-section" v-if="data.summary">
        <h3>{{ t.professionalSummary }}</h3>
        <div class="markdown-content" v-html="renderMarkdown(data.summary)"></div>
      </div>
    </div>

    <div class="section" v-if="data.experience && data.experience.length">
      <h3>{{ t.workExperience }}</h3>
      <div class="experience-item" v-for="(exp, index) in data.experience" :key="index">
        <div class="experience-header">
          <h4>{{ exp.position }}</h4>
          <div class="company-info">
            <span class="company">{{ exp.company }}</span>
            <span class="duration">{{ exp.duration }}</span>
          </div>
        </div>
        <div class="markdown-content" v-html="renderMarkdown(exp.description)"></div>
      </div>
    </div>

    <div class="section" v-if="data.education && data.education.length">
      <h3>{{ t.education }}</h3>
      <div class="education-item" v-for="(edu, index) in data.education" :key="index">
        <h4>{{ edu.school }}</h4>
        <div class="education-details">
          <span>{{ edu.degree }}</span>
          <span class="year">{{ edu.year }}</span>
        </div>
      </div>
    </div>

    <div class="section" v-if="data.skills && data.skills.length">
      <h3>{{ t.skills }}</h3>
      <div class="skills-container">
        <span class="skill-tag" v-for="skill in data.skills" :key="skill">
          {{ skill }}
        </span>
      </div>
    </div>
    <div class="section" v-if="data.customSections && data.customSections.length">
      <h3>{{ t.customSections }}</h3>
      <div class="custom-section-item" v-for="(section, index) in data.customSections" :key="index">
        <h4>{{ section.title }}</h4>
        <div class="markdown-content" v-html="renderMarkdown(section.content)"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'

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
  github?: string
  linkedin?: string
  summary: string
  experience: Experience[]
  education: Education[]
  skills: string[]
  customSections: CustomSection[]
}

interface LanguageText {
  professionalSummary: string
  workExperience: string
  education: string
  skills: string
  customSections: string
  addCustomSection: string
  sectionTitle: string
  sectionContent: string
}

interface CustomSection {
  title: string
  content: string
}

const languageTexts: Record<'en' | 'zh', LanguageText> = {
  en: {
    professionalSummary: 'Professional Summary',
    workExperience: 'Work Experience',
    education: 'Education',
    skills: 'Skills',
    customSections: '',
    addCustomSection: 'Add Custom Section',
    sectionTitle: 'Section Title',
    sectionContent: 'Section Content'
  },
  zh: {
    professionalSummary: '专业总结',
    workExperience: '工作经验',
    education: '教育经历',
    skills: '技能',
    customSections: '',
    addCustomSection: '添加自定义模块',
    sectionTitle: '模块标题',
    sectionContent: '模块内容'
  }
}

const props = withDefaults(defineProps<{
  data: ResumeData
  lang: 'en' | 'zh'
  showExportButtons?: boolean
}>(), {
  showExportButtons: true
})

defineEmits<{
  (e: 'generate-pdf'): void
  (e: 'generate-word'): void
  (e: 'generate-image'): void
}>()

const t = computed(() => languageTexts[props.lang])

const formatGithubUrl = (github: string) => {
  if (!github) return ''
  return github.startsWith('http')
    ? github
    : `https://github.com/${github.replace('github.com/', '')}`
}

const formatLinkedinUrl = (linkedin: string) => {
  if (!linkedin) return ''
  return linkedin.startsWith('http')
    ? linkedin
    : `https://www.linkedin.com/in/${linkedin.replace('linkedin.com/in/', '')}`
}

const formatEmailUrl = (email: string) => {
  return `mailto:${email}`
}

const md = new MarkdownIt({
  breaks: true,
  linkify: true
})

const renderMarkdown = (text: string) => {
  if (!text) return ''
  const hasMarkdown = /[#*`\[\]\-\n]/.test(text)
  return hasMarkdown ? md.render(text) : text
}
</script>

<style scoped>
.resume-template {
  width: 210mm;
  min-height: 297mm;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
  padding: 20mm;
  margin: 0 auto;
  box-sizing: border-box;
  position: relative;
}

.top-content {
  page-break-inside: avoid;
  page-break-after: auto;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.summary-section {
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
  font-size: 2rem;
  color: #2c3e50;
}

.header h2 {
  margin: 0.5rem 0;
  font-size: 1.2rem;
  color: #7f8c8d;
}

.contact-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.contact-link {
  color: #2c3e50;
  text-decoration: none;
  transition: color 0.2s;
}

.contact-link:hover {
  color: #409eff;
}

.contact-separator {
  color: #909399;
  margin: 0 0.5rem;
}

.section {
  margin-bottom: 2rem;
}

.section:first-of-type {
  page-break-before: avoid;
  page-break-after: avoid;
  page-break-inside: avoid;
}

.section h3 {
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.experience-item,
.education-item {
  margin-bottom: 1.5rem;
}

.experience-header {
  margin-bottom: 0.8rem;
  line-height: 1.6;
}

.experience-header h4 {
  margin: 0 0 0.3rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  line-height: 1.6;
}

.company {
  font-weight: bold;
  color: #34495e;
}

.duration {
  color: #7f8c8d;
}

.description {
  color: #34495e;
  line-height: 1.6;
}

.description p {
  margin: 0.5rem 0;
  padding-left: 1rem;
  text-align: left;
}

.education-details {
  display: flex;
  justify-content: space-between;
  color: #34495e;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  page-break-inside: avoid;
}

.skill-tag {
  background: #3498db;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.9rem;
}

.custom-section-item {
  margin-bottom: 1.5rem;
  page-break-inside: avoid;
}

.custom-section-item h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.custom-section-item .section-content {
  color: #34495e;
  line-height: 1.6;
}

.custom-section-item .section-content p {
  margin: 0.5rem 0;
  padding-left: 1rem;
  text-align: left;
}

@media print {
  .resume-template {
    box-shadow: none;
    width: 210mm;
    min-height: 297mm;
    padding: 20mm;
    margin: 0;
  }
}

.export-buttons {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  gap: 0.5rem;
}

.markdown-content {
  color: #34495e;
  line-height: 1.6;
}

.markdown-content :deep(h1) {
  font-size: 1.5rem;
  margin: 1rem 0;
}

.markdown-content :deep(h2) {
  font-size: 1.3rem;
  margin: 0.8rem 0;
}

.markdown-content :deep(h3) {
  font-size: 1.1rem;
  margin: 0.6rem 0;
}

.markdown-content :deep(p) {
  margin: 0.5rem 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.markdown-content :deep(li) {
  margin: 0.3rem 0;
}

.markdown-content :deep(code) {
  background-color: #f5f7fa;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background-color: #f5f7fa;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #3498db;
  margin: 0.5rem 0;
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
}

.markdown-content :deep(a) {
  color: #3498db;
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.5rem 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #ddd;
  padding: 0.5rem;
  text-align: left;
}

.markdown-content :deep(th) {
  background-color: #f5f7fa;
}
</style>
