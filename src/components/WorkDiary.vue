<template>
  <div class="work-diary-container">
    <div class="navigation-bar">
      <button class="back-button" @click="goBack">返回</button>
      <h2 class="detail-title">工作日记</h2>
    </div>
    <div class="work-diary-content">
      <div class="diary-form">
        <input v-model="date" type="date" class="date-input" />
        <QuillEditor
          v-model:content="content"
          :options="editorOptions"
          contentType="html"
          class="content-input"
        />
        <button @click="saveDiary" class="save-button">保存</button>
      </div>
      <div class="diary-list">
        <h3>历史记录</h3>
        <ul>
          <li v-for="entry in diaryEntries" :key="entry.id" @click="loadDiary(entry)">
            {{ entry.date }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

interface DiaryEntry {
  id?: number
  date: string
  content: string
}

declare global {
  interface Window {
    electronAPI: {
      saveDiaryEntry: (date: string, content: string) => Promise<void>
      getDiaryEntries: () => Promise<DiaryEntry[]>
      getDiaryEntryByDate: (date: string) => Promise<DiaryEntry | null>
    }
  }
}

const router = useRouter()
const date = ref(new Date().toISOString().split('T')[0])
const content = ref('')
const diaryEntries = ref<DiaryEntry[]>([])

const editorOptions = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ direction: 'rtl' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ['clean'],
      ['link', 'image', 'video'],
      ['todo']
    ]
  },
  placeholder: '请输入今天的工作内容和进度...'
}

const saveDiary = async () => {
  await window.electronAPI.saveDiaryEntry(date.value, content.value)
  await loadDiaryEntries()
}

const loadDiary = async (entry: DiaryEntry) => {
  const diaryEntry = await window.electronAPI.getDiaryEntryByDate(entry.date)
  if (diaryEntry) {
    date.value = diaryEntry.date
    content.value = diaryEntry.content
  }
}

const loadDiaryEntries = async () => {
  diaryEntries.value = await window.electronAPI.getDiaryEntries()
}

const goBack = () => {
  router.push({ name: 'Home' })
}

onMounted(async () => {
  await loadDiaryEntries()
})
</script>

<style scoped>
.work-diary-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.navigation-bar {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.back-button {
  padding: 8px 16px;
  background-color: #3498db;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.back-button:hover {
  background-color: #2980b9;
}

.detail-title {
  margin-left: 20px;
  font-size: 1.2em;
  color: #2c3e50;
}

.work-diary-content {
  flex: 1;
  display: flex;
  padding: 20px;
  overflow: hidden; /* 防止内容溢出 */
}

.diary-form {
  flex: 2;
  display: flex;
  flex-direction: column;
  margin-right: 20px;
  overflow-y: auto; /* 添加垂直滚动条 */
  max-height: calc(100vh - 100px); /* 设置最大高度，留出顶部导航栏的空间 */
}

.date-input {
  margin-bottom: 10px;
  padding: 5px;
}

.content-input {
  flex: 1; /* 让编辑器填充剩余空间 */
  min-height: 200px; /* 设置最小高度 */
  margin-bottom: 10px;
}

.save-button {
  padding: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
}

.diary-list {
  flex: 1;
  overflow-y: auto; /* 添加垂直滚动条 */
  max-height: calc(100vh - 100px); /* 设置最大高度，留出顶部导航栏的空间 */
}

.diary-list ul {
  list-style-type: none;
  padding: 0;
}

.diary-list li {
  cursor: pointer;
  padding: 5px;
  border-bottom: 1px solid #e9ecef;
}

.diary-list li:hover {
  background-color: #f8f9fa;
}
</style>
