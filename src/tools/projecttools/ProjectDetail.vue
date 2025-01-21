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

    <!-- 项目进度卡片 -->
    <div class="progress-card">
      <h3>项目进度</h3>
      <div class="progress-info">
        <el-progress
          :percentage="latestProgress.progress"
          :status="getProgressStatus(latestProgress.status)"
        />
        <div class="status-info">
          <span class="status-label">当前状态：</span>
          <el-tag :type="getStatusType(latestProgress.status)">
            {{ getStatusText(latestProgress.status) }}
          </el-tag>
        </div>
        <div class="update-time">
          最后更新：{{ latestProgress.date ? formatDate(latestProgress.date) : '暂无更新' }}
        </div>
      </div>

      <!-- 进度历史图表 -->
      <div class="progress-chart">
        <div ref="progressChartRef" style="width: 100%; height: 300px"></div>
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
      >
        <template #default="{ node }">
          <div class="custom-tree-node">
            <el-icon>
              <Folder v-if="node.data.isDirectory" />
              <Document v-else />
            </el-icon>
            <span>{{ node.label }}</span>
          </div>
        </template>
      </el-tree>
    </div>

    <!-- 项目日志部分 -->
    <div class="project-logs">
      <h3>项目日志</h3>
      
      <div class="log-header">
        <VDatePicker
          v-model="selectedDate"
          :attributes="logAttributes"
          is-expanded
          :columns="1"
          :model-config="{ type: 'number', mask: 'YYYY-MM-DD' }"
        />
      </div>

      <!-- 添加日志表单 -->
      <div class="add-log-form">
        <el-input
          v-model="newLogContent"
          type="textarea"
          :rows="4"
          :placeholder="currentLog ? '编辑日志内容...' : '添加新日志...'"
        />
        <div class="form-footer">
          <div class="progress-input">
            <span class="progress-label">进度：</span>
            <el-slider
              v-model="newProgress"
              :step="5"
              :marks="{
                0: '0%',
                25: '25%',
                50: '50%',
                75: '75%',
                100: '100%'
              }"
            />
          </div>
          <div class="status-select">
            <span class="status-label">状态：</span>
            <el-select v-model="newStatus" placeholder="选择状态">
              <el-option label="规划中" value="planning" />
              <el-option label="开发中" value="developing" />
              <el-option label="测试中" value="testing" />
              <el-option label="已完成" value="completed" />
            </el-select>
          </div>
          <el-button type="primary" @click="saveProjectLog" :loading="isAddingLog">
            {{ currentLog ? '更新日志' : '添加日志' }}
          </el-button>
        </div>
      </div>

      <!-- 日志列表 -->
      <div class="log-list">
        <div v-for="log in projectLogs" :key="log.id" class="log-item">
          <div class="log-header">
            <div class="log-date">{{ log.date }}</div>
            <div class="log-progress">
              <el-progress
                :percentage="log.progress"
                :status="getProgressStatus(log.status)"
                :stroke-width="10"
              />
            </div>
            <div class="log-status">
              <el-tag :type="getStatusType(log.status)" size="small">
                {{ getStatusText(log.status) }}
              </el-tag>
            </div>
            <div class="log-time">{{ formatTime(log.created_at) }}</div>
          </div>
          <div class="log-content">{{ log.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, onUnmounted } from 'vue'
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
import 'v-calendar/style.css'
import * as echarts from 'echarts'

interface Props {
  id: string
  title?: string
  from?: string
}

const props = defineProps<Props>()
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
}

interface ProjectStats {
  fileCount: number
  folderCount: number
  totalSize: number
}

interface ProjectLog {
  id: number
  project_id: string
  date: string
  content: string
  created_at: number
}

interface ProjectProgress {
  progress: number
  status: string
  date: string | null
}

interface ProgressHistory {
  date: string
  progress: number
  status: string
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
const selectedDate = ref(Date.now())
const currentLog = ref<ProjectLog | null>(null)
const projectLogs = ref<ProjectLog[]>([])
const isAddingLog = ref(false)
const newLogContent = ref('')
const newProgress = ref(0)
const newStatus = ref('planning')
const latestProgress = ref<ProjectProgress>({
  progress: 0,
  status: 'planning',
  date: null
})
const progressHistory = ref<ProgressHistory[]>([])
const progressChartRef = ref<HTMLElement | null>(null)
let progressChart: echarts.ECharts | null = null

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

// 修改加载项目信息的方法
const loadProjectInfo = async () => {
  try {
    const projectData = await window.projectAPI.getProject(props.id)
    project.value = projectData.dataValues
    console.log('Project data:', project.value) // 添加日志

    if (project.value && project.value.path) {
      try {
        // 加载项目统计信息
        const projectStats = await window.electronAPI.getProjectStats(project.value.path)
        console.log('Project stats:', projectStats) // 添加日志
        stats.value = projectStats

        // 加载文件树结构
        const treeData = await window.electronAPI.getProjectFileTree(project.value.path)
        console.log('File tree data:', treeData) // 添加日志
        fileTreeData.value = treeData
      } catch (error) {
        console.error('Error loading project details:', error)
        ElMessage.error('加载项目详情失败')
      }
    } else {
      console.error('Invalid project path:', project.value?.path)
      ElMessage.warning('项目路径无效')
    }
  } catch (error) {
    console.error('Error loading project:', error)
    ElMessage.error('加载项目信息失败')
  }
}

// 监听路由参数变化
watch(
  () => props.id,
  (newId) => {
    if (newId) {
      loadProjectInfo()
    }
  }
)

const goBack = () => {
  router.back()
  //   if (props.from === 'project-manager') {
  //     router.push('/tools/project-manager')
  //   } else {
  //     router.back()
  //   }
}

// 日志日历属性
const logAttributes = computed(() => {
  return projectLogs.value.map((log) => ({
    dot: {
      color: 'green',
      class: 'has-entry'
    },
    dates: new Date(log.date)
  }))
})

// 加载项目日志
const loadProjectLogs = async () => {
  if (!project.value?.id) return
  projectLogs.value = await window.electronAPI.getProjectLogs(project.value.id)
  console.log('Project logs:', projectLogs.value)
}

// 获取项目最新进度
const loadLatestProgress = async () => {
  if (!project.value?.id) return
  latestProgress.value = await window.electronAPI.getProjectLatestProgress(project.value.id)
}

// 获取项目进度历史
const loadProgressHistory = async () => {
  if (!project.value?.id) return
  progressHistory.value = await window.electronAPI.getProjectProgressHistory(project.value.id)
  updateProgressChart()
}

// 更新进度图表
const updateProgressChart = () => {
  if (!progressChartRef.value) return

  if (!progressChart) {
    progressChart = echarts.init(progressChartRef.value)
  }

  const option = {
    title: {
      text: '项目进度历史',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0].data
        return `日期：${data.date}<br/>进度：${data.progress}%<br/>状态：${getStatusText(data.status)}`
      }
    },
    xAxis: {
      type: 'time',
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      name: '进度 (%)'
    },
    series: [
      {
        name: '项目进度',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: progressHistory.value.map(item => ({
          value: [item.date, item.progress],
          date: item.date,
          progress: item.progress,
          status: item.status
        })),
        itemStyle: {
          color: '#409EFF'
        },
        lineStyle: {
          width: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(64,158,255,0.3)'
            },
            {
              offset: 1,
              color: 'rgba(64,158,255,0.1)'
            }
          ])
        }
      }
    ]
  }

  progressChart.setOption(option)
}

// 获取进度状态样式
const getProgressStatus = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'testing':
      return 'warning'
    case 'developing':
      return ''
    default:
      return 'info'
  }
}

// 获取状态标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'testing':
      return 'warning'
    case 'developing':
      return 'primary'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return '已完成'
    case 'testing':
      return '测试中'
    case 'developing':
      return '开发中'
    default:
      return '规划中'
  }
}

// 修改保存项目日志方法
const saveProjectLog = async () => {
  if (!newLogContent.value.trim() || !project.value?.id) return
  
  isAddingLog.value = true
  try {
    const date = moment(selectedDate.value).format('YYYY-MM-DD')
    await window.electronAPI.saveProjectLog(
      project.value.id,
      date,
      newLogContent.value,
      newProgress.value,
      newStatus.value
    )
    await loadProjectLogs()
    await loadLogByDate()
    await loadLatestProgress()
    await loadProgressHistory()
    ElMessage.success(currentLog.value ? '日志已更新' : '日志已添加')
  } catch (error) {
    console.error('保存项目日志失败:', error)
    ElMessage.error('保存失败')
  } finally {
    isAddingLog.value = false
  }
}

// 加载指定日期的日志时，同时加载进度信息
const loadLogByDate = async () => {
  if (!project.value?.id) return
  const date = moment(selectedDate.value).format('YYYY-MM-DD')
  const log = await window.electronAPI.getProjectLogByDate(project.value.id, date)
  currentLog.value = log
  newLogContent.value = log ? log.content : ''
  newProgress.value = log ? log.progress : 0
  newStatus.value = log ? log.status : 'planning'
}

// 监听日期变化
watch(selectedDate, () => {
  loadLogByDate()
})

// 格式化时间
const formatTime = (timestamp: number) => {
  return moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

// 监听窗口大小变化
const handleResize = () => {
  if (progressChart) {
    progressChart.resize()
  }
}

onMounted(() => {
  loadProjectInfo()
  loadProjectLogs()
  loadLogByDate()
  loadLatestProgress()
  loadProgressHistory()
  window.addEventListener('resize', handleResize)
})

// 在组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (progressChart) {
    progressChart.dispose()
  }
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

.project-logs {
  margin-top: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
}

.log-header {
  margin-bottom: 20px;
}

.add-log-form {
  margin-bottom: 20px;
  
  .el-button {
    margin-top: 10px;
  }
}

.log-list {
  max-height: 500px;
  overflow-y: auto;
  
  .log-item {
    padding: 15px;
    border-bottom: 1px solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
    
    .log-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      
      .log-date {
        font-weight: bold;
        color: var(--el-color-primary);
      }
      
      .log-time {
        font-size: 12px;
        color: #999;
      }
    }
    
    .log-content {
      font-size: 14px;
      line-height: 1.6;
      white-space: pre-wrap;
    }
  }
}

:deep(.vc-container) {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

:deep(.has-entry) {
  background-color: var(--el-color-success);
}

.progress-card {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--el-border-color);
  margin-bottom: 20px;
}

.progress-info {
  margin: 20px 0;
}

.status-info {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.update-time {
  margin-top: 10px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.progress-chart {
  margin-top: 20px;
  border-top: 1px solid var(--el-border-color);
  padding-top: 20px;
}

.form-footer {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.progress-input,
.status-select {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-label,
.status-label {
  min-width: 60px;
  color: var(--el-text-color-regular);
}

:deep(.el-slider) {
  flex: 1;
}

.log-progress {
  flex: 1;
  margin: 0 15px;
}

.log-status {
  margin-right: 15px;
}

:deep(.el-progress-bar__inner) {
  transition: all 0.3s ease;
}

:deep(.el-progress--line) {
  margin-right: 0;
}
</style>
