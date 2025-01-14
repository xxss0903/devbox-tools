<template>
  <div class="resume-template">
    <div class="header">
      <h1>{{ data.fullName }}</h1>
      <h2>{{ data.title }}</h2>
      <div class="contact-info">
        <span v-if="data.email">
          <i class="el-icon-message"></i>
          {{ data.email }}
        </span>
        <span v-if="data.phone">
          <i class="el-icon-phone"></i>
          {{ data.phone }}
        </span>
      </div>
    </div>

    <div class="section" v-if="data.summary">
      <h3>{{ t.professionalSummary }}</h3>
      <p>{{ data.summary }}</p>
    </div>

    <div class="section" v-if="data.experience && data.experience.length">
      <h3>{{ t.workExperience }}</h3>
      <div class="experience-item" v-for="(exp, index) in data.experience" :key="index">
        <div class="experience-header">
          <h4>{{ exp.position }}</h4>
          <span class="company">{{ exp.company }}</span>
          <span class="duration">{{ exp.duration }}</span>
        </div>
        <p class="description">{{ exp.description }}</p>
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

interface LanguageText {
  professionalSummary: string
  workExperience: string
  education: string
  skills: string
}

const languageTexts: Record<'en' | 'zh', LanguageText> = {
  en: {
    professionalSummary: 'Professional Summary',
    workExperience: 'Work Experience',
    education: 'Education',
    skills: 'Skills'
  },
  zh: {
    professionalSummary: '专业总结',
    workExperience: '工作经验',
    education: '教育经历',
    skills: '技能'
  }
}

const props = defineProps<{
  data: ResumeData
  lang: 'en' | 'zh'
}>()

const t = computed(() => languageTexts[props.lang])
</script>

<style scoped>
.resume-template {
  padding: 10mm;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
}

.header {
  text-align: center;
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
  gap: 1rem;
  color: #34495e;
}

.section {
  margin-bottom: 2rem;
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
  margin-bottom: 0.5rem;
}

.experience-header h4 {
  margin: 0;
  color: #2c3e50;
}

.company {
  font-weight: bold;
  color: #34495e;
}

.duration {
  color: #7f8c8d;
  margin-left: 1rem;
}

.description {
  color: #34495e;
  line-height: 1.5;
  margin: 0.5rem 0;
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
}

.skill-tag {
  background: #3498db;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.9rem;
}

@media print {
  .resume-template {
    box-shadow: none;
    padding: 0;
  }
}
</style>
