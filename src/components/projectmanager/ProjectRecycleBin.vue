<template>
  <div class="project-recycle-bin">
    <div class="header">
      <h2>项目回收站</h2>
      <el-button-group>
        <el-button type="primary" @click="restoreSelected" :disabled="!hasSelection">
          恢复选中
        </el-button>
        <el-button type="danger" @click="deleteSelected" :disabled="!hasSelection">
          永久删除
        </el-button>
      </el-button-group>
    </div>

    <el-table 
      :data="archivedProjects" 
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="项目名称" />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="startDate" label="开始日期">
        <template #default="{ row }">
          {{ formatDate(row.startDate) }}
        </template>
      </el-table-column>
      <el-table-column prop="endDate" label="结束日期">
        <template #default="{ row }">
          {{ formatDate(row.endDate) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button-group>
            <el-button 
              size="small" 
              type="primary"
              @click="restoreProject(row.id)"
            >恢复</el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="deleteProject(row.id)"
            >删除</el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ProjectAttributes } from '../../types/project'

const archivedProjects = ref<ProjectAttributes[]>([])
const selectedProjects = ref<ProjectAttributes[]>([])

const hasSelection = computed(() => selectedProjects.value.length > 0)

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const loadArchivedProjects = async () => {
  try {
    const projects = await window.projectAPI.getProjects()
    archivedProjects.value = projects.filter(p => p.status === 'archived')
  } catch (error) {
    ElMessage.error('加载归档项目失败')
  }
}

const handleSelectionChange = (selection: ProjectAttributes[]) => {
  selectedProjects.value = selection
}

const restoreProject = async (id: number) => {
  try {
    await window.projectAPI.updateProject(id, { status: 'active' })
    ElMessage.success('项目已恢复')
    loadArchivedProjects()
  } catch (error) {
    ElMessage.error('恢复项目失败')
  }
}

const deleteProject = async (id: number) => {
  try {
    await ElMessageBox.confirm('此操作将永久删除该项目，是否继续？', '警告', {
      type: 'warning'
    })
    await window.projectAPI.deleteProject(id)
    ElMessage.success('项目已永久删除')
    loadArchivedProjects()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const restoreSelected = async () => {
  try {
    await ElMessageBox.confirm('确定要恢复选中的项目吗？', '提示')
    for (const project of selectedProjects.value) {
      await window.projectAPI.updateProject(project.id, { status: 'active' })
    }
    ElMessage.success('选中项目已恢复')
    loadArchivedProjects()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量恢复失败')
    }
  }
}

const deleteSelected = async () => {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除选中的项目，是否继续？',
      '警告',
      { type: 'warning' }
    )
    for (const project of selectedProjects.value) {
      await window.projectAPI.deleteProject(project.id)
    }
    ElMessage.success('选中项目已永久删除')
    loadArchivedProjects()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

onMounted(() => {
  loadArchivedProjects()
})
</script>

<style scoped>
.project-recycle-bin {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
}
</style> 