import { BrowserWindow, ipcMain } from "electron"
import { HTTPRequest } from "puppeteer"
import puppeteer from "puppeteer"

// 汽车爬虫
export function setupSpiderHandle(win: BrowserWindow) {

// 汽车爬虫相关处理
ipcMain.handle('fetch-car-brands', async () => {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
      const page = await browser.newPage()
      
      // 设置请求拦截
      await page.setRequestInterception(true)
      page.on('request', (request: HTTPRequest) => {
        if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
          request.abort()
        } else {
          request.continue()
        }
      })
  
      // 访问汽车之家品牌页
      await page.goto('https://www.autohome.com.cn/car/', {
        waitUntil: 'networkidle0'
      })
  
      // 提取品牌数据
      const brands = await page.evaluate(() => {
        const brandElements = document.querySelectorAll('.cartree ul li')
        return Array.from(brandElements).map((brand) => {
          const link = brand.querySelector('a')
          const img = brand.querySelector('img')
          return {
            id: link?.getAttribute('href')?.match(/\/(\d+)\//)?.[1] || '',
            name: link?.textContent?.trim() || '',
            logo: img?.getAttribute('src') || ''
          }
        })
      })
  
      await browser.close()
      return { success: true, data: brands }
    } catch (error: any) {
      console.error('获取品牌数据失败:', error)
      return { success: false, message: error.message || '未知错误' }
    }
  })
  
  ipcMain.handle('fetch-car-models', async (_, { brandId }) => {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
      const page = await browser.newPage()
      
      // 设置请求拦截
      await page.setRequestInterception(true)
      page.on('request', (request: HTTPRequest) => {
        if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
          request.abort()
        } else {
          request.continue()
        }
      })
  
      // 访问品牌详情页
      await page.goto(`https://www.autohome.com.cn/grade/carhtml/${brandId}.html`, {
        waitUntil: 'networkidle0'
      })
  
      // 提取车型数据
      const models = await page.evaluate(() => {
        const modelElements = document.querySelectorAll('.list-dl')
        return Array.from(modelElements).map((model) => {
          const nameEl = model.querySelector('dt a')
          const priceEl = model.querySelector('.font-arial')
          const specsList = model.querySelectorAll('dd p')
          
          const specs: Record<string, string> = {}
          specsList.forEach((spec) => {
            const text = spec.textContent || ''
            if (text.includes('发动机')) specs.engine = text.replace('发动机：', '').trim()
            if (text.includes('变速箱')) specs.transmission = text.replace('变速箱：', '').trim()
            if (text.includes('燃料')) specs.fuelType = text.replace('燃料：', '').trim()
          })
  
          return {
            id: nameEl?.getAttribute('href')?.match(/\/(\d+)\//)?.[ 1] || '',
            name: nameEl?.textContent?.trim() || '',
            price: priceEl?.textContent?.trim() || '暂无报价',
            year: new Date().getFullYear().toString(),
            specs
          }
        })
      })
  
      await browser.close()
      return { success: true, data: models }
    } catch (error: any) {
      console.error('获取车型数据失败:', error)
      return { success: false, message: error.message || '未知错误' }
    }
  })

  // 获取车型款式
  ipcMain.handle('fetch-car-specs', async (_, { seriesId }) => {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
      const page = await browser.newPage()
      
      // 设置请求拦截
      await page.setRequestInterception(true)
      page.on('request', (request: HTTPRequest) => {
        if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
          request.abort()
        } else {
          request.continue()
        }
      })

      // 访问车型款式API
      const response = await page.goto(`https://car-web-api.autohome.com.cn/car/param/getParamConf?mode=1&site=1&seriesid=${seriesId}`, {
        waitUntil: 'networkidle0'
      })

      const data = await response?.json()
      if (!data || data.returncode !== 0) {
        throw new Error(data?.message || '获取数据失败')
      }

      // 提取年款信息
      const yearVersions = data.result.conditionlist.find((item: any) => item.typevalue === 'year')?.list || []
      
      // 提取参数配置信息
      const paramGroups = data.result.titlelist.map((group: any) => ({
        groupName: group.groupname,
        itemType: group.itemtype,
        items: group.items.map((item: any) => ({
          id: item.itemid,
          name: item.itemname,
          baikeUrl: item.baikeurl || '',
          baikeId: item.baikeid
        }))
      }))

      await browser.close()
      return { 
        success: true, 
        data: {
          yearVersions: yearVersions.map((year: any) => ({
            id: year.yearid,
            name: year.name,
            year: year.id
          })),
          paramGroups
        }
      }
    } catch (error: any) {
      console.error('获取车型款式数据失败:', error)
      return { success: false, message: error.message || '未知错误' }
    }
  })
}
