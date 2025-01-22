<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import BrandTree from './carspider/BrandTree.vue'
import type { CarBrand } from './carspider/types'

interface CarModel {
  id: string
  name: string
  price: string
  year: string
  specs?: {
    engine?: string
    transmission?: string
    fuelType?: string
  }
}

const models = ref<CarModel[]>([])
const loading = ref(false)
const selectedBrandId = ref('')
const searchKeyword = ref('')

const fetchModels = async (brandId: string) => {
  if (!brandId) return
  try {
    loading.value = true
    const result = await window.electronAPI.fetchCarModels({ brandId })
    if (result.success) {
      models.value = result.data
      ElMessage.success('车型数据获取成功')
    } else {
      throw new Error(result.message)
    }
  } catch (error: any) {
    ElMessage.error('获取车型数据失败：' + error.message)
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleBrandSelect = (brand: CarBrand) => {
  fetchModels(brand.id)
}

const exportData = () => {
  const data = {
    brand: selectedBrandId.value,
    models: models.value,
    exportTime: new Date().toISOString(),
    source: '汽车之家'
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `car_data_${selectedBrandId.value}_${new Date().getTime()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const filteredModels = computed(() => {
  if (!searchKeyword.value) return models.value
  const keyword = searchKeyword.value.toLowerCase()
  return models.value.filter(model => 
    model.name.toLowerCase().includes(keyword) ||
    model.price.toLowerCase().includes(keyword) ||
    model.year.toLowerCase().includes(keyword)
  )
})
</script>

<template>
  <div class="car-spider p-4">
    <div class="mb-4">
      <h2 class="text-xl font-bold mb-4">汽车之家数据爬取</h2>
      <div class="flex gap-4 items-center">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索车型..."
          clearable
          class="w-64"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="brand-list">
        <h3 class="text-lg font-semibold mb-2">品牌列表</h3>
        <BrandTree
          v-model="selectedBrandId"
          @select="handleBrandSelect"
          class="h-[400px]"
        />
      </div>

      <div class="model-list">
        <h3 class="text-lg font-semibold mb-2">车型列表</h3>
        <el-scrollbar height="400px">
          <el-table :data="filteredModels" style="width: 100%" v-loading="loading">
            <el-table-column prop="name" label="车型名称" min-width="150" />
            <el-table-column prop="price" label="价格" width="120" />
            <el-table-column prop="year" label="年份" width="80" />
            <el-table-column label="配置" width="200">
              <template #default="{ row }">
                <div class="text-xs">
                  <div v-if="row.specs?.engine">发动机：{{ row.specs.engine }}</div>
                  <div v-if="row.specs?.transmission">变速箱：{{ row.specs.transmission }}</div>
                  <div v-if="row.specs?.fuelType">燃料：{{ row.specs.fuelType }}</div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-scrollbar>
      </div>
    </div>

    <div class="mt-4 flex justify-between items-center">
      <div class="text-sm text-gray-500">
        共找到 {{ filteredModels.length }} 个车型
      </div>
      <el-button type="success" @click="exportData" :disabled="!models.length">
        导出数据
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.car-spider {
  min-height: 600px;
}
</style> 