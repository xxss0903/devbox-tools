export interface CustomModule {
  title: string
  value: string
  url: string
}

export interface TitleModule {
  title: string
  value: string
  children: CustomModule[]
}
