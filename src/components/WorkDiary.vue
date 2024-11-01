<template>
  <div class="work-diary-container">
    <div class="navigation-bar">
      <button class="back-button" @click="goBack">返回</button>
      <h2 class="detail-title">工作日记</h2>
      <button @click="saveDiary" class="save-button">保存</button>
      <button @click="clearDatabase" class="clear-button">清空日志</button>
      <button @click="generateWeeklySummary" class="summary-button">生成周报</button>
      <button @click="deleteDiaryEntry" class="delete-button">删除当前日记</button>
      <button @click="setReminder" class="reminder-button">设置提醒</button>
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
            <div class="summary-content" v-html="summaryContent"></div>
            
            <!-- AI 分析结果 -->
            <div v-if="aiSummaryContent" class="ai-summary-content" ref="aiSummaryRef">
              <h3>AI 分析结果</h3>
              <div v-html="aiSummaryContent"></div>
            </div>

            <div class="modal-buttons">
              <div class="model-select-group">
                <select v-model="selectedModel" class="model-selector">
                  <option v-for="model in availableModels" :key="model" :value="model">
                    {{ model }}
                  </option>
                </select>
                <button 
                  @click="analyzeWithAI" 
                  class="ai-analyze-button"
                  :disabled="isAiAnalyzing"
                >
                  {{ isAiAnalyzing ? '分析中...' : 'AI 智能分析' }}
                </button>
              </div>
              <div class="action-buttons">
                <button @click="copySummary" class="copy-button">复制内容</button>
                <button @click="closeSummaryModal" class="close-button">关闭</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 时间选择弹窗 -->
    <div v-if="showTimePickerModal" class="modal-wrapper">
      <div class="modal">
        <div class="modal-content">
          <h2>选择提醒时间</h2>
          <input type="time" v-model="selectedTime" />
          <div class="modal-buttons">
            <button @click="confirmTimeSelection" class="confirm-button">确认</button>
            <button @click="closeTimePickerModal" class="close-button">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
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
const showTimePickerModal = ref(false)
const selectedTime = ref('18:00') // 默认设置为18:00
const aiSummaryContent = ref('')
const isAiAnalyzing = ref(false)
const availableModels = ref<string[]>([])
const selectedModel = ref('') // 初始值设为空字符串
const streamContent = ref('')
const aiSummaryRef = ref<HTMLDivElement | null>(null)

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
      // 成功时不需要提示
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
  if (confirm('确定要清空数据库吗？此作不可逆！')) {
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

// 添加一个新的函数来获取保存的提醒时间
const getSavedReminderTime = async () => {
  try {
    const savedTime = await window.electronAPI.getSavedReminderTime()
    console.log("get time", savedTime)
    if (savedTime) {
      selectedTime.value = savedTime
    }
  } catch (error) {
    console.error('获取保存的提醒时间时出错:', error)
  }
}

// 修改 onMounted 函数
onMounted(async () => {
  await loadAvailableModels()
  await loadDiaryEntries()
  let dateStr = moment().format('YYYY-MM-DD')
  await loadDiary(dateStr)
  await getSavedReminderTime() // 获取保存的提醒时间

  // 修改流式响应的监听器部分
  window.electronAPI.onOllamaStream((content: string) => {
    streamContent.value += content
    aiSummaryContent.value = streamContent.value
    // 使用 nextTick 确保 DOM 更新后再滚动
    nextTick(() => {
      const element = aiSummaryRef.value
      if (element) {
        // 计算是否需要滚动
        const isScrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100
        
        // 如果已经接近底部，则自动滚动
        if (isScrolledToBottom) {
          element.scrollTo({
            top: element.scrollHeight,
            behavior: 'smooth'
          })
        }
      }
    })
  })

  window.electronAPI.onOllamaDone(() => {
    isAiAnalyzing.value = false
    streamContent.value = '' // 清空临时内容
  })
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

const openTimePickerModal = () => {
  showTimePickerModal.value = true
}

const closeTimePickerModal = () => {
  showTimePickerModal.value = false
}

const confirmTimeSelection = () => {
  window.electronAPI.setDailyWorkDiaryAlarm(selectedTime.value)
  closeTimePickerModal()
}

// 修改 setReminder 函数
const setReminder = async () => {
  await getSavedReminderTime() // 获取保存的提醒时间
  openTimePickerModal()
}

// 修改 AI 分析函数
const analyzeWithAI = async () => {
  try {
    isAiAnalyzing.value = true
    streamContent.value = '' // 清空之前的内容
    aiSummaryContent.value = '' // 清空之前的分析结果
    
    const prompt = `请分析以下周报内容，并按照以下格式输出：
【中心医院签字板】
1. 各部门工作内容：
   - IT部门：
   - 医疗部门：
   - 行政部门：
   - 其他部门：

2. 重点工作进展：

3. 存在的问题：

4. 下周工作计划：

周报原文：${summaryContent.value}`

    await window.electronAPI.chatWithAI(prompt, selectedModel.value)
  } catch (error) {
    console.error('AI 分析失败:', error)
    aiSummaryContent.value = '分析失败，请稍后重试'
    isAiAnalyzing.value = false
  }
}

// 获取可用模型列表
const loadAvailableModels = async () => {
  try {
    availableModels.value = await window.electronAPI.getOllamaModels()
    // 如果有可用模型，则选中第一个
    if (availableModels.value.length > 0) {
      selectedModel.value = availableModels.value[0]
    }
  } catch (error) {
    console.error('获取模型列表失败:', error)
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
  max-width: 1200px;
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

.modal-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
  width: 100%;
}

.model-select-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.model-selector {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  min-width: 150px;
}

.model-selector:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.ai-analyze-button {
  padding: 8px 16px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  font-weight: 500;
}

.ai-analyze-button:hover:not(:disabled) {
  background-color: #1976D2;
  transform: translateY(-1px);
}

.ai-analyze-button:disabled {
  background-color: #90CAF9;
  cursor: not-allowed;
  transform: none;
}

.copy-button,
.close-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
  font-weight: 500;
}

.copy-button {
  background-color: #4CAF50;
  color: white;
}

.copy-button:hover {
  background-color: #43A047;
  transform: translateY(-1px);
}

.close-button {
  background-color: #9E9E9E;
  color: white;
}

.close-button:hover {
  background-color: #757575;
  transform: translateY(-1px);
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

.modal {
  background-color: #fefefe;
  padding: 20px;
  border-radius: 5px;
  width: 800px;
}

.modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-content h2 {
  margin-bottom: 20px;
}

.modal-content input[type="time"] {
  margin-bottom: 20px;
  padding: 5px;
  font-size: 16px;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.confirm-button,
.close-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.confirm-button {
  background-color: #4caf50;
  color: white;
}

.confirm-button:hover {
  background-color: #45a049;
}

.close-button {
  background-color: #f44336;
  color: white;
}

.close-button:hover {
  background-color: #d32f2f;
}

.ai-analyze-button {
  margin-top: 20px;
  padding: 8px 16px;
  background-color: #9b59b6;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.ai-analyze-button:hover {
  background-color: #8e44ad;
}

.ai-summary-content {
  margin-top: 20px;
  padding: 15px;
  background-color: #E3F2FD;
  border-radius: 4px;
  border-left: 4px solid #2196F3;
  max-height: 400px;
  overflow-y: auto;
  scroll-behavior: smooth;
  line-height: 1.6;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 20px;
  /* 添加平滑滚动效果 */
  scroll-behavior: smooth;
  /* 改善移动端滚动体验 */
  -webkit-overflow-scrolling: touch;
  /* 确保内容有足够的空间 */
  padding-bottom: 50px;
}

/* 确保内容容器有足够的内边距，避免滚动时文字贴边 */
.ai-summary-content > div {
  padding-bottom: 20px;
}

/* 美滚动条 */
.ai-summary-content::-webkit-scrollbar {
  width: 8px;
}

.ai-summary-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.ai-summary-content::-webkit-scrollbar-thumb {
  background: #90CAF9;
  border-radius: 4px;
}

.ai-summary-content::-webkit-scrollbar-thumb:hover {
  background: #64B5F6;
}

.ai-summary-content h3 {
  margin-bottom: 10px;
}

.ai-analyze-button {
  margin: 15px 0;
  padding: 8px 16px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.ai-analyze-button:hover {
  background-color: #1976D2;
}

.ai-analyze-button:disabled {
  background-color: #90CAF9;
  cursor: not-allowed;
}

.ai-summary-content {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
  white-space: pre-wrap;
}

.ai-summary-content h3 {
  margin-bottom: 10px;
  color: #1976D2;
}

.model-selector {
  margin: 10px 0;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
}

.model-selector:focus {
  outline: none;
  border-color: #2196F3;
}
</style>
