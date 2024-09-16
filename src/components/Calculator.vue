<template>
  <div class="calculator-wrapper" @keydown="handleKeyDown" tabindex="0">
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
      <div class="calculator-display">
        <StandardCalculator v-if="selectedType === 'standard'" ref="standardCalculator" />
        <ScientificCalculator v-else-if="selectedType === 'scientific'" ref="scientificCalculator" />
        <LoanCalculator v-else-if="selectedType === 'loan'" ref="loanCalculator" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import NavigationBar from '@/components/NavigationBar.vue'
import StandardCalculator from '@/components/calculators/StandardCalculator.vue'
import ScientificCalculator from '@/components/calculators/ScientificCalculator.vue'
import LoanCalculator from '@/components/calculators/LoanCalculator.vue'

const selectedType = ref('standard')
const standardCalculator = ref(null)
const scientificCalculator = ref(null)
const loanCalculator = ref(null)

const calculatorTypes = [
  { id: 'standard', name: '普通计算器' },
  { id: 'scientific', name: '科学计算器' },
  { id: 'loan', name: '贷款计算器' },
]

const selectCalculator = (typeId: string) => {
  selectedType.value = typeId
}

const handleKeyDown = (event: KeyboardEvent) => {
  const key = event.key
  let currentCalculator

  if (selectedType.value === 'standard') {
    currentCalculator = standardCalculator.value
  } else if (selectedType.value === 'scientific') {
    currentCalculator = scientificCalculator.value
  } else if (selectedType.value === 'loan') {
    currentCalculator = loanCalculator.value
  }

  if (currentCalculator && currentCalculator.handleKeyDown) {
    currentCalculator.handleKeyDown(event)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.calculator-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
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
  overflow-y: auto;
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

.calculator-display {
  flex: 1;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .calculator-container {
    flex-direction: column;
  }

  .calculator-sidebar {
    width: 100%;
    max-height: 150px;
    overflow-y: auto;
  }

  .calculator-display {
    align-items: center;
  }
}
</style>