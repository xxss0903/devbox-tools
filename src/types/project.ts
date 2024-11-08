export interface Project {
  id: string
  name: string
  path: string
  createTime: string
  updateTime: string
  isFavorite: boolean
  isArchived: boolean
  description?: string
} 