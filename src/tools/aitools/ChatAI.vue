<template>
  <div class="chat-container">
    <div class="header">
      <h2>AI 智能问答</h2>
      <div class="model-select">
        <select v-model="selectedModel" class="model-selector">
          <option v-for="model in availableModels" :key="model" :value="model">
            {{ model.name || model.model}}
          </option>
        </select>
      </div>
    </div>

    <div class="chat-content">
      <div class="messages" ref="messagesRef">
        <div 
          v-for="(message, index) in messages" 
          :key="index"
          :class="['message', message.role]"
        >
          <div 
            class="message-content" 
            v-html="renderMessage(message)"
          ></div>
        </div>
      </div>

      <div class="input-area">
        <textarea
          v-model="userInput"
          @keydown.enter.prevent="sendMessage"
          placeholder="输入您的问题..."
          class="input-field"
        ></textarea>
        <div class="button-group">
          <button class="upload-button" @click="triggerImageUpload">
            <i class="fas fa-image"></i>
          </button>
          <button 
            @click="sendMessage" 
            :disabled="isProcessing"
            class="send-button"
          >
            {{ isProcessing ? '处理中...' : '发送' }}
          </button>
        </div>
        <input
          type="file"
          ref="imageInput"
          accept="image/*"
          style="display: none"
          @change="handleImageUpload"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { marked } from 'marked'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  image?: string
}

const messages = ref<ChatMessage[]>([])
const userInput = ref('')
const isProcessing = ref(false)
const availableModels = ref<string[]>([])
const selectedModel = ref('')
const messagesRef = ref<HTMLDivElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const selectedImage = ref<string | null>(null)

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

const sendMessage = async () => {
  if (!userInput.value.trim() || isProcessing.value) return

  const userMessage = userInput.value
  messages.value.push({ role: 'user', content: userMessage })
  userInput.value = ''
  isProcessing.value = true

  try {
    console.log('selectedModel', selectedModel.value)
    messages.value.push({ role: 'assistant', content: '' })
    await window.electronAPI.chatWithAI(userMessage, selectedModel.value.model)
  } catch (error) {
    console.error('发送消息失败:', error)
    messages.value[messages.value.length - 1].content = '发送失败，请重试'
    isProcessing.value = false
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
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

// 修改消息发送部分
window.electronAPI.onOllamaStream((content: string) => {
  if (messages.value.length > 0) {
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage.role === 'assistant') {
      lastMessage.content += content
      // 使用 markdown 渲染
      const messageElement = document.querySelector('.message.assistant:last-child .message-content')
      if (messageElement) {
        messageElement.innerHTML = renderMarkdown(lastMessage.content)
      }
      scrollToBottom()
    }
  }
})

// 修改消息渲染部分
const renderMessage = (message: ChatMessage) => {
  if (message.role === 'assistant') {
    return renderMarkdown(message.content)
  }
  // 如果是用户消息且包含图片
  if (message.role === 'user' && message.image) {
    return `
      <div class="message-with-image">
        <img src="${message.image}" alt="用户上传的图片" class="uploaded-image" />
        <p>${message.content}</p>
      </div>
    `
  }
  return message.content
}

// 触发文件选择
const triggerImageUpload = () => {
  imageInput.value?.click()
}

// 修改图片上传处理函数
const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    // 将图片转换为 base64
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64Image = e.target?.result as string
      // 提取 base64 数据部分（去掉 "data:image/png;base64," 前缀）
      const imageData = base64Image.split(',')[1]
      selectedImage.value = base64Image

      // 自动发送图片分析请求
      const prompt = "Act as an OCR assistant. Analyze the provided image and:1. Recognize all visible text in the image as accurately as possible.2. Maintain the original structure and formatting of the text.3. If any words or phrases are unclear, indicate this with [unclear] in your transcription.Provide only the transcription without any additional comments."
      messages.value.push({ 
        role: 'user', 
        content: prompt,
        image: base64Image 
      })
      isProcessing.value = true

      try {
        messages.value.push({ role: 'assistant', content: '' })
        // 传递图片数据给 AI
        await window.electronAPI.chatWithAI(prompt, selectedModel.value.model, imageData)
      } catch (error) {
        console.error('发送消息失败:', error)
        messages.value[messages.value.length - 1].content = '分析失败，请重试'
        isProcessing.value = false
      }
    }
    reader.readAsDataURL(file)
  } catch (error) {
    console.error('处理图片失败:', error)
  }
  
  // 清空文件选择，允许重复选择同一文件
  target.value = ''
}

onMounted(async () => {
  await loadAvailableModels()

  window.electronAPI.onOllamaDone(() => {
    isProcessing.value = false
    scrollToBottom()
  })
})
</script>

<style scoped>
.chat-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  height: calc(100vh - 250px);
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.model-selector {
  width: 200px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  max-height: calc(100vh - 300px);
  overflow: hidden;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(100vh - 400px);
}

.message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 8px;
  line-height: 1.5;
}

.message.user {
  align-self: flex-end;
  background-color: #2196F3;
  color: white;
}

.message.assistant {
  align-self: flex-start;
  background-color: #f5f5f5;
  color: #333;
}

.input-area {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.input-field {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  height: 60px;
  font-size: 14px;
}

.button-group {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.upload-button {
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  height: 42px;
  width: 42px;
}

.upload-button:hover {
  background-color: #43A047;
  transform: translateY(-1px);
}

.send-button {
  padding: 0 20px;
  height: 42px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.send-button:hover:not(:disabled) {
  background-color: #1976D2;
  transform: translateY(-1px);
}

.send-button:disabled {
  background-color: #90CAF9;
  cursor: not-allowed;
  transform: none;
}

.message-with-image {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.uploaded-image {
  max-width: 300px;
  max-height: 200px;
  border-radius: 4px;
  object-fit: contain;
}

/* 滚动条样式 */
.messages::-webkit-scrollbar {
  width: 8px;
}

.messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.messages::-webkit-scrollbar-thumb {
  background: #90CAF9;
  border-radius: 4px;
}

.messages::-webkit-scrollbar-thumb:hover {
  background: #64B5F6;
}

/* 添加 markdown 样式 */
.message-content :deep(p) {
  margin: 0.5em 0;
}

.message-content :deep(code) {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
}

.message-content :deep(pre) {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
}

.message-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.message-content :deep(blockquote) {
  margin: 0.5em 0;
  padding-left: 1em;
  border-left: 3px solid #ddd;
  color: #666;
}

.message-content :deep(ul), 
.message-content :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.message-content :deep(table) {
  border-collapse: collapse;
  margin: 0.5em 0;
  width: 100%;
}

.message-content :deep(th),
.message-content :deep(td) {
  border: 1px solid #ddd;
  padding: 0.5em;
}

.message-content :deep(th) {
  background-color: rgba(0, 0, 0, 0.05);
}

/* 调整助手消息的样式 */
.message.assistant .message-content {
  color: #333;
  line-height: 1.6;
}

/* 调整用户消息的样式 */
.message.user .message-content {
  color: white;
}
</style> 