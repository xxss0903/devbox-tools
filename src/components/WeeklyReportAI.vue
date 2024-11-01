<template>
  <div class="weekly-report-container">
    <div class="header">
      <h2>AI 周报管理</h2>
      <div class="model-select">
        <select v-model="selectedModel" class="model-selector">
          <option v-for="model in availableModels" :key="model" :value="model">
            {{ model.name || model.model }}
          </option>
        </select>
      </div>
    </div>

    <div class="content">
      <div class="input-section">
        <textarea
          v-model="weeklyContent"
          placeholder="请输入需要分析的周报内容..."
          class="content-input"
        ></textarea>
      </div>

      <div class="action-buttons">
        <button 
          @click="analyzeReport" 
          :disabled="isAnalyzing"
          class="analyze-button"
        >
          {{ isAnalyzing ? '分析中...' : '开始分析' }}
        </button>
        <button @click="clearContent" class="clear-button">清空内容</button>
      </div>

      <div v-if="aiResponse" class="analysis-result" ref="resultRef">
        <h3>AI 分析结果</h3>
        <div v-html="renderMarkdown(aiResponse)"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { marked } from 'marked'

const weeklyContent = ref('')
const aiResponse = ref('')
const isAnalyzing = ref(false)
const availableModels = ref<string[]>([])
const selectedModel = ref('')
const resultRef = ref<HTMLDivElement | null>(null)

// 获取可用模型列表
const loadAvailableModels = async () => {
  try {
    availableModels.value = await window.electronAPI.getOllamaModels()
    if (availableModels.value.length > 0) {
      selectedModel.value = availableModels.value[0]
    }
  } catch (error) {
    console.error('获取模型列表失败:', error)
  }
}

// 分析周报
const analyzeReport = async () => {
  if (!weeklyContent.value.trim()) {
    alert('请输入周报内容')
    return
  }

  try {
    isAnalyzing.value = true
    aiResponse.value = ''

    const prompt = `你是一个工作周报的分析专家，请分析以下周报内容，将相同内容放到【】内然后跟具体的工作内容，内容精简不要啰嗦，每一项工作只有一行，类似下面的格式：
    【知情文书APP改版】测试的BUG修改；
    【印章提取】印章提取裁剪；
    
    周报原文：${weeklyContent.value}`

    await window.electronAPI.chatWithAI(prompt, selectedModel.value)
  } catch (error) {
    console.error('分析失败:', error)
    aiResponse.value = '分析失败，请稍后重试'
  }
}

// 清空内容
const clearContent = () => {
  weeklyContent.value = ''
  aiResponse.value = ''
}

// 添加 markdown 渲染函数
const renderMarkdown = (content: string) => {
  try {
    return marked(content)
  } catch (error) {
    console.error('Markdown 渲染失败:', error)
    return content
  }
}

onMounted(async () => {
  await loadAvailableModels()

  // 添加流式响应的监听器
  window.electronAPI.onOllamaStream((content: string) => {
    aiResponse.value += content
    nextTick(() => {
      if (resultRef.value) {
        // 使用 markdown 渲染
        resultRef.value.innerHTML = renderMarkdown(aiResponse.value)
        
        const isScrolledToBottom = 
          resultRef.value.scrollHeight - resultRef.value.scrollTop <= resultRef.value.clientHeight + 100
        
        if (isScrolledToBottom) {
          resultRef.value.scrollTo({
            top: resultRef.value.scrollHeight,
            behavior: 'smooth'
          })
        }
      }
    })
  })

  window.electronAPI.onOllamaDone(() => {
    isAnalyzing.value = false
  })
})
</script>

<style scoped>
.weekly-report-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.model-select {
  min-width: 200px;
}

.model-selector {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-section {
  width: 100%;
}

.content-input {
  width: 95%;
  height: 200px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-size: 14px;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.analyze-button,
.clear-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.analyze-button {
  background-color: #2196F3;
  color: white;
  min-width: 100px;
}

.analyze-button:hover:not(:disabled) {
  background-color: #1976D2;
}

.analyze-button:disabled {
  background-color: #90CAF9;
  cursor: not-allowed;
}

.clear-button {
  background-color: #f5f5f5;
  color: #666;
}

.clear-button:hover {
  background-color: #e0e0e0;
}

.analysis-result {
  margin-top: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.result-content {
  white-space: pre-wrap;
  line-height: 1.6;
}

/* 滚动条样式 */
.analysis-result::-webkit-scrollbar {
  width: 8px;
}

.analysis-result::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.analysis-result::-webkit-scrollbar-thumb {
  background: #90CAF9;
  border-radius: 4px;
}

.analysis-result::-webkit-scrollbar-thumb:hover {
  background: #64B5F6;
}

/* 添加 markdown 样式 */
.analysis-result :deep(p) {
  margin: 0.5em 0;
}

.analysis-result :deep(code) {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
}

.analysis-result :deep(pre) {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
}

.analysis-result :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.analysis-result :deep(blockquote) {
  margin: 0.5em 0;
  padding-left: 1em;
  border-left: 3px solid #2196F3;
  color: #666;
}

.analysis-result :deep(ul), 
.analysis-result :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.analysis-result :deep(table) {
  border-collapse: collapse;
  margin: 0.5em 0;
  width: 100%;
}

.analysis-result :deep(th),
.analysis-result :deep(td) {
  border: 1px solid #ddd;
  padding: 0.5em;
}

.analysis-result :deep(th) {
  background-color: rgba(33, 150, 243, 0.1);
}
</style> 