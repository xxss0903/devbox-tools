<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fabric } from 'fabric'
import NavigationBar from './NavigationBar.vue'
import CanvasStampEditor from './CanvasStampEditor.vue'
import InvoiceStampEditor from './InvoiceStampEditor.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const editorType = ref('invoice')

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="stamp-editor">
    <NavigationBar title="印章编辑器" @goBack="goBack" />

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
