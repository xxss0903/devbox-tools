<template>
  <div class="home">
    <div class="welcome-section">
      <h1>欢迎使用铁牛工具箱</h1>
      <p>一站式开发工具集合，提升您的工作效率</p>
    </div>

    <div class="tools-grid">
      <!-- 常用工具卡片 -->
      <div class="tool-category">
        <h2>常用工具</h2>
        <div class="tool-cards">
          <div class="tool-card" @click="navigateTo('ProjectManageTools')">
            <el-icon><Folder /></el-icon>
            <div class="tool-info">
              <h3>项目管理</h3>
              <p>管理您的所有项目</p>
            </div>
          </div>

          <div class="tool-card" @click="navigateTo('WorkDiary')">
            <el-icon><Calendar /></el-icon>
            <div class="tool-info">
              <h3>工作日记</h3>
              <p>记录每日工作内容</p>
            </div>
          </div>

          <div class="tool-card" @click="navigateTo('ImageTools')">
            <el-icon><Picture /></el-icon>
            <div class="tool-info">
              <h3>图片工具</h3>
              <p>图片处理工具集</p>
            </div>
          </div>

          <div class="tool-card" @click="navigateTo('PDFTools')">
            <el-icon><Document /></el-icon>
            <div class="tool-info">
              <h3>PDF工具</h3>
              <p>PDF处理工具集</p>
            </div>
          </div>
        </div>
      </div>

      <!-- AI工具卡片 -->
      <div class="tool-category">
        <h2>AI助手</h2>
        <div class="tool-cards">
          <div class="tool-card" @click="navigateTo('ChatAI')">
            <el-icon><ChatDotRound /></el-icon>
            <div class="tool-info">
              <h3>智能问答</h3>
              <p>AI助手随时为您解答问题</p>
            </div>
          </div>

          <div class="tool-card" @click="navigateTo('WeeklyReportAI')">
            <el-icon><Memo /></el-icon>
            <div class="tool-info">
              <h3>周报助手</h3>
              <p>智能生成工作周报</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近使用 -->
      <div class="tool-category" v-if="recentTools.length > 0">
        <h2>最近使用</h2>
        <div class="tool-cards">
          <div v-for="tool in recentTools" 
               :key="tool.route" 
               class="tool-card"
               @click="navigateTo(tool.route)">
            <el-icon>
              <component :is="tool.icon || 'Document'" />
            </el-icon>
            <div class="tool-info">
              <h3>{{ tool.name }}</h3>
              <p>{{ tool.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Folder,
  Calendar,
  Picture,
  Document,
  ChatDotRound,
  Memo
} from '@element-plus/icons-vue'
import { defaultImageTools, defaultCommonTools, defaultAITools, defaultProjectTools } from '@/defaultTools'

const router = useRouter()
const MAX_RECENT_TOOLS = 4 // 最大显示数量

// 合并所有工具列表
const allTools = [
  ...defaultImageTools,
  ...defaultCommonTools,
  ...defaultAITools,
  ...defaultProjectTools
].map(tool => ({
  name: tool.title,
  value: tool.value,
  icon: tool.icon || 'Document',
  url: tool.url
}))

// 最近使用的工具列表
const recentTools = ref<any[]>([])

// 从本地存储加载最近使用的工具
const loadRecentTools = () => {
  const savedTools = localStorage.getItem('recentTools')
  console.log('recentTools', savedTools)
  if (savedTools) {
    recentTools.value = JSON.parse(savedTools)
  }
}

// 更新最近使用的工具
const updateRecentTools = (route: string) => {
  // 查找当前工具信息
  const tool = allTools.find(t => t.value === route)
  if (!tool) return

  const recentTool = {
    name: tool.name,
    description: tool.description || '常用工具',
    route: tool.value,
    icon: tool.icon,
    lastUsed: new Date().getTime()
  }

  // 从现有列表中移除相同的工具（如果存在）
  const existingIndex = recentTools.value.findIndex(t => t.route === route)
  if (existingIndex !== -1) {
    recentTools.value.splice(existingIndex, 1)
  }

  // 添加到列表开头
  recentTools.value.unshift(recentTool)

  // 保持最大显示数量
  if (recentTools.value.length > MAX_RECENT_TOOLS) {
    recentTools.value = recentTools.value.slice(0, MAX_RECENT_TOOLS)
  }

  // 保存到本地存储
  localStorage.setItem('recentTools', JSON.stringify(recentTools.value))
}

const navigateTo = (route: string) => {
  updateRecentTools(route)
  router.push({ name: route })
}

// 组件挂载时加载最近使用的工具
onMounted(() => {
  loadRecentTools()
})
</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 0;
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.welcome-section h1 {
  font-size: 32px;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
}

.welcome-section p {
  font-size: 16px;
  color: var(--el-text-color-secondary);
}

.tools-grid {
  display: grid;
  gap: 32px;
}

.tool-category {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.tool-category h2 {
  font-size: 20px;
  margin-bottom: 20px;
  color: var(--el-text-color-primary);
}

.tool-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--el-color-primary);
}

.tool-card .el-icon {
  font-size: 24px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 12px;
  border-radius: 8px;
}

.tool-info {
  flex: 1;
}

.tool-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.tool-info p {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
</style>
