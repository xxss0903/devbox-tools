<template>
  <div class="work-diary-container">
    <div class="navigation-bar">
      <button class="back-button" @click="goBack">返回</button>
      <h2 class="detail-title">工作日记</h2>
      <button @click="saveDiary" class="save-button">保存</button>
      <button @click="clearDatabase" class="clear-button">清空日志</button>
      <button @click="generateWeeklySummary" class="summary-button">生成周报</button>
      <button @click="deleteDiaryEntry" class="delete-button">删除当前日记</button>
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
            ref="quillEditorRef"
            v-model:content="content"
            :options="editorOptions"
            contentType="html"
            class="content-input"
          />
        </div>
      </div>
    </div>

    <!-- 修改模态组件部分 -->
    <Transition name="fade">
      <div v-if="showSummaryModal" class="modal-wrapper">
        <div class="modal">
          <div class="modal-content">
            <h2>周报摘要</h2>
            <div class="summary-content">{{ summaryContent }}</div>
            <div class="modal-buttons">
              <button @click="copySummary" class="copy-button">复制</button>
              <button @click="closeSummaryModal" class="close-button">关闭</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import 'v-calendar/style.css'
import moment from 'moment'
import { debounce } from 'lodash' // 确保已安装 lodash

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
const quillEditorRef = ref()
const showSummaryModal = ref(false)
const summaryContent = ref('')

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
    let timeStampValue = moment(date.value).format('YYYY-MM-DD')
    console.log('Saving diary:', timeStampValue.toString(), content, serializedTodos)
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

const loadDiaryEntries = async () => {
  diaryEntries.value = await window.electronAPI.getDiaryEntries()
}

const goBack = () => {
  router.back()
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

const copySummary = () => {
  navigator.clipboard
    .writeText(summaryContent.value)
    .then(() => {
      alert('周报内容已复制到剪贴板')
    })
    .catch((err) => {
      console.error('复制失败:', err)
      alert('复制失败，请手动复制')
    })
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
    dates: new Date(moment(entry.date).format('YYYY-MM-DD'))
  }))
})

const clearDatabase = async () => {
  if (confirm('确定要清空数据库吗？此操作不可逆！')) {
    try {
      await window.electronAPI.clearDatabase()
      await loadDiaryEntries()
      content.value = ''
      todos.value = []
      console.log('数据库已清空')
    } catch (error) {
      console.error('清空数据库时出错:', error)
    }
  }
}

onMounted(async () => {
  await loadDiaryEntries()
  let dateStr = moment().format('YYYY-MM-DD')
  await loadDiary(dateStr)
})

// 创建一个防抖的 loadDiary 函数
const debouncedLoadDiary = debounce(async (dateStr: string) => {
  console.log('Loading diary for date:', dateStr)
  await loadDiary(dateStr)
}, 300) // 300ms 的延迟

// 修改 watch 函数
watch(date, (newDate) => {
  let dateV = new Date(newDate).getTime()
  let dateStr = moment(dateV).format('YYYY-MM-DD')
  console.log('Date changed to:', dateStr, newDate)
  debouncedLoadDiary(dateStr)
})

const loadDiary = async (selectedTime: string) => {
  console.log('Loading diary for date:', selectedTime)
  const diaryEntry = await window.electronAPI.getDiaryEntryByDate(selectedTime)
  console.log('Diary entry loaded:', selectedTime, diaryEntry)
  if (diaryEntry) {
    content.value = diaryEntry.content || ''
    todos.value = Array.isArray(diaryEntry.todos)
      ? diaryEntry.todos
      : JSON.parse(diaryEntry.todos || '[]')
    console.log('Loaded content:', content.value)
    console.log('Loaded todos:', todos.value)
    // 如果内容为空字符串，也要清空编辑器
    if (content.value === '') {
      if (quillEditorRef.value && quillEditorRef.value.getQuill) {
        quillEditorRef.value.getQuill().setText('')
      }
    }
  } else {
    content.value = ''
    todos.value = []
    // 清空 Quill 编辑器的内容
    if (quillEditorRef.value && quillEditorRef.value.getQuill) {
      quillEditorRef.value.getQuill().setText('')
    }
    console.log('No diary entry found, cleared content and todos')
  }
}

const generateWeeklySummary = async () => {
  try {
    const currentDate = moment(date.value)
    const startOfWeek = currentDate.startOf('week').format('YYYY-MM-DD')
    const endOfWeek = currentDate.endOf('week').format('YYYY-MM-DD')

    const summary = await window.electronAPI.generateWeeklySummary(startOfWeek, endOfWeek)

    // 更新摘要内容并显示模态框
    summaryContent.value = summary
    showSummaryModal.value = true

    console.log('生成的周报:', summary)
  } catch (error) {
    console.error('生成周报时出错:', error)
  }
}

const closeSummaryModal = () => {
  showSummaryModal.value = false
}


const deleteDiaryEntry = async () => {
  if (confirm('确定要删除当前日期的日记吗？此操作不可逆！')) {
    try {
      let dateStr = moment(date.value).format('YYYY-MM-DD')
      await window.electronAPI.deleteDiaryEntry(dateStr)
      await loadDiaryEntries()
      content.value = ''
      todos.value = []
      console.log('日记已删除')
    } catch (error) {
      console.error('删除日记时出错:', error)
    }
  }
}
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

.clear-button {
  padding: 8px 16px;
  background-color: #e74c3c;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.clear-button:hover {
  background-color: #c0392b;
}

.summary-button {
  padding: 8px 16px;
  background-color: #9b59b6;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.summary-button:hover {
  background-color: #8e44ad;
}

.modal-wrapper {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal {
  background-color: #fefefe;
  padding: 20px;
  border-radius: 5px;
  width: 80%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.summary-content {
  white-space: pre-wrap;
  margin-bottom: 20px;
}

.close-button {
  padding: 8px 16px;
  background-color: #3498db;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.close-button:hover {
  background-color: #2980b9;
}
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

.clear-button {
  padding: 8px 16px;
  background-color: #e74c3c;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.clear-button:hover {
  background-color: #c0392b;
}

.summary-button {
  padding: 8px 16px;
  background-color: #9b59b6;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.summary-button:hover {
  background-color: #8e44ad;
}

.modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #fefefe;
  padding: 20px;
  border-radius: 5px;
  width: 80%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.summary-content {
  white-space: pre-wrap;
  margin-bottom: 20px;
}

.close-button {
  padding: 8px 16px;
  background-color: #3498db;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.close-button:hover {
  background-color: #2980b9;
}

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

.clear-button {
  padding: 8px 16px;
  background-color: #e74c3c;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.clear-button:hover {
  background-color: #c0392b;
}

.summary-button {
  padding: 8px 16px;
  background-color: #9b59b6;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.summary-button:hover {
  background-color: #8e44ad;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.copy-button,
.close-button {
  padding: 8px 16px;
  margin-left: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.copy-button {
  background-color: #4caf50;
  color: white;
}

.copy-button:hover {
  background-color: #45a049;
}

.close-button {
  background-color: #3498db;
  color: white;
}

.close-button:hover {
  background-color: #2980b9;
}


.delete-button {
  padding: 8px 16px;
  background-color: #e74c3c;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.delete-button:hover {
  background-color: #c0392b;
}
</style>
