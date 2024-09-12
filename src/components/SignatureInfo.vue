<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const fileInput = ref<HTMLInputElement | null>(null)
const signatureInfo = ref('')

const getSignatureInfo = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  
  if (fileExtension === 'jks' || fileExtension === 'keystore') {
    signatureInfo.value = '获取JKS签名信息的逻辑需要在后端实现，因为涉及到密钥操作。'
  } else if (fileExtension === 'apk') {
    signatureInfo.value = '获取APK签名信息的逻辑需要在后端实现，因为涉及到APK解析。'
  } else {
    signatureInfo.value = '不支持的文件类型。请上传JKS、Keystore或APK文件。'
  }
}

const goBack = () => {
  router.push({ name: 'AndroidTools' })
}
</script>

<template>
  <div class="signature-info">
    <div class="navigation-bar">
      <button class="back-button" @click="goBack">返回</button>
      <h2 class="detail-title">获取签名信息</h2>
    </div>
    <div class="content">
      <input type="file" ref="fileInput" @change="getSignatureInfo" accept=".jks,.keystore,.apk" />
      <div v-if="signatureInfo" class="info-display">
        <h3>签名信息：</h3>
        <pre>{{ signatureInfo }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.signature-info {
  display: flex;
  flex-direction: column;
  height: 100%;
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

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.info-display {
  margin-top: 20px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>