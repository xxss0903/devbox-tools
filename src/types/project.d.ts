export interface Project {
  id: string
  name: string
  path: string
  description?: string
  createTime: string
  updateTime: string
  isFavorite: boolean
  isArchived: boolean
  dataValues?: any
}

export interface IProjectAPI {
  createProject: (projectData: Project) => Promise<Project>
  getProjects: () => Promise<Array<{ dataValues: Project }>>
  getProject: (id: string) => Promise<{ dataValues: Project }>
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project>
  deleteProject: (id: string) => Promise<void>
}

declare global {
  interface Window {
    projectAPI: IProjectAPI
  }
}
