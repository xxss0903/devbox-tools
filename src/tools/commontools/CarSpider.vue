<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import axios from 'axios'

interface CarBrand {
  id: string
  name: string
  logo?: string
}

interface CarModel {
  id: string
  name: string
  price: string
  year: string
}

const brands = ref<CarBrand[]>([])
const models = ref<CarModel[]>([])
const loading = ref(false)
const selectedBrand = ref('')

const fetchBrands = async () => {
  try {
    loading.value = true
    // 这里需要根据实际情况修改API地址
    const response = await axios.get('https://www.autohome.com.cn/ashx/AjaxIndexCarFind.ashx?type=1')
    brands.value = response.data.result
    ElMessage.success('品牌数据获取成功')
  } catch (error) {
    ElMessage.error('获取品牌数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const fetchModels = async (brandId: string) => {
  if (!brandId) return
  try {
    loading.value = true
    // 这里需要根据实际情况修改API地址
    const response = await axios.get(`https://www.autohome.com.cn/ashx/AjaxIndexCarFind.ashx?type=3&brandid=${brandId}`)
    models.value = response.data.result
    ElMessage.success('车型数据获取成功')
  } catch (error) {
    ElMessage.error('获取车型数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleBrandSelect = (brandId: string) => {
  selectedBrand.value = brandId
  fetchModels(brandId)
}

const exportData = () => {
  const data = {
    brand: brands.value.find(b => b.id === selectedBrand.value),
    models: models.value
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `car_data_${selectedBrand.value}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="car-spider p-4">
    <div class="mb-4">
      <h2 class="text-xl font-bold mb-4">汽车之家数据爬取</h2>
      <el-button type="primary" @click="fetchBrands" :loading="loading">
        获取品牌列表
      </el-button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="brand-list">
        <h3 class="text-lg font-semibold mb-2">品牌列表</h3>
        <el-scrollbar height="400px">
          <el-radio-group v-model="selectedBrand" class="flex flex-col gap-2">
            <el-radio
              v-for="brand in brands"
              :key="brand.id"
              :label="brand.id"
              @change="() => handleBrandSelect(brand.id)"
            >
              {{ brand.name }}
            </el-radio>
          </el-radio-group>
        </el-scrollbar>
      </div>

      <div class="model-list">
        <h3 class="text-lg font-semibold mb-2">车型列表</h3>
        <el-scrollbar height="400px">
          <el-table :data="models" style="width: 100%">
            <el-table-column prop="name" label="车型名称" />
            <el-table-column prop="price" label="价格" width="120" />
            <el-table-column prop="year" label="年份" width="100" />
          </el-table>
        </el-scrollbar>
      </div>
    </div>

    <div class="mt-4">
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