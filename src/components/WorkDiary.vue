<template>
  <div class="work-diary-container">
    <div class="navigation-bar">
      <button class="back-button" @click="goBack">返回</button>
      <h2 class="detail-title">工作日记</h2>
      <button @click="saveDiary" class="save-button">保存</button>
    </div>
    <div class="work-diary-content">
      <div class="left-panel">
        <div class="date-picker">
          <VDatePicker
            v-model="date"
            :attributes="attributes"
            is-expanded
            :columns="1"
            :model-config="{ type: 'number', mask: 'YYYY-MM-DD' }"
          />
        </div>
        <div class="todo-list">
          <h3>待办事项</h3>
          <ul>
            <li v-for="(todo, index) in todos" :key="index">
              <input type="checkbox" v-model="todo.done" @change="updateTodo(index)" />
              <span :class="{ completed: todo.done }">{{ todo.text }}</span>
              <button @click="removeTodo(index)">删除</button>
            </li>
          </ul>
          <input v-model="newTodo" @keyup.enter="addTodo" placeholder="输入新的待办事项" />
          <button @click="addTodo">添加待办事项</button>
        </div>
      </div>
      <div class="right-panel">
        <div class="quill-editor-container">
          <QuillEditor
            v-model:content="content"
            :options="editorOptions"
            contentType="html"
            class="content-input"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import 'v-calendar/style.css'
import moment from 'moment'

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

const router = useRouter()
const date = ref(getDayTimestamp(new Date()))
const content = ref('')
const diaryEntries = ref<DiaryEntry[]>([])
const todos = ref<TodoItem[]>([])
const newTodo = ref('')

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

function getDayTimestamp(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function timestampToDateString(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0]
}

const saveDiary = async () => {
  try {
    const serializedTodos = JSON.stringify(todos.value)
    console.log('Saving todos:', serializedTodos)
    let timeStampValue = moment(date.value).valueOf()
    console.log('save date 1', timeStampValue)
    await window.electronAPI.saveDiaryEntry(
      timeStampValue.toString(),
      content.value,
      serializedTodos
    )
    await loadDiaryEntries()
  } catch (error) {
    console.error('保存日记时出错:', error)
  }
}

const loadDiary = async (selectedTimestamp: number) => {
  console.log('Loading diary for date:', selectedTimestamp)
  let timeStampValue = moment(selectedTimestamp).valueOf()
  const diaryEntry = await window.electronAPI.getDiaryEntryByDate(timeStampValue.toString())
  console.log('Diary entry loaded:', timeStampValue.toString(), diaryEntry)
  if (diaryEntry) {
    date.value = parseInt(diaryEntry.date)
    content.value = diaryEntry.content || ''
    todos.value = Array.isArray(diaryEntry.todos)
      ? diaryEntry.todos
      : JSON.parse(diaryEntry.todos || '[]')
    console.log('Loaded content:', content.value)
    console.log('Loaded todos:', todos.value)
  } else {
    content.value = ''
    todos.value = []
    console.log('No diary entry found, cleared content and todos')
  }
}

const loadDiaryEntries = async () => {
  diaryEntries.value = await window.electronAPI.getDiaryEntries()
}

const goBack = () => {
  router.push({ name: 'Home' })
}

const addTodo = () => {
  if (newTodo.value.trim()) {
    todos.value.push({ text: newTodo.value.trim(), done: false })
    newTodo.value = ''
  }
}

const updateTodo = (index: number) => {
  console.log('Todo updated:', todos.value[index])
}

const removeTodo = (index: number) => {
  todos.value.splice(index, 1)
}

const hasEntryForDate = computed(() => {
  return (checkDate: string) => diaryEntries.value.some((entry) => entry.date === checkDate)
})

const attributes = computed(() => {
  return diaryEntries.value.map((entry) => ({
    dot: {
      color: 'green',
      class: 'has-entry'
    },
    dates: new Date(moment(entry.date).date())
  }))
})

onMounted(async () => {
  await loadDiaryEntries()
  await loadDiary(date.value)
})

// 监听日期变化
watch(date, async (newDate) => {
  console.log('Date changed to:', newDate)
  await loadDiary(newDate)
})
</script>

<style scoped>
.work-diary-container {
  display: flex;
  flex-direction: column;
  height: 100%;
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
  height: 600px; /* 假设导航栏高度为60px */
  overflow: hidden;
}

.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
  border-right: 1px solid #e9ecef;
}

.right-panel {
  flex: 2;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
  height: 500px;
}

.date-picker {
  margin-bottom: 20px;
}

:deep(.vc-container) {
  width: 100%;
}

:deep(.vc-day-content) {
  position: relative;
}

:deep(.has-entry) {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
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

.todo-list span {
  flex-grow: 1;
  margin-right: 10px;
}

.todo-list .completed {
  text-decoration: line-through;
  color: #888;
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

.todo-list input[type='text'] {
  flex-grow: 1;
  margin-right: 10px;
  padding: 5px;
}

.quill-editor-container {
  height: 500px; /* 将高度固定为 500px */
}

:deep(.quill-editor) {
  height: 300px;
  display: flex;
  flex-direction: column;
}

:deep(.ql-container) {
  flex: 1;
  overflow-y: auto;
  height: 300px;
}

.content-input {
  height: 300px;
}
</style>
