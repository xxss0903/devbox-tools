<template>
  <div class="container">
    <NavigationBar title="公章编辑器" @goBack="goBack" />
    <div class="canvas-container">
      <canvas ref="stampCanvas" width="300" height="300"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'

const router = useRouter()
const stampCanvas = ref<HTMLCanvasElement | null>(null)

const goBack = () => {
  router.back()
}

const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  const starPath = 'M 0 -1 L 0.588 0.809 L -0.951 -0.309 L 0.951 -0.309 L -0.588 0.809 Z'
  const pathData = starPath.split(/(?=[MLZ])/);

  ctx.save()
  ctx.translate(x, y)
  ctx.scale(r, r)
  ctx.beginPath()

  pathData.forEach(command => {
    const [cmd, ...params] = command.trim().split(/\s+/)
    switch (cmd) {
      case 'M':
        ctx.moveTo(parseFloat(params[0]), parseFloat(params[1]))
        break
      case 'L':
        ctx.lineTo(parseFloat(params[0]), parseFloat(params[1]))
        break
      case 'Z':
        ctx.closePath()
        break
    }
  })

  ctx.fillStyle = 'red'
  ctx.fill()
  ctx.restore()
}

const drawStamp = () => {
  const canvas = stampCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置画布背景
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 计算比例 (1mm = 1px)
  const scale = 5
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = 16 * scale / 2

  // 绘制外圆
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.strokeStyle = 'red'
  ctx.lineWidth = scale * 0
  ctx.stroke()

  // 绘制内圆
  // ctx.beginPath()
  // ctx.arc(centerX, centerY, radius - 2, 0, Math.PI * 2)
  // ctx.stroke()

  // 绘制五角星
  const starRadius = 16 * scale / 2
  drawStar(ctx, centerX, centerY, starRadius)

  // 绘制文字
  let companyFontSize = 8 * scale
  ctx.font = `${companyFontSize}px SimSun`
  ctx.fillStyle = 'red'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // 上半圆文字
  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.rotate(-Math.PI / 2)
  let companyName = '公章专用章'
  let companyNameArray = companyName.split('')
  for (let i = 0; i < companyName.length; i++) {
    const angle = i * Math.PI / 15
    ctx.rotate(Math.PI / 15)
    ctx.fillText(companyNameArray[i], 0, -radius + 7)
  }
  ctx.restore()

  // 下半圆文字
  ctx.fillText('专用章', centerX, centerY + radius - 10)

  // 绘制印章编码
  const codeHeight = 2 * scale;
  const codeBorderOffset = 1 * scale;
  ctx.font = `${codeHeight}px Arial`;
  ctx.fillStyle = 'red';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 设置印章编码
  const stampCode = '123456789';

  // 计算印章编码的位置
  const codeRadius = radius - codeBorderOffset - codeHeight / 2;

  // 绘制印章编码
  ctx.save();
  ctx.translate(centerX, centerY);
  for (let i = 0; i < stampCode.length; i++) {
    const angle = Math.PI / 2 + i * Math.PI / 18;
    const x = Math.cos(angle) * codeRadius;
    const y = Math.sin(angle) * codeRadius;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(stampCode[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

onMounted(() => {
  drawStamp()
})
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.canvas-container {
  width: 100%;
  height: 100%;
  background-color: aliceblue;
}
</style>

