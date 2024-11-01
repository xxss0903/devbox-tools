<template>
  <div class="chat-container">
    <div class="header">
      <h2>AI 智能问答</h2>
      <div class="model-select">
        <select v-model="selectedModel" class="model-selector">
          <option v-for="model in availableModels" :key="model" :value="model">
            {{ model }}
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
          <div class="message-content" v-html="message.content"></div>
        </div>
      </div>

      <div class="input-area">
        <textarea
          v-model="userInput"
          @keydown.enter.prevent="sendMessage"
          placeholder="输入您的问题..."
          class="input-field"
        ></textarea>
        <button 
          @click="sendMessage" 
          :disabled="isProcessing"
          class="send-button"
        >
          {{ isProcessing ? '处理中...' : '发送' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<ChatMessage[]>([])
const userInput = ref('')
const isProcessing = ref(false)
const availableModels = ref<string[]>([])
const selectedModel = ref('')
const messagesRef = ref<HTMLDivElement | null>(null)

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
    messages.value.push({ role: 'assistant', content: '' })
    await window.electronAPI.chatWithAI(userMessage, selectedModel.value)
  } catch (error) {
    console.error('发送消息失败:', error)
    messages.value[messages.value.length - 1].content = '发送失败，请重试'
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

onMounted(async () => {
  await loadAvailableModels()

  window.electronAPI.onOllamaStream((content: string) => {
    if (messages.value.length > 0) {
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage.role === 'assistant') {
        lastMessage.content += content
        scrollToBottom()
      }
    }
  })

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
  height: calc(100vh - 200px);
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

.send-button {
  padding: 0 20px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-button:hover:not(:disabled) {
  background-color: #1976D2;
}

.send-button:disabled {
  background-color: #90CAF9;
  cursor: not-allowed;
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
</style> 