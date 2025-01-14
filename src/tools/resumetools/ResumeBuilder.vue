<template>
  <div class="resume-builder">
    <div class="resume-form">
      <h2>Resume Builder</h2>
      <div class="form-section">
        <h3>Personal Information</h3>
        <el-form :model="resumeData" label-width="120px">
          <el-form-item label="Full Name">
            <el-input v-model="resumeData.fullName" placeholder="e.g. John Doe"></el-input>
          </el-form-item>
          <el-form-item label="Title">
            <el-input v-model="resumeData.title" placeholder="e.g. Software Engineer"></el-input>
          </el-form-item>
          <el-form-item label="Email">
            <el-input v-model="resumeData.email" placeholder="e.g. john@example.com"></el-input>
          </el-form-item>
          <el-form-item label="Phone">
            <el-input v-model="resumeData.phone" placeholder="e.g. +1 234 567 8900"></el-input>
          </el-form-item>
        </el-form>
      </div>

      <div class="form-section">
        <h3>Professional Summary</h3>
        <el-form :model="resumeData" label-width="120px">
          <el-form-item label="Summary">
            <el-input
              type="textarea"
              v-model="resumeData.summary"
              :rows="4"
              placeholder="Brief professional summary..."
            ></el-input>
          </el-form-item>
        </el-form>
      </div>

      <div class="form-section">
        <h3>Work Experience</h3>
        <div v-for="(exp, index) in resumeData.experience" :key="index" class="experience-item">
          <el-form :model="exp" label-width="120px">
            <el-form-item label="Company">
              <el-input v-model="exp.company"></el-input>
            </el-form-item>
            <el-form-item label="Position">
              <el-input v-model="exp.position"></el-input>
            </el-form-item>
            <el-form-item label="Duration">
              <el-input v-model="exp.duration"></el-input>
            </el-form-item>
            <el-form-item label="Description">
              <el-input
                type="textarea"
                v-model="exp.description"
                :rows="3"
              ></el-input>
            </el-form-item>
          </el-form>
          <el-button type="danger" @click="removeExperience(index)">Remove</el-button>
        </div>
        <el-button type="primary" @click="addExperience">Add Experience</el-button>
      </div>

      <div class="form-section">
        <h3>Education</h3>
        <div v-for="(edu, index) in resumeData.education" :key="index" class="education-item">
          <el-form :model="edu" label-width="120px">
            <el-form-item label="School">
              <el-input v-model="edu.school"></el-input>
            </el-form-item>
            <el-form-item label="Degree">
              <el-input v-model="edu.degree"></el-input>
            </el-form-item>
            <el-form-item label="Year">
              <el-input v-model="edu.year"></el-input>
            </el-form-item>
          </el-form>
          <el-button type="danger" @click="removeEducation(index)">Remove</el-button>
        </div>
        <el-button type="primary" @click="addEducation">Add Education</el-button>
      </div>

      <div class="form-section">
        <h3>Skills</h3>
        <el-form :model="resumeData" label-width="120px">
          <el-form-item label="Skills">
            <el-select
              v-model="resumeData.skills"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="Add skills"
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
        <el-button type="primary" @click="generatePDF">Generate PDF</el-button>
        <el-button @click="resetForm">Reset</el-button>
      </div>
    </div>

    <div class="resume-preview">
      <resume-template :data="resumeData"></resume-template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import ResumeTemplate from './ResumeTemplate.vue'
import html2pdf from 'html2pdf.js'

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

const resumeData = reactive({
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
</style> 