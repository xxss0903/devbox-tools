<template>
  <div class="project-list">
    <div class="list-header">
      <el-input
        v-model="searchQuery"
        placeholder="搜索项目..."
        prefix-icon="Search"
        clearable
      />
      <div class="header-actions">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="favorite">收藏</el-radio-button>
        </el-radio-group>
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
          <div class="project-name">
            <el-icon><Folder /></el-icon>
            <span>{{ row.name }}</span>
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
            <el-button 
              type="primary" 
              size="small" 
              @click="editProject(row)"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="deleteProject(row)"
            >
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑项目对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑项目"
      width="500px"
    >
      <el-form 
        v-if="currentProject"
        :model="currentProject"
        label-width="100px"
      >
        <el-form-item label="项目名称">
          <el-input v-model="currentProject.name" />
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input 
            v-model="currentProject.description" 
            type="textarea" 
            rows="3"
          />
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
import { ref, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Star, Folder, Search } from '@element-plus/icons-vue'
import type { Project } from '@/types/project'
import { format } from 'date-fns'

// 项目列表数据
const projects = ref<Project[]>([])
const searchQuery = ref('')
const viewMode = ref<'all' | 'favorite'>('all')
const editDialogVisible = ref(false)
const currentProject = ref<Project | null>(null)

// 过滤后的项目列表
const filteredProjects = computed(() => {
  let result = projects.value

  if (viewMode.value === 'favorite') {
    result = result.filter(p => p.isFavorite)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.path.toLowerCase().includes(query)
    )
  }

  return result
})

// 格式化日期
const formatDate = (date: string) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm')
}

// 切换收藏状态
const toggleFavorite = (project: Project) => {
  project.isFavorite = !project.isFavorite
  // TODO: 保存到后端
}

// 编辑项目
const editProject = (project: Project) => {
  currentProject.value = { ...project }
  editDialogVisible.value = true
}

// 保存项目
const saveProject = async () => {
  if (!currentProject.value) return
  
  try {
    // TODO: 保存到后端
    const index = projects.value.findIndex(p => p.id === currentProject.value?.id)
    if (index !== -1) {
      projects.value[index] = { 
        ...currentProject.value,
        updateTime: new Date().toISOString()
      }
    }
    editDialogVisible.value = false
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

// 删除项目
const deleteProject = async (project: Project) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该项目吗？删除后可在回收站中恢复',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 调用后端删除接口
    project.isArchived = true
    projects.value = projects.value.filter(p => p.id !== project.id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}
</script>

<style scoped>
.project-list {
  padding: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 16px;
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
</style> 