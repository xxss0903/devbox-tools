import type { SavedTemplate } from '@/types/resume'

// 添加默认模板数据
export const seniorFrontendTemplate: SavedTemplate = {
  id: 'senior-frontend-template',
  name: 'Senior Frontend Engineer Template',
  createTime: Date.now(),
  data: {
    fullName: 'Alex Chen',
    title: 'Senior Frontend Engineer',
    email: 'alex.chen@example.com',
    phone: '+86 138 8888 8888',
    summary: `资深前端工程师，拥有8年 Web 开发经验。专注于构建高性能、可扩展的企业级应用。精通现代前端技术栈，具有丰富的大型项目架构经验。擅长团队管理和技术mentoring，推动过多个重要项目的技术改造和架构升级。`,
    experience: [
      {
        company: 'TechGiant Inc.',
        position: '高级前端工程师 / 技术负责人',
        duration: '2020 - 至今',
        description: `• 负责公司核心产品的前端架构设计和技术选型，将系统从 jQuery 重构为现代化的 Vue.js 架构
  • 设计并实现了基于 Vite 的微前端解决方案，支持多团队并行开发
  • 建立了完整的前端工程化体系，包括自动化测试、CI/CD、性能监控等
  • 优化前端性能，使页面加载时间减少 50%，首屏渲染时间降低到 1.5s
  • 管理 10 人的前端团队，制定技术规范，推动代码质量提升`
      },
      {
        company: 'InnovateSoft',
        position: '前端开发工程师',
        duration: '2018 - 2020',
        description: `• 负责企业级 SaaS 平台的前端开发，使用 Vue.js + TypeScript 技术栈
  • 设计并实现了公司级别的组件库，提高了开发效率和产品一致性
  • 引入 WebSocket 实现实时数据更新，优化用户体验
  • 实现了复杂的数据可视化功能，使用 ECharts 展示大量实时数据`
      },
      {
        company: 'StartupTech',
        position: '前端开发工程师',
        duration: '2015 - 2018',
        description: `• 参与电商平台的前端开发，负责购物车和支付模块
  • 使用 React 开发移动端 H5 页面，实现流畅的用户体验
  • 优化网站 SEO，提升搜索引擎排名
  • 实现了响应式设计，支持多种设备访问`
      }
    ],
    education: [
      {
        school: '清华大学',
        degree: '计算机科学与技术 硕士',
        year: '2015'
      },
      {
        school: '北京大学',
        degree: '软件工程 学士',
        year: '2012'
      }
    ],
    skills: [
      'JavaScript/TypeScript',
      'Vue.js/React',
      'Node.js',
      'Webpack/Vite',
      'Microservices',
      'CI/CD',
      'Performance Optimization',
      'Team Leadership',
      'System Architecture',
      'Testing (Jest/Cypress)'
    ],
    customSections: []
  }
}
