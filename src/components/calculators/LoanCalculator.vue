<template>
  <div class="loan-calculator" @keydown.enter="handleEnter" tabindex="0">
    <div class="display">
      <div>贷款金额: {{ loanAmount }} 元</div>
      <div>
        利率: {{ interestRate }} {{ isMonthlyRate ? '% (月利率)' : '% (年利率)' }}
      </div>
      <div>贷款期限: {{ loanTerm }} {{ isMonthlyRate ? '月' : '年' }}</div>
      <div>月供: {{ monthlyPayment }} 元</div>
      <div>总还款额: {{ totalPayment }} 元</div>
      <div>总利息: {{ totalInterest }} 元</div>
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
      <div class="input-group">
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

const handleEnter = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
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
  max-width: 500px;
  background-color: #f0f0f0;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 90%;
  overflow: hidden;
}

.display {
  background-color: #ffffff;
  color: #333;
  font-size: 1.2rem;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 5px;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  flex-shrink: 0;
}

.display div {
  margin-bottom: 10px;
}

.inputs {
  display: grid;
  gap: 15px;
  margin-bottom: 20px;
  overflow-y: auto;
  padding: 0 20px;
  flex-grow: 1;
}

.input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}

.buttons {
  display: flex;
  gap: 10px;
  padding: 20px;
  background-color: #f0f0f0;
  border-top: 1px solid #ddd;
  flex-shrink: 0;
}

button {
  flex: 1;
  padding: 10px;
  font-size: 1rem;
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

input[type="checkbox"] {
  margin-right: 5px;
}

@media (max-width: 500px) {
  .loan-calculator {
    max-width: 100%;
    height: 90%;
  }

  .inputs {
    padding: 0 10px;
  }

  .buttons {
    padding: 10px;
  }
}
</style>