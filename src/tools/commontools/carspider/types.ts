export interface CarBrand {
  id: string
  name: string
  logo?: string
}

export interface TreeNode {
  firstletter: string
  branditems: {
    id: string
    name: string
    logo?: string
    seriescount: number
    fctitems: {
      id: string
      name: string
      seriesitems: {
        id: string
        name: string
        state: number
        isnewenergy: number
        speccount: number
      }[]
    }[]
  }[]
}
    
export interface BrandTreeData {
  [key: string]: {
    firstletter: string
    branditems: {
      id: number
      name: string
      logo: string
      seriescount: number
      fctitems: {
        id: number
        name: string
        seriesitems: {
          id: number
          name: string
          state: number
          isnewenergy: number
          speccount: number
        }[]
      }[]
    }[]
  }
} 