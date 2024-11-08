export interface ProjectAttributes {
  id?: number
  name: string
  description?: string
  startDate: Date
  endDate?: Date
  status: 'active' | 'completed' | 'archived'
  createdAt?: Date
  updatedAt?: Date
} 