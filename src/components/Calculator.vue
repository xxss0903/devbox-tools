<template>
  <div>
    <NavigationBar title="计算器" />
    <div class="calculator-container">
      <div class="calculator-sidebar">
        <h3>计算器类型</h3>
        <ul>
          <li v-for="type in calculatorTypes" :key="type.id" @click="selectCalculator(type.id)" :class="{ active: selectedType === type.id }">
            {{ type.name }}
          </li>
        </ul>
      </div>
      <div class="calculator-content">
        <div v-if="selectedType === 'standard'" class="calculator-wrapper">
          <input type="text" :value="display" readonly class="display" />
          <div class="buttons">
            <button v-for="btn in standardButtons" :key="btn" @click="handleClick(btn)" class="btn">{{ btn }}</button>
          </div>
        </div>
        <div v-else-if="selectedType === 'scientific'" class="calculator-wrapper">
          <!-- 科学计算器的内容 -->
          <p>科学计算器功能正在开发中...</p>
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

const display = ref('')
const standardButtons = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+', 'C']
const selectedType = ref('standard')

const calculatorTypes = [
  { id: 'standard', name: '普通计算器' },
  { id: 'scientific', name: '科学计算器' },
  { id: 'loan', name: '贷款计算器' },
]

const selectCalculator = (typeId: string) => {
  selectedType.value = typeId
}

const handleClick = (value: string) => {
  if (value === '=') {
    try {
      display.value = eval(display.value).toString()
    } catch (e) {
      display.value = '错误'
    }
  } else if (value === 'C') {
    display.value = ''
  } else {
    display.value += value
  }
}
</script>

<style scoped>
.calculator-container {
  display: flex;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.calculator-sidebar {
  width: 200px;
  padding-right: 20px;
  border-right: 1px solid #ddd;
}

.calculator-sidebar h3 {
  margin-bottom: 10px;
}

.calculator-sidebar ul {
  list-style-type: none;
  padding: 0;
}

.calculator-sidebar li {
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.calculator-sidebar li:hover, .calculator-sidebar li.active {
  background-color: #e0e0e0;
}

.calculator-content {
  flex-grow: 1;
  padding-left: 20px;
}

.calculator-wrapper {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
}

.display {
  width: 100%;
  margin-bottom: 15px;
  padding: 10px;
  font-size: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.btn {
  padding: 15px;
  font-size: 18px;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #45a049;
}
</style>