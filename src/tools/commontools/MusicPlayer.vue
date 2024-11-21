<template>
  <div class="music-player">
    <div class="player-header">
      <h3>音乐播放器</h3>
    </div>
    
    <div class="player-main">
      <div class="music-info">
        <div class="cover">
          <img :src="currentSong.cover || defaultCover" alt="封面">
        </div>
        <div class="song-info">
          <div class="song-name">{{ currentSong.name || '未选择歌曲' }}</div>
          <div class="artist">{{ currentSong.artist || '-' }}</div>
        </div>
      </div>

      <div class="progress-bar">
        <el-slider 
          v-model="currentTime" 
          :max="duration"
          @change="handleProgressChange"
        />
        <div class="time-info">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>

      <div class="controls">
        <el-button circle @click="prev">
          <el-icon><CaretLeft /></el-icon>
        </el-button>
        <el-button circle @click="togglePlay">
          <el-icon>
            <component :is="isPlaying ? 'Pause' : 'VideoPlay'" />
          </el-icon>
        </el-button>
        <el-button circle @click="next">
          <el-icon><CaretRight /></el-icon>
        </el-button>
      </div>

      <div class="playlist">
        <el-upload
          action=""
          :auto-upload="false"
          :show-file-list="false"
          accept="audio/*"
          @change="handleFileChange"
        >
          <el-button type="primary">添加音乐</el-button>
        </el-upload>
        
        <el-table :data="playlist" style="width: 100%">
          <el-table-column prop="name" label="歌曲名" />
          <el-table-column prop="artist" label="歌手" />
          <el-table-column width="120">
            <template #default="{ row }">
              <el-button @click="playSong(row)">播放</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <audio
      ref="audioPlayer"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { CaretLeft, CaretRight, VideoPlay, Pause } from '@element-plus/icons-vue'

const audioPlayer = ref<HTMLAudioElement>()
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const defaultCover = 'path/to/default/cover.jpg'

const currentSong = reactive({
  name: '',
  artist: '',
  cover: '',
  url: ''
})

const playlist = ref([])

// 播放控制
const togglePlay = () => {
  if (!audioPlayer.value?.src) return
  if (isPlaying.value) {
    audioPlayer.value.pause()
  } else {
    audioPlayer.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const prev = () => {
  // 实现上一首逻辑
}

const next = () => {
  // 实现下一首逻辑
}

// 时间格式化
const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// 进度条控制
const handleProgressChange = (value: number) => {
  if (audioPlayer.value) {
    audioPlayer.value.currentTime = value
  }
}

// 音频事件处理
const onTimeUpdate = () => {
  if (audioPlayer.value) {
    currentTime.value = audioPlayer.value.currentTime
  }
}

const onLoadedMetadata = () => {
  if (audioPlayer.value) {
    duration.value = audioPlayer.value.duration
  }
}

const onEnded = () => {
  isPlaying.value = false
  next()
}

// 文件上传处理
const handleFileChange = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const newSong = {
      name: file.raw.name.replace(/\.[^/.]+$/, ""),
      artist: 'Unknown',
      url: e.target?.result as string
    }
    playlist.value.push(newSong)
  }
  reader.readAsDataURL(file.raw)
}

// 播放指定歌曲
const playSong = (song: any) => {
  if (audioPlayer.value) {
    Object.assign(currentSong, song)
    audioPlayer.value.src = song.url
    audioPlayer.value.play()
    isPlaying.value = true
  }
}
</script>

<style scoped>
.music-player {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.player-header {
  margin-bottom: 20px;
}

.music-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.cover {
  width: 100px;
  height: 100px;
  margin-right: 20px;
  overflow: hidden;
  border-radius: 8px;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-info {
  flex: 1;
}

.song-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.artist {
  color: #666;
}

.progress-bar {
  margin: 20px 0;
}

.time-info {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 12px;
  margin-top: 5px;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.playlist {
  margin-top: 20px;
}
</style> 