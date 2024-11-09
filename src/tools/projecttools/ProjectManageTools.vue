<template>
  <div class="project-tools" @dragover="handleDragOver" @drop="handleDrop">
    <div class="tools-header">
      <div class="tools-actions">
        <el-button type="primary" @click="showToolCards = !showToolCards">
          {{ showToolCards ? '隐藏工具栏' : '显示工具栏' }}
        </el-button>
        <el-button type="primary" @click="handleSelectFolder"> 选择项目文件夹 </el-button>
      </div>
    </div>

    <!-- 工具卡片区域 -->
    <div v-show="showToolCards" class="tool-grid">
      <div class="tool-card" @click="navigateTo('ProjectManager')">
        <div class="icon">
          <el-icon><Folder /></el-icon>
        </div>
        <div class="info">
          <h3>项目管理</h3>
          <p>管理所有进行中和已完成的项目</p>
        </div>
      </div>

      <div class="tool-card" @click="navigateTo('ProjectRecycleBin')">
        <div class="icon">
          <el-icon><Delete /></el-icon>
        </div>
        <div class="info">
          <h3>项目回收站</h3>
          <p>查看和恢复已归档的项目</p>
        </div>
      </div>

      <div class="tool-card" @click="navigateTo('ProjectStatistics')">
        <div class="icon">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="info">
          <h3>项目统计</h3>
          <p>查看项目进度和统计数据</p>
        </div>
      </div>

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

    <!-- 项目列表区域 -->
    <div class="project-list-container">
      <div class="list-header">
        <div class="left-section">
          <el-input
            v-model="searchQuery"
            placeholder="搜索项目..."
            class="search-input"
            :prefix-icon="Search"
            clearable
          />
          <el-switch
            v-model="showFavoriteOnly"
            class="favorite-switch"
            :active-icon="Star"
            :inactive-icon="Document"
            active-text="收藏"
            inactive-text="全部"
          />
        </div>
      </div>

      <el-table :data="filteredProjects" style="width: 100%">
        <el-table-column width="50">
          <template #default="{ row }">
            <el-icon
              :class="['favorite-icon', { active: row.isFavorite }]"
              @click="toggleFavorite(row)"
            >
              <Star />
            </el-icon>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="项目名称" min-width="200">
          <template #default="{ row }">
            <div class="project-name" @click="openProjectDetail(row)">
              <el-icon><Folder /></el-icon>
              <span class="clickable-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="path" label="项目路径" min-width="300" />

        <el-table-column prop="updateTime" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updateTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" size="small" @click="editProject(row)"> 编辑 </el-button>
              <el-button type="danger" size="small" @click="deleteProject(row)"> 删除 </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 拖拽提示遮罩 -->
    <div v-if="isDragging" class="drag-overlay">
      <el-icon class="drag-icon"><Upload /></el-icon>
      <p>将文件夹拖放到这里以创建新项目</p>
    </div>

    <!-- 编辑项目对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑项目" width="500px">
      <el-form v-if="currentProject" :model="currentProject" label-width="100px">
        <el-form-item label="项目名称">
          <el-input v-model="currentProject.name" />
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input v-model="currentProject.description" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProject">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Folder,
  Delete,
  TrendCharts,
  Download,
  Upload,
  Star,
  Search,
  Document
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Project } from '@/types/project'
import moment from 'moment'

const router = useRouter()
const isDragging = ref(false)
const showToolCards = ref(false)

// 项目列表相关状态
const projects = ref<Project[]>([])
const searchQuery = ref('')
const editDialogVisible = ref(false)
const currentProject = ref<Project | null>(null)

// 路由导航
const navigateTo = (route: string) => {
  router.push({ name: route })
}

// 拖拽相关方法
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const items = e.dataTransfer?.items
  if (!items) return

  const entries = Array.from(items).filter(
    (item) => item.kind === 'file' && item.webkitGetAsEntry()?.isDirectory
  )

  if (entries.length === 0) {
    ElMessage.warning('请拖放文件夹')
    return
  }

  for (const item of entries) {
    const entry = item.webkitGetAsEntry()
    if (!entry) continue

    const file = item.getAsFile()
    if (!file) continue

    try {
      console.log(file)
      // 通过 IPC 获取文件夹路径
      const filePath = await window.electronAPI.getDroppedFolderPath(file)
      if (!filePath) {
        ElMessage.warning('无法获取文件夹路径')
        continue
      }

      await ElMessageBox.confirm(
        `是否创建新项目？\n项目名称: ${entry.name}\n项目路径: ${filePath}`,
        '创建新项目',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      )

      const now = moment().valueOf().toString()
      const newProject: Project = {
        id: moment().valueOf().toString(),
        name: entry.name,
        path: filePath,
        createTime: now,
        updateTime: now,
        isFavorite: false,
        isArchived: false
      }

      console.log('new project', newProject)
      // 保存到数据库
      await window.projectAPI.createProject(newProject)
      // 重新加载项目列表
      await loadProjects()
      ElMessage.success('项目创建成功')
    } catch (error) {
      // 用户取消或发生错误
      if (error instanceof Error) {
        ElMessage.error(`创建项目失败: ${error.message}`)
      }
    }
  }
}

// 项目列表相关方法
const showFavoriteOnly = ref(false)

const filteredProjects = computed(() => {
  let result = projects.value

  if (showFavoriteOnly.value) {
    result = result.filter((p) => p.isFavorite)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (p) => p.name.toLowerCase().includes(query) || p.path.toLowerCase().includes(query)
    )
  }

  return result
})

const formatDate = (date: string) => {
  try {
    console.log('update date', date)
    return moment(Number(date)).format('YYYY-MM-DD HH:mm')
  } catch (error) {
    console.error('日期格式化错误:', error)
    return '无效日期'
  }
}

const toggleFavorite = (project: Project) => {
  project.isFavorite = !project.isFavorite
}

const editProject = (project: Project) => {
  currentProject.value = { ...project }
  editDialogVisible.value = true
}

const saveProject = async () => {
  if (!currentProject.value) return
  console.log(currentProject.value)
  try {
    const now = moment().valueOf()
    await window.projectAPI.updateProject(currentProject.value.id, {
      ...currentProject.value,
      updateTime: now
    })
    await loadProjects()
    editDialogVisible.value = false
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const deleteProject = async (project: Project) => {
  try {
    await ElMessageBox.confirm('确定要删除该项目吗？删除后可在回收站中恢复', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await window.projectAPI.deleteProject(project.id)
    await loadProjects()
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

const handleSelectFolder = async () => {
  try {
    const result = await window.electronAPI.selectProjectFolder()
    if (!result || result.length === 0) return

    const folder = result[0]
    const filePath = folder.data
    const name = folder.name

    await ElMessageBox.confirm(
      `是否创建新项目？\n项目名称: ${name}\n项目路径: ${filePath}`,
      '创建新项目',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    const now = moment().valueOf().toString()
    const newProject = {
      id: moment().valueOf().toString(),
      name,
      path: filePath,
      createTime: now,
      updateTime: now,
      isFavorite: false,
      isArchived: false
    }

    console.log('new project', newProject)
    // 保存到数据库
    await window.projectAPI.createProject(newProject)
    // 重新加载项目列表
    await loadProjects()
    ElMessage.success('项目创建成功')
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(`创建项目失败: ${error.message}`)
    }
  }
}

// 在setup中添加初始化加载项目列表
const loadProjects = async () => {
  try {
    const projectList = await window.projectAPI.getProjects()
    const dataList = projectList.map((value, index) => value.dataValues)
    console.log('get projects', dataList)
    projects.value = dataList
  } catch (error) {
    ElMessage.error('加载项目列表失败')
  }
}

// 在组件挂载时加载项目列表
onMounted(() => {
  loadProjects()
})

const openProjectDetail = (project: Project) => {
  router.push({
    name: 'ProjectDetail',
    params: { id: project.id },
    query: { title: project.name }
  })
}
</script>

<style scoped>
.project-tools {
  padding: 20px;
}

.tools-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
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

.project-list-container {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--el-border-color);
}

.list-header {
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

.search-input {
  width: 300px;
}

.favorite-switch {
  margin-left: 8px;
}

:deep(.el-switch__label) {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

:deep(.el-switch.is-checked .el-switch__label) {
  color: var(--el-color-primary);
}

.project-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.favorite-icon {
  cursor: pointer;
  color: var(--el-text-color-secondary);
  transition: color 0.3s;
}

.favorite-icon.active {
  color: #f7ba2a;
}

.favorite-icon:hover {
  color: #f7ba2a;
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

.clickable-name {
  cursor: pointer;
  color: var(--el-color-primary);
  transition: color 0.2s;
}

.clickable-name:hover {
  color: var(--el-color-primary-light-3);
  text-decoration: underline;
}
</style>
