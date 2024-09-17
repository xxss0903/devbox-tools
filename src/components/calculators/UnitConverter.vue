<template>
  <div class="unit-converter">
    <div class="unit-type-selector">
      <button v-for="type in unitTypes" :key="type" @click="selectUnitType(type)" :class="{ active: selectedType === type }">
        {{ type }}
      </button>
    </div>
    <div class="converter-input">
      <input v-model="inputValue" type="number" @input="convert" placeholder="输入数值">
      <span class="default-unit">{{ defaultUnits[selectedType] }}</span>
    </div>
    <div class="conversion-results">
      <div v-for="unit in units[selectedType]" :key="unit" class="result-item">
        <span class="unit-name">{{ unit }}:</span>
        <span class="unit-value">{{ results[unit] || '-' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const unitTypes = ['长度', '重量', '温度', '体积']
const selectedType = ref('长度')

const units = {
  长度: ['米', '厘米', '毫米', '千米', '英寸', '英尺', '码', '英里'],
  重量: ['克', '千克', '毫克', '吨', '磅', '盎司'],
  温度: ['摄氏度', '华氏度', '开尔文'],
  体积: ['升', '毫升', '立方米', '立方厘米', '加仑', '夸脱', '品脱']
}

const defaultUnits = {
  长度: '米',
  重量: '克',
  温度: '摄氏度',
  体积: '升'
}

const inputValue = ref('')
const results = ref<{ [key: string]: string }>({})

const selectUnitType = (type: string) => {
  selectedType.value = type
  convert()
}

const convert = () => {
  const value = parseFloat(inputValue.value)
  const fromUnit = defaultUnits[selectedType.value]

  if (isNaN(value)) {
    results.value = {}
    return
  }

  results.value = Object.fromEntries(
    units[selectedType.value].map(toUnit => [
      toUnit,
      performConversion(value, fromUnit, toUnit).toFixed(4)
    ])
  )
}

watch([selectedType, inputValue], convert)

const performConversion = (value: number, from: string, to: string): number => {
  if (selectedType.value === '温度') {
    return convertTemperature(value, from, to)
  }

  const baseUnit = units[selectedType.value][0]
  const fromBase = convertToBase(value, from, baseUnit)
  return convertFromBase(fromBase, to, baseUnit)
}

const convertToBase = (value: number, from: string, baseUnit: string): number => {
  const conversionFactors: { [key: string]: number } = {
    // 长度 (基准: 米)
    米: 1, 厘米: 0.01, 毫米: 0.001, 千米: 1000, 英寸: 0.0254, 英尺: 0.3048, 码: 0.9144, 英里: 1609.344,
    // 重量 (基准: 克)
    克: 1, 千克: 1000, 毫克: 0.001, 吨: 1000000, 磅: 453.592, 盎司: 28.3495,
    // 体积 (基准: 升)
    升: 1, 毫升: 0.001, 立方米: 1000, 立方厘米: 0.001, 加仑: 3.78541, 夸脱: 0.946353, 品脱: 0.473176
  }
  return value * conversionFactors[from]
}

const convertFromBase = (value: number, to: string, baseUnit: string): number => {
  const conversionFactors: { [key: string]: number } = {
    // 长度 (基准: 米)
    米: 1, 厘米: 100, 毫米: 1000, 千米: 0.001, 英寸: 39.3701, 英尺: 3.28084, 码: 1.09361, 英里: 0.000621371,
    // 重量 (基准: 克)
    克: 1, 千克: 0.001, 毫克: 1000, 吨: 0.000001, 磅: 0.00220462, 盎司: 0.035274,
    // 体积 (基准: 升)
    升: 1, 毫升: 1000, 立方米: 0.001, 立方厘米: 1000, 加仑: 0.264172, 夸脱: 1.05669, 品脱: 2.11338
  }
  return value * conversionFactors[to]
}

const convertTemperature = (value: number, from: string, to: string): number => {
  let celsius: number

  // 转换为摄氏度
  if (from === '摄氏度') {
    celsius = value
  } else if (from === '华氏度') {
    celsius = (value - 32) * 5 / 9
  } else if (from === '开尔文') {
    celsius = value - 273.15
  }

  // 从摄氏度转换为目标单位
  if (to === '摄氏度') {
    return celsius
  } else if (to === '华氏度') {
    return celsius * 9 / 5 + 32
  } else if (to === '开尔文') {
    return celsius + 273.15
  }

  return 0 // 这行代码不应该被执行,只是为了满足TypeScript的返回值要求
}
</script>

<style scoped>
.unit-converter {
  width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.unit-type-selector {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.unit-type-selector button {
  padding: 8px 12px;
  background-color: #e0e0e0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
}

.unit-type-selector button.active {
  background-color: #4CAF50;
  color: white;
}

.converter-input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.default-unit {
  font-size: 16px;
  font-weight: bold;
  color: #4CAF50;
  min-width: 60px;
  text-align: right;
}

.conversion-results {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.result-item {
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 40px;
}

.unit-name {
  font-weight: bold;
  font-size: 14px;
}

.unit-value {
  color: #4CAF50;
  font-size: 14px;
  text-align: right;
  word-break: break-all;
}
</style>