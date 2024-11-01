<template>
    <div class="image-cropper-container">
      <div class="image-cropper-content">
        <div class="controls">
          <button @click="selectFile" class="button">选择PDF</button>
          <button @click="openPDFBoxApp" :disabled="!pdfUrl" class="button">打开工具</button>
        </div>
        <div v-if="fileName" class="file-info">
          <p>文件路径: {{ pdfUrl }}</p>
        </div>
      </div>
    </div>
  </template>

  <script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const pdfUrl = ref('')
  const fileName = ref('')

  const selectFile = async () => {
    const filePath = await window.electronAPI.getFilePath()
    if (filePath) {
      pdfUrl.value = filePath
      fileName.value = filePath
      console.log("选择的文件路径:", filePath)
      openPDFBoxApp()
    }
  }

  const openPDFBoxApp = async () => {
    if (pdfUrl.value) {
     let filePath = pdfUrl.value
     console.log("pdf filePath",filePath)
      try {
        const result = await window.electronAPI.openPDFBoxApp(filePath);
        console.log('命令执行结果:', result);
        // 这里可以添加更多的逻辑，比如显示结果或者进行进一步处理
      } catch (error) {
        console.error('命令执行出错:', error);
        // 这里可以添加错误处理逻辑，比如显示错误信息给用户
      }
    } else {
      console.warn('没有选择PDF文件');
      // 这里可以添加提示用户选择文件的逻辑
    }
  }

  const goBack = () => {
    router.back()
  }
  </script>

  <style scoped>
  .image-cropper-container {
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

  .title {
    font-size: 18px;
    font-weight: bold;
    margin: 0;
  }

  .image-cropper-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    height: 80%;
  }

  .controls {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .button {
    padding: 10px 20px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    transition: background-color 0.3s;
  }

  .button:hover {
    background-color: #45a049;
  }

  .button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .cropper {
    height: 500px;
    background: #f0f0f0;
    margin-bottom: 20px;
  }

  .preview-container {
    text-align: center;
  }

  .cropped-preview {
    max-width: 100%;
    margin-bottom: 10px;
    cursor: pointer; /* 添加指针样式,表明可点击 */
  }

  /* 移除 .download-button 相关样式 */
  </style>
