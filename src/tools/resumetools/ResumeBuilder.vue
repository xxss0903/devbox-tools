<template>
  <div class="resume-builder">
    <div class="resume-form">
      <div class="header">
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
      <div class="form-section">
        <h3>{{ t.customSections }}</h3>

        <div
          v-for="(section, index) in resumeData.customSections"
          :key="section.id"
          class="custom-section-item"
        >
          <el-form :model="section" label-width="120px">
            <el-form-item :label="t.sectionTitle">
              <el-input
                v-model="section.title"
                :placeholder="currentLang === 'en' ? 'Enter section title' : '输入模块标题'"
              >
              </el-input>
            </el-form-item>

            <el-form-item :label="t.sectionContent">
              <el-input
                type="textarea"
                v-model="section.content"
                :rows="4"
                :placeholder="currentLang === 'en' ? 'Enter section content' : '输入模块内容'"
              >
              </el-input>
            </el-form-item>
          </el-form>

          <el-button type="danger" @click="removeCustomSection(index)">{{ t.remove }}</el-button>
        </div>
        <el-button type="primary" @click="addCustomSection">{{ t.addCustomSection }}</el-button>
      </div>
    </div>

    <!-- 模板管理对话框 -->
    <el-dialog v-model="showTemplateDialog" :title="t.manageTemplates" width="60%">
      <div class="template-actions">
        <el-button type="primary" @click="importTemplates">
          {{ currentLang === 'en' ? 'Import Templates' : '导入模板' }}
        </el-button>

        <el-button type="primary" @click="exportTemplates">
          {{ currentLang === 'en' ? 'Export Templates' : '导出模板' }}
        </el-button>
      </div>
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
import type { ResumeData, SavedTemplate } from '@/types/resume'
import { languageTexts } from './resumeLan'
import { seniorFrontendTemplate, frontendDevTemplate } from './resumeTemplateData'

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
  skills: [],
  customSections: []
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
  const element = document.querySelector('.resume-template') as HTMLDivElement
  if (!element) return

  // 保存原始 padding
  const originalPadding = element.style.padding

  try {
    // 临时设置 padding 为 0
    element.style.padding = '0'

    const opt = {
      margin: 10,
      filename: `${resumeData.fullName.replace(/\s+/g, '_')}_resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break',
        avoid: ['.no-break', 'tr', 'td']
      }
    }

    await html2pdf().set(opt).from(element).save()
  } catch (error) {
    console.error('Error generating PDF:', error)
    ElMessageBox.alert(
      currentLang.value === 'en' ? 'Failed to generate PDF' : '生成PDF失败',
      currentLang.value === 'en' ? 'Error' : '错误',
      { type: 'error' }
    )
  } finally {
    // 恢复原始 padding
    element.style.padding = originalPadding
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
            }),
            ...resumeData.customSections.map((section) => new Paragraph({ text: section.content }))
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

// 修改 loadTemplates 函数，添加默认模板
const loadTemplates = () => {
  const savedTemplates = localStorage.getItem('resumeTemplates')
  if (savedTemplates) {
    templates.value = JSON.parse(savedTemplates)
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
    const element = document.querySelector('.preview-container') as HTMLDivElement
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
  // 默认加载第一个模板
  if (templates.value.length > 0) {
    const defaultTemplate = templates.value[0]
    Object.assign(resumeData, JSON.parse(JSON.stringify(defaultTemplate.data)))
  } else {
    // 如果没有模板，直接加载默认的高级前端工程师模板
    Object.assign(resumeData, JSON.parse(JSON.stringify(seniorFrontendTemplate.data)))
  }
})

// 切换语言函数
const toggleLanguage = () => {
  currentLang.value = currentLang.value === 'en' ? 'zh' : 'en'
}

const showPreview = () => {
  showPreviewDialog.value = true
}

// 添加自定义模块的方法
const addCustomSection = () => {
  resumeData.customSections.push({
    id: Date.now().toString(),

    title: '',

    content: ''
  })
}

// 删除自定义模块的方法
const removeCustomSection = (index: number) => {
  resumeData.customSections.splice(index, 1)
}

// 添加导出模板的方法

const exportTemplates = () => {
  try {
    const templatesJson = JSON.stringify(templates.value, null, 2)
    const blob = new Blob([templatesJson], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `resume_templates_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting templates:', error)
    ElMessageBox.alert(
      currentLang.value === 'en' ? 'Failed to export templates' : '模板导出失败',

      currentLang.value === 'en' ? 'Error' : '错误',

      { type: 'error' }
    )
  }
}

// 添加导入模板的方法

const importTemplates = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    try {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const importedTemplates = JSON.parse(event.target?.result as string)
          // 确认是否覆盖现有模板
          await ElMessageBox.confirm(
            currentLang.value === 'en'
              ? 'Do you want to replace existing templates or merge with them?'
              : '是否要替换现有模板或与现有模板合并？',

            currentLang.value === 'en' ? 'Import Templates' : '导入模板',
            {
              confirmButtonText: currentLang.value === 'en' ? 'Replace' : '替换',

              cancelButtonText: currentLang.value === 'en' ? 'Merge' : '合并',

              type: 'warning'
            }
          )
            .then(() => {
              // 替换现有模板

              templates.value = importedTemplates
            })
            .catch(() => {
              // 合并模板

              templates.value = [...templates.value, ...importedTemplates]
            })
          saveTemplates()
          ElMessageBox.alert(
            currentLang.value === 'en' ? 'Templates imported successfully' : '模板导入成功',

            currentLang.value === 'en' ? 'Success' : '成功',

            { type: 'success' }
          )
        } catch (error) {
          throw new Error('Invalid template file format')
        }
      }

      reader.readAsText(file)
    } catch (error) {
      console.error('Error importing templates:', error)
      ElMessageBox.alert(
        currentLang.value === 'en' ? 'Failed to import templates' : '模板导入失败',
        currentLang.value === 'en' ? 'Error' : '错误',
        { type: 'error' }
      )
    }
  }

  input.click()
}
</script>

<style scoped>
.resume-builder {
  padding: 2rem;
  height: calc(100vh - 18rem);
  display: flex;
  flex-direction: column;
}

.resume-form {
  flex: 1;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  position: relative;
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
  height: 297mm;
  margin: 0 auto;
  background: white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  position: relative;
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

.custom-section-item {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
}

.template-actions {
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
</style>
