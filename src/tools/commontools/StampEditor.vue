<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CanvasStampEditor from './CanvasStampEditor.vue'
import InvoiceStampEditor from './InvoiceStampEditor.vue'

const editorType = ref('invoice')

</script>

<template>
  <div class="stamp-editor">
    <div class="editor-selector">
      <select v-model="editorType">
        <option value="invoice">发票章制作</option>
        <option value="standard">标准印章制作</option>
      </select>
    </div>

    <CanvasStampEditor v-if="editorType === 'standard'" />
    <InvoiceStampEditor v-else-if="editorType === 'invoice'" />
  </div>
</template>

<style scoped>
.text-input,
.size-input {
  margin-right: 10px;
  padding: 5px;
}

.canvas-full {
  width: 100%;
  height: 100%;
}

.editor-selector {
  margin-bottom: 20px;
}

select {
  padding: 5px;
  font-size: 16px;
}
</style>
