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

export interface ParamItem {
  id: string | number
  name: string
  baikeUrl: string
  baikeId: number
  value?: string
  sublist?: Array<{
    name: string
    value: string
    priceinfo?: string
  }>
}

export interface ParamGroup {
  groupName: string
  itemType: string
  items: ParamItem[]
}

export interface YearVersion {
  id: string | number
  name: string
  year: string
}

export interface BasicInfo {
  price: string
  manufacturer: string
  level: string
  engine: string
  gearbox: string
  size: string
  structure: string
  maxPower: string
  maxTorque: string
  fuelConsumption: string
  warranty: string
}

export interface CarSpecs {
  yearVersions: YearVersion[]
  paramGroups: ParamGroup[]
  basicInfo: BasicInfo
} 