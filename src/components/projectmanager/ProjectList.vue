<template>
  <div class="project-list">
    <div class="header">
      <h2>项目管理</h2>
      <el-button type="primary" @click="showCreateDialog">
        创建项目
      </el-button>
    </div>

    <el-table :data="projects" style="width: 100%">
      <el-table-column prop="name" label="项目名称" />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="startDate" label="开始日期">
        <template #default="{ row }">
          {{ formatDate(row.startDate) }}
        </template>
      </el-table-column>
      <el-table-column prop="endDate" label="结束日期">
        <template #default="{ row }">
          {{ row.endDate ? formatDate(row.endDate) : '未设置' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button-group>
            <el-button size="small" @click="editProject(row)">编辑</el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="deleteProject(row.id)"
            >删除</el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <ProjectForm
      v-model:visible="dialogVisible"
      :project="currentProject"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProjectForm from './ProjectForm.vue'
import type { ProjectAttributes } from '../../types/project'

const projects = ref<ProjectAttributes[]>([])
const dialogVisible = ref(false)
const currentProject = ref<ProjectAttributes | null>(null)

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const getStatusType = (status: string) => {
  const types = {
    active: 'success',
    completed: 'info',
    archived: 'warning'
  }
  return types[status as keyof typeof types]
}

const getStatusText = (status: string) => {
  const texts = {
    active: '进行中',
    completed: '已完成',
    archived: '已归档'
  }
  return texts[status as keyof typeof texts]
}

const loadProjects = async () => {
  try {
    projects.value = await window.projectAPI.getProjects()
  } catch (error) {
    ElMessage.error('加载项目列表失败')
  }
}

const showCreateDialog = () => {
  currentProject.value = null
  dialogVisible.value = true
}

const editProject = (project: ProjectAttributes) => {
  currentProject.value = project
  dialogVisible.value = true
}

const handleSubmit = async (projectData: ProjectAttributes) => {
  try {
    if (currentProject.value?.id) {
      await window.projectAPI.updateProject(currentProject.value.id, projectData)
      ElMessage.success('项目更新成功')
    } else {
      await window.projectAPI.createProject(projectData)
      ElMessage.success('项目创建成功')
    }
    dialogVisible.value = false
    loadProjects()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const deleteProject = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个项目吗？', '警告', {
      type: 'warning'
    })
    await window.projectAPI.deleteProject(id)
    ElMessage.success('项目删除成功')
    loadProjects()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
.project-list {
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