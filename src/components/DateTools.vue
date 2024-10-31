<template>
  <div class="date-tools">
    <NavigationBar title="日期工具12" @goBack="goBack" />
    
    <div class="content">
      <!-- 当前时间和时间戳 -->
      <div class="tool-section">
        <div class="section-header">
          <h3>当前时间</h3>
          <div class="time-display">{{ currentDateTime }}</div>
          <div class="timestamp">
            <span>时间戳: {{ currentTimestamp }}</span>
            <button @click="copyTimestamp" class="copy-button">复制</button>
          </div>
        </div>
      </div>

      <!-- 时间戳转换 -->
      <div class="tool-section">
        <div class="section-row">
          <h3>时间戳转换</h3>
          <div class="input-group">
            <input 
              type="number" 
              v-model="timestampInput"
              placeholder="输入时间戳"
              class="timestamp-input"
            />
          </div>
        </div>
        <div v-if="convertedDate" class="result-row">
          <span>转换结果：</span>
          <div class="result">
            <span>{{ convertedDate }}</span>
            <button @click="copyConvertedDate" class="copy-button">复制</button>
          </div>
        </div>
      </div>

      <!-- 日期格式化 -->
      <div class="tool-section">
        <div class="section-row">
          <h3>日期格式化</h3>
          <div class="input-group">
            <input 
              type="datetime-local" 
              v-model="dateInput"
              class="date-input"
            />
            <select v-model="selectedFormat" class="format-select">
              <option value="YYYY-MM-DD HH:mm:ss">YYYY-MM-DD HH:mm:ss</option>
              <option value="YYYY/MM/DD HH:mm:ss">YYYY/MM/DD HH:mm:ss</option>
              <option value="YYYY年MM月DD日 HH时mm分ss秒">YYYY年MM月DD日 HH时mm分ss秒</option>
              <option value="MM/DD/YYYY HH:mm:ss">MM/DD/YYYY HH:mm:ss</option>
              <option value="DD/MM/YYYY HH:mm:ss">DD/MM/YYYY HH:mm:ss</option>
            </select>
          </div>
        </div>
        <div v-if="formattedDate" class="result-row">
          <span>格式化结果：</span>
          <div class="result">
            <span>{{ formattedDate }}</span>
            <button @click="copyFormattedDate" class="copy-button">复制</button>
          </div>
        </div>
        <div v-if="formattedTimestamp" class="result-row">
          <span>时间戳：</span>
          <div class="result">
            <span>{{ formattedTimestamp }}</span>
            <button @click="copyFormattedTimestamp" class="copy-button">复制</button>
          </div>
        </div>
      </div>

      <!-- 日期计算 -->
      <div class="tool-section">
        <div class="section-row">
          <h3>日期计算</h3>
          <div class="input-group">
            <input 
              type="datetime-local" 
              v-model="baseDate"
              class="date-input"
            />
            <input 
              type="number" 
              v-model="timeValue"
              placeholder="数值"
              class="number-input"
            />
            <select v-model="timeUnit" class="calc-type-select">
              <option value="minutes">分钟</option>
              <option value="hours">小时</option>
              <option value="days">天</option>
              <option value="weeks">周</option>
              <option value="months">月</option>
              <option value="years">年</option>
            </select>
            <select v-model="calculationType" class="calc-type-select">
              <option value="add">增加</option>
              <option value="subtract">减少</option>
            </select>
            <button @click="calculateDate" class="calc-button">计算</button>
          </div>
        </div>
        <div v-if="calculatedDate" class="result-row">
          <span>计算结果：</span>
          <div class="result">
            <span>{{ calculatedDate }}</span>
            <button @click="copyCalculatedDate" class="copy-button">复制</button>
          </div>
        </div>
        <div v-if="calculatedTimestamp" class="result-row">
          <span>时间戳：</span>
          <div class="result">
            <span>{{ calculatedTimestamp }}</span>
            <button @click="copyCalculatedTimestamp" class="copy-button">复制</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showCopySuccess" class="copy-success-toast">复制成功！</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'
import moment from 'moment'

const router = useRouter()
const currentDateTime = ref('')
const currentTimestamp = ref(0)
const timestampInput = ref('')
const convertedDate = ref('')
const dateInput = ref('')
const selectedFormat = ref('YYYY-MM-DD HH:mm:ss')
const formattedDate = ref('')
const baseDate = ref('')
const timeValue = ref(0)
const timeUnit = ref('days')
const calculationType = ref('add')
const calculatedDate = ref('')
const calculatedTimestamp = ref('')
const showCopySuccess = ref(false)
const formattedTimestamp = ref('')

let timer: any

// 更新当前时间
const updateCurrentTime = () => {
  const now = moment()
  currentDateTime.value = now.format('YYYY-MM-DD HH:mm:ss')
  currentTimestamp.value = now.valueOf()
}

// 时间戳转换
watch(timestampInput, (newValue) => {
  if (newValue) {
    const date = moment(Number(newValue))
    convertedDate.value = date.format('YYYY-MM-DD HH:mm:ss')
  } else {
    convertedDate.value = ''
  }
})

// 日期格式化
watch([dateInput, selectedFormat], () => {
  if (dateInput.value) {
    const date = moment(dateInput.value)
    formattedDate.value = date.format(selectedFormat.value)
    formattedTimestamp.value = date.valueOf().toString()
  } else {
    formattedDate.value = ''
    formattedTimestamp.value = ''
  }
})

// 日期计算
const calculateDate = () => {
  if (baseDate.value && timeValue.value) {
    const date = moment(baseDate.value)
    const value = Number(timeValue.value)
    
    if (calculationType.value === 'add') {
      date.add(value, timeUnit.value)
    } else {
      date.subtract(value, timeUnit.value)
    }
    
    calculatedDate.value = date.format('YYYY-MM-DD HH:mm:ss')
    calculatedTimestamp.value = date.valueOf().toString()
  }
}

// 复制功能
const copyToClipboard = async (text: string) => {
  try {
    await window.electronAPI.writeTextToClipboard(text)
    showCopySuccess.value = true
    setTimeout(() => {
      showCopySuccess.value = false
    }, 2000) // 2秒后隐藏提示
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const copyTimestamp = () => copyToClipboard(currentTimestamp.value.toString())
const copyConvertedDate = () => copyToClipboard(convertedDate.value)
const copyFormattedDate = () => copyToClipboard(formattedDate.value)
const copyCalculatedDate = () => copyToClipboard(calculatedDate.value)
const copyFormattedTimestamp = () => copyToClipboard(formattedTimestamp.value)
const copyCalculatedTimestamp = () => copyToClipboard(calculatedTimestamp.value)

const goBack = () => {
    router.back()
}

onMounted(() => {
  updateCurrentTime()
  timer = setInterval(updateCurrentTime, 1000)
})

onUnmounted(() => {
  console.log('onBeforeUnmount 1', timer)
  timer && clearInterval(timer)
})
</script>

<style scoped>
.date-tools {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.tool-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tool-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 18px;
}

.current-time {
  font-size: 24px;
  color: #2c3e50;
}

.time-display {
  margin-bottom: 10px;
}

.timestamp {
  font-size: 16px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 10px;
}

.timestamp-converter,
.date-formatter,
.date-calculator {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.timestamp-input,
.date-input,
.number-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.format-select,
.calc-type-select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background: white;
}

.calculation-inputs {
  display: flex;
  gap: 10px;
  align-items: center;
}

.copy-button {
  padding: 6px 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.copy-button:hover {
  background: #2980b9;
}

.calc-button {
  padding: 10px 20px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.calc-button:hover {
  background: #27ae60;
}

.result,
.formatted-result,
.calc-result {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.section-row h3 {
  min-width: 100px;
  margin: 0;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.timestamp-input,
.date-input,
.number-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.date-input {
  width: 200px;
}

.number-input {
  width: 80px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.format-select,
.calc-type-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  width: auto;
  min-width: 80px;
}

.result {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  flex: 1;
}

.copy-button {
  padding: 4px 8px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.calc-button {
  padding: 8px 16px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.section-header {
  text-align: center;
}

.time-display {
  font-size: 28px;
  color: #2c3e50;
  margin: 10px 0;
}

.timestamp {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .section-row {
    flex-direction: column;
    align-items: stretch;
  }

  .input-group {
    flex-wrap: wrap;
  }

  .section-row h3 {
    margin-bottom: 10px;
  }
}

.result-row {
  margin-top: 10px;
  padding-left: 115px; /* 与标题对齐 */
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-row > span {
  color: #666;
  font-size: 14px;
}

.result {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.result span {
  color: #2c3e50;
  font-size: 14px;
}

.copy-success-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  z-index: 1000;
}
</style> 