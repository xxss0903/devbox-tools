<template>
  <div class="project-tools" 
       @dragover="handleDragOver"
       @drop="handleDrop">
    <h1>项目管理工具</h1>
    <div class="tool-grid">
      <!-- 项目管理卡片 -->
      <div class="tool-card" @click="navigateTo('ProjectManager')">
        <div class="icon">
          <el-icon><Folder /></el-icon>
        </div>
        <div class="info">
          <h3>项目管理</h3>
          <p>管理所有进行中和已完成的项目</p>
        </div>
      </div>

      <!-- 项目回收站卡片 -->
      <div class="tool-card" @click="navigateTo('ProjectRecycleBin')">
        <div class="icon">
          <el-icon><Delete /></el-icon>
        </div>
        <div class="info">
          <h3>项目回收站</h3>
          <p>查看和恢复已归档的项目</p>
        </div>
      </div>

      <!-- 项目统计卡片 -->
      <div class="tool-card" @click="navigateTo('ProjectStatistics')">
        <div class="icon">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="info">
          <h3>项目统计</h3>
          <p>查看项目进度和统计数据</p>
        </div>
      </div>

      <!-- 项目导出卡片 -->
      <div class="tool-card" @click="navigateTo('ProjectExport')">
        <div class="icon">
          <el-icon><Download /></el-icon>
        </div>
        <div class="info">
          <h3>项目导出</h3>
          <p>导出项目数据和报告</p>
        </div>
      </div>
    </div>

    <!-- 添加拖拽提示遮罩 -->
    <div v-if="isDragging" class="drag-overlay">
      <el-icon class="drag-icon"><Upload /></el-icon>
      <p>将文件夹拖放到这里以创建新项目</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Folder, Delete, TrendCharts, Download, Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const isDragging = ref(false)

const navigateTo = (route: string) => {
  router.push({ name: route })
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  
  const items = e.dataTransfer?.items
  if (!items) return
  
  const entries = Array.from(items).filter(item => 
    item.kind === 'file' && 
    (item.webkitGetAsEntry()?.isDirectory || item.webkitGetAsEntry()?.isFile)
  )

  if (entries.length === 0) {
    ElMessage.warning('请拖放文件夹或文件')
    return
  }

  for (const item of entries) {
    const entry = item.webkitGetAsEntry()
    if (!entry) continue

    const path = (item.getAsFile() as File).path
    const name = entry.name

    try {
      await ElMessageBox.confirm(
        `是否创建新项目？\n项目名称: ${name}\n项目路径: ${path}`,
        '创建新项目',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info',
        }
      )
      // TODO: 这里添加创建项目的逻辑
      ElMessage.success('项目创建成功')
    } catch {
      // 用户取消
    }
  }
}
</script>

<style scoped>
.project-tools {
  padding: 20px;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.tool-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--el-color-primary);
}

.icon {
  background: var(--el-color-primary-light-9);
  padding: 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon :deep(svg) {
  width: 24px;
  height: 24px;
  color: var(--el-color-primary);
}

.info {
  flex: 1;
}

.info h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.info p {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.drag-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--el-color-primary-rgb), 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  pointer-events: none;
}

.drag-icon {
  font-size: 48px;
  color: var(--el-color-primary);
  margin-bottom: 16px;
}

.drag-overlay p {
  font-size: 18px;
  color: var(--el-color-primary);
}
</style>
