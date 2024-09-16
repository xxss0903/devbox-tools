<template>
  <div class="scientific-calculator" @keydown.enter="handleEnter" tabindex="0">
    <div class="display">{{ display || '0' }}</div>
    <div class="buttons">
      <div class="scientific-functions">
        <button 
          v-for="btn in scientificFunctions" 
          :key="btn.value" 
          @click="handleClick(btn.value)" 
          :class="btn.type"
        >
          {{ btn.label }}
        </button>
      </div>
      <div class="number-pad">
        <button 
          v-for="btn in numberPad" 
          :key="btn.value" 
          @click="handleClick(btn.value)" 
          :class="btn.type"
        >
          {{ btn.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const display = ref('')
const isError = ref(false)

const scientificFunctions = [
  { label: 'sin', value: 'sin', type: 'function' },
  { label: 'cos', value: 'cos', type: 'function' },
  { label: 'tan', value: 'tan', type: 'function' },
  { label: 'asin', value: 'asin', type: 'function' },
  { label: 'acos', value: 'acos', type: 'function' },
  { label: 'atan', value: 'atan', type: 'function' },
  { label: 'sinh', value: 'sinh', type: 'function' },
  { label: 'cosh', value: 'cosh', type: 'function' },
  { label: 'tanh', value: 'tanh', type: 'function' },
  { label: 'log', value: 'log', type: 'function' },
  { label: 'ln', value: 'ln', type: 'function' },
  { label: 'log2', value: 'log2', type: 'function' },
  { label: 'e^x', value: 'exp', type: 'function' },
  { label: '(', value: '(', type: 'operator' },
  { label: ')', value: ')', type: 'operator' },
  { label: 'π', value: 'Math.PI', type: 'constant' },
  { label: 'e', value: 'Math.E', type: 'constant' },
  { label: 'x^y', value: '**', type: 'operator' },
  { label: '√', value: 'sqrt', type: 'function' },
  { label: 'x²', value: '**2', type: 'operator' },
  { label: '|x|', value: 'abs', type: 'function' },
  { label: 'x!', value: 'factorial', type: 'function' },
  { label: 'Rand', value: 'random', type: 'function' },
  { label: '°→rad', value: 'toRadians', type: 'function' },
  { label: 'rad→°', value: 'toDegrees', type: 'function' },
]

const numberPad = [
  { label: '7', value: '7', type: 'number' },
  { label: '8', value: '8', type: 'number' },
  { label: '9', value: '9', type: 'number' },
  { label: '÷', value: '/', type: 'operator' },
  { label: '4', value: '4', type: 'number' },
  { label: '5', value: '5', type: 'number' },
  { label: '6', value: '6', type: 'number' },
  { label: '×', value: '*', type: 'operator' },
  { label: '1', value: '1', type: 'number' },
  { label: '2', value: '2', type: 'number' },
  { label: '3', value: '3', type: 'number' },
  { label: '−', value: '-', type: 'operator' },
  { label: '0', value: '0', type: 'number' },
  { label: '.', value: '.', type: 'number' },
  { label: '=', value: '=', type: 'operator' },
  { label: '+', value: '+', type: 'operator' },
  { label: 'AC', value: 'clear', type: 'function' },
  { label: 'DEL', value: 'delete', type: 'function' },
]

const calculate = () => {
  try {
    // 自动补齐右括号
    let expression = display.value;
    const leftParenCount = (expression.match(/\(/g) || []).length;
    const rightParenCount = (expression.match(/\)/g) || []).length;
    const missingParenCount = leftParenCount - rightParenCount;
    if (missingParenCount > 0) {
      expression += ')'.repeat(missingParenCount);
    }

    // 替换特殊函数
    expression = expression
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/asin/g, 'Math.asin')
      .replace(/acos/g, 'Math.acos')
      .replace(/atan/g, 'Math.atan')
      .replace(/sinh/g, 'Math.sinh')
      .replace(/cosh/g, 'Math.cosh')
      .replace(/tanh/g, 'Math.tanh')
      .replace(/log/g, 'Math.log10')
      .replace(/ln/g, 'Math.log')
      .replace(/log2/g, 'Math.log2')
      .replace(/exp/g, 'Math.exp')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/abs/g, 'Math.abs')
      .replace(/random/g, 'Math.random')
      .replace(/toRadians/g, '(x => x * Math.PI / 180)')
      .replace(/toDegrees/g, '(x => x * 180 / Math.PI)')
      .replace(/factorial\(([^)]+)\)/g, (_, n) => {
        return `(${n} => { let f = 1; for(let i = 2; i <= ${n}; i++) f *= i; return f; })(Math.round(${n}))`
      })
    
    const result = new Function('return ' + expression)()
    display.value = Number.isFinite(result) ? result.toString() : '错误'
    isError.value = !Number.isFinite(result)
  } catch (e) {
    display.value = '错误'
    isError.value = true
  }
}

const handleClick = (value: string) => {
  if (isError.value && value !== 'clear') {
    display.value = ''
    isError.value = false
  }

  if (value === '=') {
    calculate()
  } else if (value === 'clear') {
    display.value = ''
    isError.value = false
  } else if (value === 'delete') {
    display.value = display.value.slice(0, -1)
  } else if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'log', 'ln', 'log2', 'exp', 'sqrt', 'abs', 'factorial', 'random', 'toRadians', 'toDegrees'].includes(value)) {
    display.value += `${value}(`
  } else {
    display.value += value
  }
}

const handleEnter = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    calculate()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEnter)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEnter)
})
</script>

<style scoped>
.scientific-calculator {
  width: 100%;
  max-width: 600px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  outline: none;
}

.display {
  background-color: #ffffff;
  color: #333;
  font-size: 1.8rem;
  text-align: right;
  padding: 20px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.buttons {
  display: flex;
  background-color: #e0e0e0;
  padding: 1px;
}

.scientific-functions {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1px;
  flex: 3;
}

.number-pad {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  flex: 2;
}

button {
  border: none;
  font-size: 0.9rem;
  padding: 12px 8px;
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
  background-color: #4CAF50;
  color: #ffffff;
}

.constant {
  background-color: #2196F3;
  color: #ffffff;
}

button:hover {
  opacity: 0.8;
}

@media (max-width: 600px) {
  .scientific-calculator {
    max-width: 100%;
  }
  
  .buttons {
    flex-direction: column;
  }
  
  .scientific-functions {
    grid-template-columns: repeat(4, 1fr);
  }
  
  button {
    font-size: 0.7rem;
    padding: 8px 4px;
  }
}
</style>