<template>
  <div class="npm-registry">
    <div class="header">
      <h3>NPM 镜像源管理</h3>
      <el-button type="primary" @click="addNewRegistry">
        <el-icon><Plus /></el-icon>添加镜像源
      </el-button>
    </div>

    <div class="registry-list">
      <el-table :data="registryList" style="width: 100%">
        <el-table-column prop="name" label="名称" width="120" />
        <el-table-column prop="url" label="地址" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.current ? 'success' : ''">
              {{ scope.row.current ? '当前使用' : '未使用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button
              type="primary"
              :disabled="scope.row.current"
              @click="switchRegistry(scope.row)"
            >
              使用
            </el-button>
            <el-button
              type="danger"
              :disabled="scope.row.default"
              @click="deleteRegistry(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加镜像源对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加镜像源"
      width="500px"
    >
      <el-form :model="newRegistry" :rules="rules" ref="formRef">
        <el-form-item label="名称" prop="name">
          <el-input v-model="newRegistry.name" placeholder="请输入镜像源名称" />
        </el-form-item>
        <el-form-item label="地址" prop="url">
          <el-input v-model="newRegistry.url" placeholder="请输入镜像源地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAdd">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Registry {
  name: string
  url: string
  current: boolean
  default: boolean
}

const dialogVisible = ref(false)
const formRef = ref()
const registryList = ref<Registry[]>([
  {
    name: 'npm官方',
    url: 'https://registry.npmjs.org/',
    current: false,
    default: true
  },
  {
    name: '淘宝镜像',
    url: 'https://registry.npmmirror.com/',
    current: false,
    default: true
  }
])

const newRegistry = ref({
  name: '',
  url: ''
})

const rules = {
  name: [
    { required: true, message: '请输入镜像源名称', trigger: 'blur' }
  ],
  url: [
    { required: true, message: '请输入镜像源地址', trigger: 'blur' },
    { type: 'url', message: '请输入正确的URL地址', trigger: 'blur' }
  ]
}

// 获取当前 npm registry
const getCurrentRegistry = async () => {
  try {
    const result = await window.electronAPI.npmRegistryGet()
    if (result.success) {
      const currentUrl = result.data
      registryList.value.forEach(registry => {
        registry.current = registry.url === currentUrl
      })
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('获取当前镜像源失败')
  }
}

// 切换 registry
const switchRegistry = async (registry: Registry) => {
  try {
    const result = await window.electronAPI.npmRegistrySet(registry.url)
    if (result.success) {
      await getCurrentRegistry()
      ElMessage.success('切换镜像源成功')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('切换镜像源失败')
  }
}

// 添加新的 registry
const addNewRegistry = () => {
  newRegistry.value = {
    name: '',
    url: ''
  }
  dialogVisible.value = true
}

const confirmAdd = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      const exists = registryList.value.some(
        registry => registry.url === newRegistry.value.url
      )

      if (exists) {
        ElMessage.warning('该镜像源已存在')
        return
      }

      registryList.value.push({
        ...newRegistry.value,
        current: false,
        default: false
      })

      dialogVisible.value = false
      ElMessage.success('添加成功')
    }
  })
}

// 删除 registry
const deleteRegistry = async (registry: Registry) => {
  if (registry.default) {
    ElMessage.warning('默认镜像源不能删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      '确定要删除该镜像源吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = registryList.value.findIndex(item => item.url === registry.url)
    if (index !== -1) {
      registryList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消删除
  }
}

onMounted(() => {
  getCurrentRegistry()
})
</script>

<style scoped>
.npm-registry {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h3 {
  margin: 0;
}

.registry-list {
  margin-bottom: 20px;
}
</style>
