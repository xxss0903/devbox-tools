<template>
  <div class="project-detail">
    <!-- 项目基本信息卡片 -->
    <div class="info-card">
      <div class="header">
        <div class="left-section">
          <el-button @click="goBack" class="back-button" type="primary" plain>
            <el-icon><Back /></el-icon>
            返回列表
          </el-button>
          <div class="title">
            <el-icon><Folder /></el-icon>
            <h2>{{ project?.name }}</h2>
            <el-tag :type="project?.isFavorite ? 'warning' : 'info'" class="favorite-tag">
              <el-icon><Star /></el-icon>
              {{ project?.isFavorite ? '已收藏' : '未收藏' }}
            </el-tag>
          </div>
        </div>
        <div class="actions">
          <el-button-group>
            <el-button type="primary" @click="openInEditor">
              <el-icon><Edit /></el-icon>在编辑器中打开
            </el-button>
            <el-button type="primary" @click="openInFinder">
              <el-icon><FolderOpened /></el-icon>在文件夹中显示
            </el-button>
          </el-button-group>
        </div>
      </div>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="项目路径">
          {{ project?.path }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(project?.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="最后更新">
          {{ formatDate(project?.updateTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="项目描述">
          {{ project?.description || '暂无描述' }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 项目统计信息 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Files /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.fileCount }}</span>
          <span class="stat-label">文件数量</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Folder /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.folderCount }}</span>
          <span class="stat-label">文件夹数量</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ formatSize(stats.totalSize) }}</span>
          <span class="stat-label">项目大小</span>
        </div>
      </div>
    </div>

    <!-- 文件树结构 -->
    <div class="file-tree-container">
      <div class="section-header">
        <h3>项目结构</h3>
        <el-input
          v-model="searchFile"
          placeholder="搜索文件..."
          :prefix-icon="Search"
          class="search-input"
          clearable
        />
      </div>
      <el-tree
        ref="fileTree"
        :data="fileTreeData"
        :props="{ label: 'name' }"
        :filter-node-method="filterNode"
        node-key="path"
        default-expand-all
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <el-icon>
              <Folder v-if="data.isDirectory" />
              <Document v-else />
            </el-icon>
            <span>{{ node.label }}</span>
          </div>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Folder,
  FolderOpened,
  Document,
  Edit,
  Star,
  Search,
  Files,
  Back
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import moment from 'moment'

interface Props {
  id: string
}

const props = defineProps<Props>()
const route = useRoute()
const router = useRouter()

interface Project {
  id: string
  name: string
  path: string
  description?: string
  createTime: string
  updateTime: string
  isFavorite: boolean
}

interface FileTreeNode {
  name: string
  path: string
  isDirectory: boolean
  children?: FileTreeNode[]
}

interface ProjectStats {
  fileCount: number
  folderCount: number
  totalSize: number
}

const project = ref<Project | null>(null)
const stats = ref<ProjectStats>({
  fileCount: 0,
  folderCount: 0,
  totalSize: 0
})
const fileTreeData = ref<FileTreeNode[]>([])
const searchFile = ref('')
const fileTree = ref()

// 格式化日期
const formatDate = (date?: string) => {
  if (!date) return '未知'
  return moment(Number(date)).format('YYYY-MM-DD HH:mm')
}

// 格式化文件大小
const formatSize = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

// 文件搜索过滤
const filterNode = (value: string, data: FileTreeNode) => {
  if (!value) return true
  return data.name.toLowerCase().includes(value.toLowerCase())
}

// 监听搜索输入
watch(searchFile, (val) => {
  fileTree.value?.filter(val)
})

// 在编辑器中打开项目
const openInEditor = async () => {
  if (!project.value?.path) return
  try {
    await window.electronAPI.openInEditor(project.value.path)
    ElMessage.success('已在编辑器中打开项目')
  } catch (error) {
    ElMessage.error('打开项目失败')
  }
}

// 在文件夹中显示项目
const openInFinder = async () => {
  if (!project.value?.path) return
  try {
    await window.electronAPI.openInFinder(project.value.path)
  } catch (error) {
    ElMessage.error('打开文件夹失败')
  }
}

// 加载项目信息
const loadProjectInfo = async () => {
  try {
    const projectData = await window.projectAPI.getProject(props.id)
    project.value = projectData.dataValues

    console.log(project.value)
    // 加载项目统计信息
    const projectStats = await window.electronAPI.getProjectStats(project.value.path)
    stats.value = projectStats

    // 加载文件树结构
    const treeData = await window.electronAPI.getProjectFileTree(project.value.path)
    fileTreeData.value = treeData
  } catch (error) {
    console.error(error)
    ElMessage.error('加载项目信息失败')
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadProjectInfo()
})
</script>

<style scoped>
.project-detail {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--el-border-color);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title h2 {
  margin: 0;
}

.favorite-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--el-border-color);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  background: var(--el-color-primary-light-9);
  padding: 12px;
  border-radius: 8px;
}

.stat-icon :deep(svg) {
  width: 24px;
  height: 24px;
  color: var(--el-color-primary);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.file-tree-container {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--el-border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
}

.search-input {
  width: 250px;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
