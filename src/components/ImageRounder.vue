<template>
  <div class="image-rounder">
    <NavigationBar title="图片圆角裁剪" @goBack="goBack" />
    <div class="content-wrapper">
      <div class="content">
        <div class="input-section">
          <div class="button-group">
            <label class="file-input-label">
              <input type="file" @change="onFileSelected" accept="image/*" class="file-input" />
              <span class="file-input-text">选择图片</span>
            </label>
            <label class="file-input-label">
              <input type="file" @change="onFolderSelected" webkitdirectory directory multiple class="file-input" />
              <span class="file-input-text">选择文件夹</span>
            </label>
            <button @click="processAndDownload" class="primary-button" :disabled="!imageUrl && !folderSelected">生成并下载圆角图片</button>
          </div>
          <div v-if="imageUrl || folderSelected" class="radius-controls">
            <div class="radio-group">
              <label>
                <input type="radio" v-model="radiusType" value="percent" /> 百分比
              </label>
              <label>
                <input type="radio" v-model="radiusType" value="pixel" /> 像素
              </label>
            </div>
            <div class="slider-container">
              <label v-if="radiusType === 'percent'">
                圆角半径:
                <input type="number" v-model="borderRadiusPercent" min="0" max="50" class="number-input" />%
                <input type="range" v-model="borderRadiusPercent" min="0" max="50" class="slider" />
              </label>
              <label v-else>
                圆角半径:
                <input type="number" v-model="borderRadiusPixel" min="0" max="100" class="number-input" />px
                <input type="range" v-model="borderRadiusPixel" min="0" max="100" class="slider" />
              </label>
            </div>
          </div>
        </div>
        <div v-if="imageUrl" class="image-comparison">
          <div class="image-container">
            <h3>原图</h3>
            <img :src="imageUrl" alt="原图" class="preview-image" />
          </div>
          <div class="image-container">
            <h3>圆角效果</h3>
            <img :src="imageUrl" alt="圆角效果" class="result-image" :style="resultImageStyle" />
          </div>
        </div>
        <div v-if="folderSelected" class="folder-info">
          <h3>已选择文件夹，包含 {{ imageFiles.length }} 个图片文件</h3>
          <div v-if="imageFiles.length <= 6" class="image-grid">
            <div v-for="file in imageFiles" :key="file.name" class="image-item">
              <img :src="getImageUrl(file)" alt="缩略图" class="thumbnail" />
              <span class="file-name">{{ file.name }}</span>
            </div>
          </div>
          <ul v-else-if="imageFiles.length <= 12" class="file-list">
            <li v-for="file in imageFiles" :key="file.name">{{ file.name }}</li>
          </ul>
          <p v-else>选中的图片数量过多，不显示具体列表。</p>
        </div>
      </div>
    </div>
    <div v-if="showOpenDownloadFolder" class="open-download-folder">
      <button @click="openDownloadFolder" class="secondary-button">打开下载文件夹</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import NavigationBar from './NavigationBar.vue';
import { useRouter } from 'vue-router';
import JSZip from 'jszip';

const router = useRouter();
const imageUrl = ref('');
const borderRadiusPercent = ref(10);
const borderRadiusPixel = ref(20);
const radiusType = ref('percent');
const originalFileName = ref('');
const folderSelected = ref(false);
const imageFiles = ref<File[]>([]);
const showOpenDownloadFolder = ref(false);

const resultImageStyle = computed(() => {
  if (radiusType.value === 'percent') {
    return { borderRadius: `${borderRadiusPercent.value}%` };
  } else {
    return { borderRadius: `${borderRadiusPixel.value}px` };
  }
});

const onFileSelected = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    imageUrl.value = URL.createObjectURL(file);
    originalFileName.value = file.name;
    folderSelected.value = false;
    imageFiles.value = [];
  }
};

const onFolderSelected = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (files) {
    imageFiles.value = Array.from(files).filter(file => file.type.startsWith('image/'));
    folderSelected.value = true;
    imageUrl.value = '';
  }
};

const processImage = (img: HTMLImageElement): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;

    const radius = radiusType.value === 'percent'
      ? Math.min(canvas.width, canvas.height) * borderRadiusPercent.value / 100
      : borderRadiusPixel.value;

    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(canvas.width - radius, 0);
    ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
    ctx.lineTo(canvas.width, canvas.height - radius);
    ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
    ctx.lineTo(radius, canvas.height);
    ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    resolve(canvas.toDataURL('image/png'));
  });
};

const processAndDownload = async () => {
  if (imageUrl.value) {
    // 处理单个图片
    const img = new Image();
    img.onload = async () => {
      const resultUrl = await processImage(img);
      const link = document.createElement('a');
      link.href = resultUrl;
      const extension = originalFileName.value.split('.').pop();
      const newFileName = originalFileName.value.replace(`.${extension}`, `_round.${extension}`);
      link.download = newFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showOpenDownloadFolder.value = true;
    };
    img.src = imageUrl.value;
  } else if (folderSelected.value) {
    // 处理文件夹中的所有图片
    const zip = new JSZip();
    const promises = imageFiles.value.map(file => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = async () => {
          const resultUrl = await processImage(img);
          const data = atob(resultUrl.split(',')[1]);
          const array = new Uint8Array(data.length);
          for (let i = 0; i < data.length; i++) {
            array[i] = data.charCodeAt(i);
          }
          const extension = file.name.split('.').pop();
          const newFileName = file.name.replace(`.${extension}`, `_round.${extension}`);
          zip.file(newFileName, array);
          resolve();
        };
        img.src = URL.createObjectURL(file);
      });
    });

    await Promise.all(promises);
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'rounded_images.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showOpenDownloadFolder.value = true;
  }
};

const openDownloadFolder = () => {
  // 由于浏览器安全限制，我们不能直接打开下载文件夹
  // 但我们可以提供一些指导信息
  alert('请在您的文件管理器中打开下载文件夹查看处理后的图片。');
  showOpenDownloadFolder.value = false;
};

const goBack = () => {
  router.back();
};

const getImageUrl = (file: File) => {
  return URL.createObjectURL(file);
};
</script>

<style scoped>
.image-rounder {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f2f5;
  font-family: 'Arial', sans-serif;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.input-section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.file-input-label, .primary-button {
  display: inline-block;
  padding: 12px 24px;
  background-color: #4a90e2;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
  font-size: 16px;
  font-weight: bold;
  border: none;
}

.file-input-label:hover, .primary-button:hover {
  background-color: #357abd;
  transform: translateY(-2px);
}

.file-input-label:active, .primary-button:active {
  transform: translateY(0);
}

.file-input {
  display: none;
}

.primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.radius-controls {
  width: 100%;
  margin-top: 15px;
}

.radio-group {
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
}

.radio-group label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-group input[type="radio"] {
  margin-right: 5px;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.number-input {
  width: 60px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 4px;
  font-size: 14px;
}

.slider {
  flex-grow: 1;
  margin-left: 10px;
}

.image-comparison {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 20px;
}

.image-container {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.preview-image, .result-image {
  max-width: 100%;
  height: auto;
  object-fit: contain;
}

h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.folder-info {
  margin-top: 20px;
  font-size: 16px;
  color: #333;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  margin-top: 20px;
  max-height: 400px;
  overflow-y: auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
}

.image-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: transform 0.2s ease-in-out;
}

.image-item:hover {
  transform: translateY(-5px);
}

.thumbnail {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 10px;
}

.file-name {
  font-size: 14px;
  color: #333;
  text-align: center;
  word-break: break-all;
  max-width: 100%;
}

.file-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
  list-style-type: none;
}

.file-list li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.file-list li:last-child {
  border-bottom: none;
}

.open-download-folder {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #f0f2f5;
  padding: 15px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  z-index: 1000;
}

.secondary-button {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.secondary-button:hover {
  background-color: #357abd;
}

@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }

  .image-comparison {
    flex-direction: column;
  }
}
</style>