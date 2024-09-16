<template>
  <div class="standard-calculator" @keydown.enter="handleEnter" tabindex="0">
    <div class="display">{{ display || '0' }}</div>
    <div class="buttons">
      <button 
        v-for="btn in standardButtons" 
        :key="btn.value" 
        @click="handleClick(btn.value)" 
        :class="[btn.type, { 'span-two': btn.spanTwo }]"
      >
        {{ btn.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const display = ref('')

const standardButtons = [
  { label: 'AC', value: 'clear', type: 'function' },
  { label: '±', value: 'negate', type: 'function' },
  { label: '%', value: 'percent', type: 'function' },
  { label: '÷', value: '/', type: 'operator' },
  { label: '7', value: '7', type: 'number' },
  { label: '8', value: '8', type: 'number' },
  { label: '9', value: '9', type: 'number' },
  { label: '×', value: '*', type: 'operator' },
  { label: '4', value: '4', type: 'number' },
  { label: '5', value: '5', type: 'number' },
  { label: '6', value: '6', type: 'number' },
  { label: '−', value: '-', type: 'operator' },
  { label: '1', value: '1', type: 'number' },
  { label: '2', value: '2', type: 'number' },
  { label: '3', value: '3', type: 'number' },
  { label: '+', value: '+', type: 'operator' },
  { label: '0', value: '0', type: 'number', spanTwo: true },
  { label: '.', value: '.', type: 'number' },
  { label: '=', value: '=', type: 'operator' },
]

const calculate = () => {
  try {
    // 使用 Function 构造器来安全地评估表达式
    const result = new Function('return ' + display.value)()
    display.value = Number.isFinite(result) ? result.toString() : '错误'
  } catch (e) {
    display.value = '错误'
  }
}

const handleClick = (value: string) => {
  if (value === '=') {
    calculate()
  } else if (value === 'clear') {
    display.value = ''
  } else if (value === 'negate') {
    // 处理正负号
    if (display.value !== '' && display.value !== '0') {
      display.value = display.value.startsWith('-') ? display.value.slice(1) : '-' + display.value
    }
  } else if (value === 'percent') {
    // 处理百分号
    try {
      const result = parseFloat(display.value) / 100
      display.value = result.toString()
    } catch (e) {
      display.value = '错误'
    }
  } else {
    display.value += value
  }
}

const handleEnter = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault() // 防止默认行为
    calculate()
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  const key = event.key

  if (/^[0-9.]$/.test(key)) {
    handleClick(key)
  } else if (['+', '-', '*', '/'].includes(key)) {
    handleClick(key)
  } else if (key === 'Enter') {
    handleClick('=')
  } else if (key === 'Backspace') {
    handleClick('delete')
  } else if (key === 'Escape') {
    handleClick('clear')
  }
}

defineExpose({ handleKeyDown })

onMounted(() => {
  window.addEventListener('keydown', handleEnter)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEnter)
})
</script>

<style scoped>
.standard-calculator {
  width: 100%;
  max-width: 300px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.display {
  background-color: #ffffff;
  color: #333;
  font-size: 2.5rem;
  text-align: right;
  padding: 20px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background-color: #e0e0e0;
  padding: 1px;
}

button {
  border: none;
  font-size: 1.2rem;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #ffffff;
}

button:active {
  transform: scale(0.95);
}

.number {
  color: #333;
}

.operator {
  background-color: #f8a51d;
  color: #ffffff;
}

.function {
  background-color: #e0e0e0;
  color: #333;
}

.span-two {
  grid-column: span 2;
}

button:hover {
  opacity: 0.8;
}

@media (max-width: 400px) {
  .standard-calculator {
    max-width: 100%;
  }
}

.standard-calculator {
  /* 添加以下属性以使组件可聚焦 */
  outline: none;
}
</style>