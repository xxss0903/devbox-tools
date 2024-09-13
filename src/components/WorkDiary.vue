<template>
  <div class="work-diary-container">
    <div class="navigation-bar">
      <button class="back-button" @click="goBack">返回</button>
      <h2 class="detail-title">工作日记</h2>
      <button @click="saveDiary" class="save-button">保存</button>
    </div>
    <div class="work-diary-content">
      <div class="diary-form">
        <input v-model="date" type="date" class="date-input" />
        <div class="todo-list">
          <h3>待办事项</h3>
          <ul>
            <li v-for="(todo, index) in todos" :key="index">
              <input type="checkbox" v-model="todo.done" />
              <input v-model="todo.text" placeholder="输入待办事项" />
              <button @click="removeTodo(index)">删除</button>
            </li>
          </ul>
          <button @click="addTodo">添加待办事项</button>
        </div>
        <QuillEditor
          v-model:content="content"
          :options="editorOptions"
          contentType="html"
          class="content-input"
        />
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
  todos: TodoItem[]
}

interface TodoItem {
  text: string
  done: boolean
}

interface IElectronAPI {
  saveDiaryEntry: (date: string, content: string, todos: TodoItem[]) => Promise<void>
  getDiaryEntries: () => Promise<DiaryEntry[]>
  getDiaryEntryByDate: (date: string) => Promise<DiaryEntry | null>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}

const router = useRouter()
const date = ref(new Date().toISOString().split('T')[0])
const content = ref('')
const diaryEntries = ref<DiaryEntry[]>([])
const todos = ref<TodoItem[]>([])

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
  await window.electronAPI.saveDiaryEntry(date.value, content.value, todos.value)
  await loadDiaryEntries()
}

const loadDiary = async (entry: DiaryEntry) => {
  const diaryEntry = await window.electronAPI.getDiaryEntryByDate(entry.date)
  if (diaryEntry) {
    date.value = diaryEntry.date
    content.value = diaryEntry.content
    todos.value = diaryEntry.todos || []
  }
}

const loadDiaryEntries = async () => {
  diaryEntries.value = await window.electronAPI.getDiaryEntries()
}

const goBack = () => {
  router.push({ name: 'Home' })
}

const addTodo = () => {
  todos.value.push({ text: '', done: false })
}

const removeTodo = (index: number) => {
  todos.value.splice(index, 1)
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
  overflow: hidden;
}

.navigation-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.back-button,
.save-button {
  padding: 8px 16px;
  background-color: #3498db;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.back-button:hover,
.save-button:hover {
  background-color: #2980b9;
}

.save-button {
  background-color: #4caf50;
}

.save-button:hover {
  background-color: #45a049;
}

.detail-title {
  font-size: 1.2em;
  color: #2c3e50;
}

.work-diary-content {
  display: flex;
  padding: 20px;
  overflow: hidden;
  height: 500px;
}

.diary-form {
  flex: 2;
  display: flex;
  flex-direction: column;
  margin-right: 20px;
  overflow-y: auto;
  max-height: calc(100vh - 80px);
}

.date-input {
  margin-bottom: 10px;
  padding: 5px;
}

.content-input {
  flex: 1;
  min-height: 200px;
  max-height: 400px; /* 添加最大高度限制 */
  overflow-y: auto;
}

.diary-list {
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 80px);
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

.todo-list {
  margin-bottom: 20px;
}

.todo-list ul {
  list-style-type: none;
  padding: 0;
}

.todo-list li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.todo-list input[type='checkbox'] {
  margin-right: 10px;
}

.todo-list input[type='text'] {
  flex-grow: 1;
  margin-right: 10px;
  padding: 5px;
}

.todo-list button {
  padding: 5px 10px;
  background-color: #f44336;
  color: white;
  border: none;
  cursor: pointer;
}

.todo-list button:hover {
  background-color: #d32f2f;
}
</style>
