<template>
  <div class="music-player">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <div class="nav-controls">
        <el-button-group>
          <el-button circle><el-icon><ArrowLeft /></el-icon></el-button>
          <el-button circle><el-icon><ArrowRight /></el-icon></el-button>
        </el-button-group>
        <div class="search-box">
          <el-input
            placeholder="搜索音乐..."
            prefix-icon="Search"
          />
        </div>
      </div>
      <div class="user-profile">
        <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧边栏 -->
      <div class="sidebar">
        <div class="menu-section">
          <h3>菜单</h3>
          <ul class="menu-list">
            <li class="active">
              <el-icon><HomeFilled /></el-icon>
              <span>主页</span>
            </li>
            <li>
              <el-icon><List /></el-icon>
              <span>播放列表</span>
            </li>
            <li>
              <el-icon><Star /></el-icon>
              <span>收藏</span>
            </li>
          </ul>
        </div>

        <div class="library-section">
          <h3>音乐库</h3>
          <el-upload
            class="upload-btn"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            accept="audio/*"
            @change="handleFileChange"
          >
            <el-button type="primary" class="add-music-btn">
              <el-icon><Plus /></el-icon>
              <span>添加音乐</span>
            </el-button>
          </el-upload>
        </div>
      </div>

      <!-- 中间内容区域 -->
      <div class="content-area">
        <div class="featured-section">
          <h2>推荐歌单</h2>
          <div class="featured-grid">
            <div class="featured-card" v-for="i in 6" :key="i">
              <div class="card-image"></div>
              <div class="card-info">
                <h4>播放列表 {{ i }}</h4>
                <p>{{ playlist.length }} 首歌曲</p>
              </div>
            </div>
          </div>
        </div>

        <div class="recent-plays">
          <h2>最近播放</h2>
          <el-table :data="playlist" style="width: 100%">
            <el-table-column width="50">
              <template #default="scope">
                <div class="song-index">{{ scope.$index + 1 }}</div>
              </template>
            </el-table-column>
            <el-table-column>
              <template #default="scope">
                <div class="song-info-cell">
                  <img :src="scope.row.cover || defaultCover" class="song-cover">
                  <div class="song-details">
                    <div class="song-name">{{ scope.row.name }}</div>
                    <div class="song-artist">{{ scope.row.artist }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="duration" width="100">
              <template #default="scope">
                <span class="duration">{{ formatTime(scope.row.duration || 0) }}</span>
              </template>
            </el-table-column>
            <el-table-column width="100">
              <template #default="scope">
                <el-button 
                  circle
                  :type="currentSong.url === scope.row.url ? 'primary' : ''"
                  @click="playSong(scope.row)"
                >
                  <el-icon>
                    <component :is="currentSong.url === scope.row.url && isPlaying ? 'VideoPause' : 'VideoPlay'" />
                  </el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 底部播放控制栏 -->
    <div class="player-controls">
      <div class="now-playing">
        <img :src="currentSong.cover || defaultCover" class="current-cover">
        <div class="current-info">
          <div class="current-name">{{ currentSong.name || '未选择歌曲' }}</div>
          <div class="current-artist">{{ currentSong.artist || '-' }}</div>
        </div>
      </div>

      <div class="control-center">
        <div class="main-controls">
          <el-button circle @click="prev">
            <el-icon><CaretLeft /></el-icon>
          </el-button>
          <el-button circle class="play-btn" @click="togglePlay">
            <el-icon><component :is="isPlaying ? 'VideoPause' : 'VideoPlay'" /></el-icon>
          </el-button>
          <el-button circle @click="next">
            <el-icon><CaretRight /></el-icon>
          </el-button>
        </div>
        <div class="progress-control">
          <span class="time">{{ formatTime(currentTime) }}</span>
          <el-slider 
            v-model="currentTime" 
            :max="duration"
            @change="handleProgressChange"
          />
          <span class="time">{{ formatTime(duration) }}</span>
        </div>
      </div>

      <div class="volume-control">
        <el-icon><Microphone /></el-icon>
        <el-slider 
          v-model="volume" 
          :max="100"
          @change="handleVolumeChange"
        />
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

<style scoped>
.music-player {
  width: 100%;
  height: 100vh;
  background: #0f1012;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.top-nav {
  height: 64px;
  background: #18191c;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-box {
  width: 300px;
}

:deep(.el-input__wrapper) {
  background: #242529;
  box-shadow: none;
}

:deep(.el-input__inner) {
  color: #fff;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 240px;
  background: #18191c;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.menu-section h3,
.library-section h3 {
  color: #666;
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 16px;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.menu-list li:hover {
  background: rgba(255,255,255,0.1);
}

.menu-list li.active {
  background: #7b68ee;
}

.add-music-btn {
  width: 100%;
  background: #242529;
  border: none;
  color: #fff;
}

.content-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.featured-card {
  background: #18191c;
  border-radius: 12px;
  overflow: hidden;
}

.card-image {
  height: 200px;
  background: #242529;
}

.card-info {
  padding: 16px;
}

.card-info h4 {
  margin: 0 0 8px;
}

.card-info p {
  margin: 0;
  color: #666;
}

.player-controls {
  height: 90px;
  background: #18191c;
  border-top: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.now-playing {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 300px;
}

.current-cover {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
}

.control-center {
  flex: 1;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.main-controls {
  display: flex;
  gap: 16px;
}

.play-btn {
  background: #7b68ee;
  border: none;
}

.progress-control {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
}

.time {
  color: #666;
  font-size: 12px;
  width: 45px;
}

.volume-control {
  width: 200px;
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.el-table) {
  background: transparent;
}

:deep(.el-table tr) {
  background: transparent;
}

:deep(.el-table th),
:deep(.el-table td) {
  background: transparent;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.song-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.song-cover {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
}

.song-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.song-name {
  font-weight: 500;
}

.song-artist {
  color: #666;
  font-size: 12px;
}

.duration {
  color: #666;
}

:deep(.el-slider__runway) {
  background: #242529;
}

:deep(.el-slider__bar) {
  background: #7b68ee;
}

:deep(.el-slider__button) {
  border-color: #7b68ee;
}
</style>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { 
  CaretLeft, 
  CaretRight, 
  VideoPlay, 
  VideoPause, 
  Plus, 
  Microphone,
  HomeFilled,
  List,
  Star,
  Search,
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'

interface Song {
  name: string
  artist: string
  cover: string
  url: string
  duration?: number
}

const audioPlayer = ref<HTMLAudioElement>()
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(100)
const defaultCover = '/music-default-cover.jpg'

const currentSong = reactive<Song>({
  name: '',
  artist: '',
  cover: '',
  url: ''
})

const playlist = ref<Song[]>([])

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

const handleVolumeChange = (value: number) => {
  if (audioPlayer.value) {
    audioPlayer.value.volume = value / 100
  }
}

const prev = () => {
  const currentIndex = playlist.value.findIndex(song => song.url === currentSong.url)
  if (currentIndex > 0) {
    playSong(playlist.value[currentIndex - 1])
  }
}

const next = () => {
  const currentIndex = playlist.value.findIndex(song => song.url === currentSong.url)
  if (currentIndex < playlist.value.length - 1) {
    playSong(playlist.value[currentIndex + 1])
  }
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
    const newSong: Song = {
      name: file.raw.name.replace(/\.[^/.]+$/, ""),
      artist: 'Unknown',
      cover: defaultCover,
      url: e.target?.result as string
    }
    playlist.value.push(newSong)
  }
  reader.readAsDataURL(file.raw)
}

// 播放指定歌曲
const playSong = (song: Song) => {
  if (audioPlayer.value) {
    Object.assign(currentSong, song)
    audioPlayer.value.src = song.url
    audioPlayer.value.play()
    isPlaying.value = true
  }
}
</script> 