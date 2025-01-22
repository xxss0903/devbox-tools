<script setup lang="ts">
import { ref, onMounted, watch, h, computed } from 'vue'
import { ElTree, ElSwitch } from 'element-plus'
import type Node from 'element-plus/es/components/tree/src/model/node'
import type { TreeNodeData } from 'element-plus/es/components/tree/src/tree.type'
import type { TreeProps } from 'element-plus/es/components/tree/src/tree.type'
import type { CarBrand, TreeNode } from './types'
import type { TreeComponentProps } from 'element-plus'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'select', brand: CarBrand): void
}>()

const treeData = ref<TreeNode[]>([])
const treeRef = ref<InstanceType<typeof ElTree>>()
const filterText = ref('')
const showOnlyNewEnergy = ref(false)

// 加载品牌数据
const loadBrandData = async () => {
  try {
    const response = await fetch('/src/tools/commontools/carspider/all_brands_tree_menu.json')
    const data = await response.json()
    treeData.value = formatTreeData(data.result)
  } catch (error) {
    console.error('加载品牌数据失败:', error)
  }
}

// 格式化树形数据
const formatTreeData = (data: TreeNode[]): TreeNode[] => {
  return data
}

// 统计信息
const statistics = computed(() => {
  let totalBrands = 0
  let totalSeries = 0
  let newEnergySeries = 0

  treeData.value.forEach(letterGroup => {
    letterGroup.branditems.forEach(brand => {
      totalBrands++
      brand.fctitems.forEach(factory => {
        factory.seriesitems.forEach(series => {
          if (series.state === 20) { // 只统计在售车型
            totalSeries++
            if (series.isnewenergy === 1) {
              newEnergySeries++
            }
          }
        })
      })
    })
  })

  return {
    brands: totalBrands,
    series: totalSeries,
    newEnergy: newEnergySeries
  }
})

// 树节点过滤
const filterNode = (value: string, data: TreeNodeData): boolean => {
  if (!value && !showOnlyNewEnergy.value) return true
  
  const searchText = value.toLowerCase()
  
  // 如果是字母分组
  if ('firstletter' in data) {
    return true // 字母分组始终显示
  }
  
  // 如果是品牌
  if ('logo' in data) {
    return !value || data.name.toLowerCase().includes(searchText)
  }
  
  // 如果是厂商
  if ('seriesitems' in data) {
    return !value || data.name.toLowerCase().includes(searchText)
  }
  
  // 如果是车系
  if ('state' in data) {
    const matchesSearch = !value || data.name.toLowerCase().includes(searchText)
    const matchesNewEnergy = !showOnlyNewEnergy.value || data.isnewenergy === 1
    const isOnSale = data.state === 20
    return matchesSearch && matchesNewEnergy && isOnSale
  }
  
  return true
}

// 处理节点点击
const handleNodeClick = (data: any, node: Node) => {
    console.log("click node", data, node)
  // 如果点击的是品牌
  if ('logo' in data) {
    emit('update:modelValue', data.id)
    emit('select', {
      id: data.id,
      name: data.name,
      logo: data.logo
    })
    
    // 展开当前节点
    if (!node.expanded) {
      node.expand()
    }
    
    // 展开所有子节点（厂商和车系）
    const expandChildren = (children: any[]) => {
      children.forEach(child => {
        const childNode = treeRef.value?.getNode(child)
        if (childNode && !childNode.expanded) {
          childNode.expand()
        }
        if (child.fctitems) {
          expandChildren(child.fctitems)
        }
        if (child.seriesitems) {
          expandChildren(child.seriesitems)
        }
      })
    }
    
    if (data.fctitems) {
      expandChildren(data.fctitems)
    }
  }
}

// 监听过滤条件变化
watch([filterText, showOnlyNewEnergy], () => {
  treeRef.value?.filter('')
})

// 自定义节点内容
const renderContent = (_: any, { data }: { data: any }) => {
  // 字母分组
  if ('firstletter' in data) {
    return h('span', { class: 'text-gray-400 font-bold' }, data.firstletter)
  }
  
  // 品牌
  if ('logo' in data) {
    return h('div', { class: 'custom-tree-node' }, [
      h('span', { class: 'text-blue-600' }, data.name)
    ])
  }
  
  // 厂商
  if ('seriesitems' in data) {
    return h('span', { class: 'text-gray-600' }, data.name)
  }
  
  // 车系
  if ('state' in data) {
    return h('span', { 
      class: {
        'text-sm': true,
        'text-green-600': data.isnewenergy === 1
      }
    }, `${data.name} (${data.speccount}款)${data.isnewenergy === 1 ? ' 🔋' : ''}`)
  }
  
  return h('span', {}, data.name || '')
}

// 定义树的配置
const treeProps = {
  children(data: any) {
    if ('branditems' in data) return data.branditems
    if ('fctitems' in data) return data.fctitems
    if ('seriesitems' in data) return data.seriesitems
    return []
  },
  label: 'name'
} as const

onMounted(() => {
  loadBrandData()
})
</script>

<template>
  <div class="brand-tree">
    <div class="mb-4 space-y-2">
      <div class="flex items-center gap-4">
        <el-input
          v-model="filterText"
          placeholder="搜索品牌/车系..."
          clearable
          class="flex-1"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-switch
          v-model="showOnlyNewEnergy"
          active-text="只看新能源"
          class="ml-2"
        />
      </div>
      <div class="text-xs text-gray-500 flex gap-4">
        <span>品牌数: {{ statistics.brands }}</span>
        <span>车系数: {{ statistics.series }}</span>
        <span>新能源车系: {{ statistics.newEnergy }}</span>
      </div>
    </div>

    <el-tree
      ref="treeRef"
      :data="treeData"
      :props="treeProps"
      :filter-node-method="filterNode"
      :render-content="renderContent"
      node-key="id"
      :default-expanded-keys="[]"
      :highlight-current="true"
      @node-click="handleNodeClick"
      class="brand-tree-content"
    />
  </div>
</template>

<style scoped>
.brand-tree {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.brand-tree-content {
  flex: 1;
  overflow-y: auto;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  font-size: 14px;
}

:deep(.el-tree-node__content) {
  height: 32px;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #ecf5ff;
}
</style> 