<template>
  <div>
    <page-header title="JSON格式化" />
    <div class="json-formatter">
      <!-- 左侧输入区域 -->
      <div class="editor-container input-panel">
        <div class="editor-header">
          <div class="header-left">
            <span class="title">输入JSON</span>
            <el-button-group size="small">
              <el-button @click="clearInput">清空</el-button>
              <el-button 
              size="small" 
              type="primary"
              @click="pasteFromClipboard"
            >
              从剪贴板粘贴
            </el-button>
            </el-button-group>
          </div>
        </div>
        <el-input
          v-model="inputJson"
          type="textarea"
          :rows="30"
          placeholder="请输入JSON字符串..."
          @input="handleInput"
        />
      </div>

      <!-- 右侧输出区域 -->
      <div class="editor-container output-panel">
        <div class="editor-header">
          <div class="header-left">
            <span class="title">格式化结果</span>
            <el-button-group size="small">
              <el-button 
                type="primary"
                @click="copyToClipboard"
              >
                复制
              </el-button>
              <el-button @click="expandAll">展开全部</el-button>
              <el-button @click="collapseAll">折叠全部</el-button>
            </el-button-group>
          </div>
        </div>
        
        <!-- 使用树形控件展示JSON -->
        <div class="tree-view-container" v-if="treeData.length">
          <el-tree
            ref="treeRef"
            :data="treeData"
            :props="defaultProps"
            node-key="id"
            default-expand-all
            :expand-on-click-node="true"
          >
            <template #default="{ data }">
              <span class="custom-tree-node">
                <template v-if="data.isKey">
                  <span class="json-key">{{ data.label }}</span>
                  <template v-if="!data.isObject && !data.isArray">
                    <span class="json-separator">: </span>
                  </template>
                </template>
                <span :class="[
                  getValueClass(data.value),
                  { 'json-object-value': data.isObject || data.isArray }
                ]">
                  {{ formatValue(data.value) }}
                </span>
              </span>
            </template>
          </el-tree>
        </div>
        
        <!-- 当解析失败时显示原始文本 -->
        <el-input
          v-else
          v-model="outputJson"
          type="textarea"
          :rows="30"
          readonly
        />
      </div>

      <!-- 错误提示 -->
      <el-alert
        v-if="error"
        :title="error"
        type="error"
        show-icon
        :closable="false"
        class="error-alert"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { ElTree } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'

const inputJson = ref('')
const outputJson = ref('')
const error = ref('')
const indentSize = ref(2)
const treeRef = ref<InstanceType<typeof ElTree>>()
const treeData = ref<any[]>([])

const defaultProps = {
  children: 'children',
  label: 'label'
}

// 监听缩进大小变化
watch(indentSize, () => {
  if (inputJson.value.trim()) {
    formatJson()
  }
})

// 将JSON对象转换为树形结构
const convertToTree = (obj: any, key?: string, parentId: string = '0'): any[] => {
  const id = `${parentId}-${key || 'root'}`
  
  if (Array.isArray(obj)) {
    const children = obj.map((item, index) => 
      convertToTree(item, `${index}`, id)
    ).flat()
    return [{
      id,
      label: key ? `${key}` : '',
      isKey: !!key,
      value: `[${obj.length}]`,
      children,
      isArray: true
    }]
  } else if (obj && typeof obj === 'object') {
    const children = Object.entries(obj).map(([k, v]) => 
      convertToTree(v, k, id)
    ).flat()
    return [{
      id,
      label: key ? `${key}` : '',
      isKey: !!key,
      value: `{${Object.keys(obj).length}}`,
      children,
      isObject: true
    }]
  } else {
    return [{
      id,
      label: key || '',
      isKey: !!key,
      value: obj,
      children: []
    }]
  }
}

// 格式化JSON
const formatJson = () => {
  try {
    if (!inputJson.value.trim()) {
      error.value = '请输入JSON字符串'
      treeData.value = []
      return
    }
    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed, null, indentSize.value)
    treeData.value = convertToTree(parsed)
    error.value = ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : '无效的JSON格式'
    treeData.value = []
  }
}

// 获取值的CSS类名
const getValueClass = (value: any) => {
  if (value === null) return 'json-null'
  if (typeof value === 'number') return 'json-number'
  if (typeof value === 'boolean') return 'json-boolean'
  if (typeof value === 'string') return 'json-string'
  return ''
}

// 格式化值的显示
const formatValue = (value: any) => {
  if (value === null) return 'null'
  if (value === undefined) return ''
  if (typeof value === 'string') return `"${value}"`
  return String(value)
}

// 展开全部节点
const expandAll = () => {
  const tree = treeRef.value
  if (!tree) return
  
  const expandNode = (data: any) => {
    tree.store.nodesMap[data.id].expanded = true
    if (data.children) {
      data.children.forEach((child: any) => expandNode(child))
    }
  }
  
  treeData.value.forEach(node => expandNode(node))
}

// 折叠全部节点
const collapseAll = () => {
  const tree = treeRef.value
  if (!tree) return
  
  const collapseNode = (data: any) => {
    tree.store.nodesMap[data.id].expanded = false
    if (data.children) {
      data.children.forEach((child: any) => collapseNode(child))
    }
  }
  
  treeData.value.forEach(node => collapseNode(node))
}

// 压缩JSON
const compressJson = () => {
  try {
    if (!inputJson.value.trim()) {
      error.value = '请输入JSON字符串'
      return
    }
    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed)
    error.value = ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : '无效的JSON格式'
  }
}

// 清空输入
const clearInput = () => {
  inputJson.value = ''
  outputJson.value = ''
  error.value = ''
}

// 从剪贴板粘贴
const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputJson.value = text
    formatJson()
  } catch (err) {
    ElMessage.error('无法访问剪贴板')
  }
}

// 复制到剪贴板
const copyToClipboard = async () => {
  if (!outputJson.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  
  try {
    await navigator.clipboard.writeText(outputJson.value)
    ElMessage.success('已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 输入时自动尝试格式化
const handleInput = () => {
  if (inputJson.value.trim()) {
    formatJson()
  } else {
    outputJson.value = ''
    error.value = ''
  }
}
</script>

<style scoped>
.json-formatter {
  padding: 20px;
  display: flex;
  gap: 20px;
  height: calc(100vh - 350px);
  min-height: 0;
}

.editor-container {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--el-border-color);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.input-panel {
  width: 45%;
  display: flex;
  flex-direction: column;
}

.output-panel {
  width: 55%;
  display: flex;
  flex-direction: column;
}

.tree-view-container {
  flex: 1;
  overflow: auto;
  padding: 12px;
  background: var(--el-bg-color-page);
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.6;
}

.editor-header {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.custom-tree-node {
  font-family: monospace;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

.json-key {
  color: var(--el-color-primary);
  font-weight: 500;
}

.json-separator {
  color: var(--el-text-color-regular);
  margin: 0 4px;
}

.json-string {
  color: var(--el-color-success);
}

.json-number {
  color: var(--el-color-danger);
}

.json-boolean {
  color: var(--el-color-warning);
}

.json-null {
  color: var(--el-color-info);
  font-style: italic;
}

.error-alert {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: auto;
}

:deep(.el-textarea__inner) {
  font-family: monospace;
  font-size: 14px;
  line-height: 1.6;
  flex: 1;
  resize: none;
}

:deep(.el-textarea) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.json-object-value {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-left: 4px;
}

:deep(.el-tree) {
  height: 100%;
  overflow: auto;
}
</style> 