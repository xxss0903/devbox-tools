<template>
  <div class="calculator">
    <h2>计算器</h2>
    <input type="text" v-model="display" readonly />
    <div class="buttons">
      <button v-for="btn in buttons" :key="btn" @click="handleClick(btn)">{{ btn }}</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Calculator',
  setup() {
    const display = ref('')
    const buttons = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+', 'C']

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

    return {
      display,
      buttons,
      handleClick
    }
  }
})
</script>

<style scoped>
.calculator {
  max-width: 300px;
  margin: 0 auto;
}

input {
  width: 100%;
  margin-bottom: 10px;
  padding: 5px;
  font-size: 18px;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
}

button {
  padding: 10px;
  font-size: 18px;
  cursor: pointer;
}
</style>