<template>
  <div class="calculator-page">
    <NavigationBar title="计算器" />
    <div class="calculator-container">
      <div class="calculator-sidebar">
        <h3>计算器类型</h3>
        <ul>
          <li 
            v-for="type in calculatorTypes" 
            :key="type.id" 
            @click="selectCalculator(type.id)" 
            :class="{ active: selectedType === type.id }"
          >
            {{ type.name }}
          </li>
        </ul>
      </div>
      <div class="calculator-content">
        <StandardCalculator v-if="selectedType === 'standard'" />
        <div v-else-if="selectedType === 'scientific'" class="calculator-wrapper">
          <!-- ... 科学计算器的内容 ... -->
        </div>
        <div v-else-if="selectedType === 'loan'" class="calculator-wrapper">
          <!-- 贷款计算器的内容 -->
          <p>贷款计算器功能正在开发中...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NavigationBar from '@/components/NavigationBar.vue'
import StandardCalculator from '@/components/calculators/StandardCalculator.vue'

const selectedType = ref('standard')

const calculatorTypes = [
  { id: 'standard', name: '普通计算器' },
  { id: 'scientific', name: '科学计算器' },
  { id: 'loan', name: '贷款计算器' },
]

const selectCalculator = (typeId: string) => {
  selectedType.value = typeId
}

// ... 保留科学计算器相关的代码 ...
</script>

<style scoped>
.calculator-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.calculator-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.calculator-sidebar {
  width: 200px;
  background-color: #f0f0f0;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.calculator-sidebar h3 {
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
}

.calculator-sidebar ul {
  list-style-type: none;
  padding: 0;
}

.calculator-sidebar li {
  padding: 10px;
  margin-bottom: 5px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.calculator-sidebar li:hover {
  background-color: #e0e0e0;
}

.calculator-sidebar li.active {
  background-color: #4CAF50;
  color: white;
}

.calculator-content {
  flex: 1;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.calculator-wrapper {
  max-width: 400px;
  width: 100%;
}
</style>