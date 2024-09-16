<template>
  <div class="loan-calculator" @keydown.enter="handleEnter" tabindex="0">
    <div class="display">
      <div class="result-item">贷款金额: <span>{{ loanAmount }} 元</span></div>
      <div class="result-item">利率: <span>{{ interestRate }} {{ isMonthlyRate ? '% (月利率)' : '% (年利率)' }}</span></div>
      <div class="result-item">贷款期限: <span>{{ loanTerm }} {{ isMonthlyRate ? '月' : '年' }}</span></div>
      <div class="result-item">月供: <span>{{ monthlyPayment }} 元</span></div>
      <div class="result-item">总还款额: <span>{{ totalPayment }} 元</span></div>
      <div class="result-item">总利息: <span>{{ totalInterest }} 元</span></div>
    </div>
    <div class="inputs">
      <div class="input-group">
        <label for="loanAmount">贷款金额 (元):</label>
        <input id="loanAmount" v-model="loanAmount" type="number" @input="calculate" />
      </div>
      <div class="input-group">
        <label for="interestRate">利率 (%):</label>
        <input id="interestRate" v-model="interestRate" type="number" step="0.01" @input="calculate" />
      </div>
      <div class="input-group">
        <label for="loanTerm">贷款期限:</label>
        <input id="loanTerm" v-model="loanTerm" type="number" @input="calculate" />
      </div>
      <div class="input-group checkbox">
        <label>
          <input type="checkbox" v-model="isMonthlyRate" @change="calculate" />
          按月息计算
        </label>
      </div>
    </div>
    <div class="buttons">
      <button @click="calculate" class="calculate-btn">计算</button>
      <button @click="reset" class="reset-btn">重置</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loanAmount = ref(100000)
const interestRate = ref(4.9)
const loanTerm = ref(30)
const isMonthlyRate = ref(false)
const monthlyPayment = ref('0')
const totalPayment = ref('0')
const totalInterest = ref('0')

const calculate = () => {
  const principal = Number(loanAmount.value)
  let rate = Number(interestRate.value) / 100
  let term = Number(loanTerm.value)

  if (!isMonthlyRate.value) {
    rate = rate / 12
    term = term * 12
  }

  if (principal > 0 && rate > 0 && term > 0) {
    const x = Math.pow(1 + rate, term)
    const monthly = (principal * x * rate) / (x - 1)
    
    monthlyPayment.value = monthly.toFixed(2)
    totalPayment.value = (monthly * term).toFixed(2)
    totalInterest.value = ((monthly * term) - principal).toFixed(2)
  } else {
    reset()
  }
}

const reset = () => {
  monthlyPayment.value = '0'
  totalPayment.value = '0'
  totalInterest.value = '0'
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    calculate()
  }
}

onMounted(() => {
  calculate()
})
</script>

<style scoped>
.loan-calculator {
  width: 100%;
  max-width: 400px;
  background-color: #f0f0f0;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 15px;
  font-size: 14px;
}

.display {
  background-color: #ffffff;
  color: #333;
  padding: 10px;
  border-radius: 5px;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.result-item span {
  font-weight: bold;
}

.inputs {
  display: grid;
  gap: 10px;
  margin-bottom: 15px;
}

.input-group {
  display: flex;
  align-items: center;
}

.input-group label {
  flex: 1;
  margin-right: 10px;
}

.input-group input {
  flex: 2;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.checkbox {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.checkbox input {
  margin-right: 5px;
}

.buttons {
  display: flex;
  gap: 10px;
}

button {
  flex: 1;
  padding: 10px;
  font-size: 14px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.calculate-btn {
  background-color: #4CAF50;
  color: white;
}

.reset-btn {
  background-color: #f44336;
  color: white;
}

button:hover {
  opacity: 0.8;
}

@media (max-width: 400px) {
  .loan-calculator {
    max-width: 100%;
    padding: 10px;
  }

  .input-group {
    flex-direction: column;
    align-items: flex-start;
  }

  .input-group label {
    margin-bottom: 5px;
  }

  .input-group input {
    width: 100%;
  }
}
</style>