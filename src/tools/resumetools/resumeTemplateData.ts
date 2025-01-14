import type { SavedTemplate } from '@/types/resume'

// 添加默认模板数据
export const seniorFrontendTemplate: SavedTemplate = {
  id: 'senior-frontend-template',
  name: 'Senior Frontend Engineer Template',
  createTime: Date.now(),
  data: {
    fullName: 'Michael Anderson',
    title: 'Senior Frontend Engineer / Tech Lead',
    email: 'michael.anderson@example.com',
    phone: '+1 (415) 555-0123',
    summary: `Seasoned Frontend Engineer with 8+ years of experience in building high-performance, scalable enterprise applications. Proven track record in modern frontend architecture, technical leadership, and driving large-scale transformations. Strong expertise in performance optimization, micro-frontends, and building robust engineering cultures. Passionate about mentoring teams and delivering exceptional user experiences.`,
    experience: [
      {
        company: 'TechGiant Inc.',
        position: 'Senior Frontend Engineer / Tech Lead',
        duration: '2020 - Present',
        description: `• Led the architectural redesign of core products, successfully migrating from legacy jQuery to a modern Vue.js stack
• Architected and implemented a Vite-based micro-frontend solution enabling parallel development across multiple teams
• Established comprehensive frontend infrastructure including automated testing, CI/CD pipelines, and performance monitoring
• Achieved 50% reduction in page load times and improved First Contentful Paint to under 1.5s
• Led and mentored a team of 10 engineers, establishing coding standards and best practices
• Introduced modern development practices including TypeScript, automated testing, and performance budgets`
      },
      {
        company: 'InnovateSoft',
        position: 'Frontend Engineer',
        duration: '2018 - 2020',
        description: `• Spearheaded development of enterprise SaaS platform using Vue.js and TypeScript
• Designed and built a company-wide component library improving development velocity by 40%
• Implemented real-time data synchronization using WebSocket, enhancing user experience
• Created complex data visualizations handling millions of data points using D3.js and ECharts
• Mentored junior developers and conducted regular knowledge sharing sessions`
      },
      {
        company: 'StartupTech',
        position: 'Frontend Engineer',
        duration: '2015 - 2018',
        description: `• Developed key features for high-traffic e-commerce platform serving 1M+ monthly users
• Built responsive mobile-first interfaces using React and Redux
• Improved site performance resulting in 30% increase in conversion rates
• Implemented A/B testing framework leading to 25% increase in user engagement
• Collaborated with UX team to create accessible, performant user interfaces`
      }
    ],
    education: [
      {
        school: 'Stanford University',
        degree: 'Master of Science in Computer Science',
        year: '2015'
      },
      {
        school: 'University of California, Berkeley',
        degree: 'Bachelor of Science in Computer Science',
        year: '2012'
      }
    ],
    skills: [
      'JavaScript/TypeScript',
      'Vue.js/React',
      'Node.js',
      'Webpack/Vite',
      'Micro-frontends',
      'CI/CD',
      'Performance Optimization',
      'Technical Leadership',
      'System Architecture',
      'Testing (Jest/Cypress)'
    ],
    customSections: [
      {
        id: '1',
        title: 'Technical Leadership',
        content: `• Led frontend architecture for $50M revenue product
• Mentored 15+ engineers from junior to senior levels
• Reduced technical debt by 40% through strategic refactoring
• Established frontend guild and technical review processes
• Regular speaker at company tech talks and industry conferences`
      },
      {
        id: '2',
        title: 'Achievements & Certifications',
        content: `• Google Cloud Certified Professional Cloud Architect
• AWS Certified Solutions Architect
• Published author on Medium's JavaScript in Plain English
• Speaker at VueConf 2022 and ReactConf 2021
• Contributor to several open-source projects including Vue.js`
      }
    ]
  }
}

// 添加纯英文前端开发者模板
export const frontendDevTemplate: SavedTemplate = {
  id: 'frontend-dev-template',
  name: 'Frontend Developer Template',
  createTime: Date.now(),
  data: {
    fullName: 'John Smith',
    title: 'Frontend Developer',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    summary: `Passionate Frontend Developer with 5 years of experience in building responsive and user-friendly web applications. Proficient in modern JavaScript frameworks and libraries, with a strong focus on React and Vue.js. Committed to writing clean, maintainable code and implementing best practices for optimal performance and user experience.`,
    experience: [
      {
        company: 'WebTech Solutions',
        position: 'Frontend Developer',
        duration: '2021 - Present',
        description: `• Developed and maintained multiple client-facing web applications using React and TypeScript
• Implemented responsive designs and ensured cross-browser compatibility
• Reduced application load time by 40% through code optimization and lazy loading
• Collaborated with UX designers to implement modern user interface components
• Mentored junior developers and conducted code reviews`
      },
      {
        company: 'Digital Innovations Inc.',
        position: 'Junior Frontend Developer',
        duration: '2019 - 2021',
        description: `• Built interactive user interfaces using Vue.js and Vuex for state management
• Integrated RESTful APIs and implemented real-time features using WebSocket
• Participated in daily scrum meetings and sprint planning
• Developed reusable components for the company's component library
• Implemented unit tests using Jest and Vue Test Utils`
      },
      {
        company: 'Tech Startup Hub',
        position: 'Frontend Developer Intern',
        duration: '2018 - 2019',
        description: `• Assisted in developing and maintaining company website using HTML5, CSS3, and JavaScript
• Created responsive email templates and landing pages
• Optimized website performance and SEO
• Learned modern frontend development practices and tools`
      }
    ],
    education: [
      {
        school: 'University of Technology',
        degree: 'Bachelor of Science in Computer Science',
        year: '2018'
      },
      {
        school: 'Frontend Development Academy',
        degree: 'Advanced Web Development Certification',
        year: '2019'
      }
    ],
    skills: [
      'JavaScript/TypeScript',
      'React.js',
      'Vue.js',
      'HTML5/CSS3',
      'Webpack',
      'Git',
      'REST APIs',
      'Jest',
      'Responsive Design',
      'UI/UX Principles'
    ],
    customSections: [
      {
        id: '1',
        title: 'Projects',
        content: `• E-commerce Platform: Built a full-featured online store using React, Redux, and Node.js
• Portfolio Website Generator: Created a tool for developers to build portfolio websites using Vue.js
• Weather Dashboard: Developed a real-time weather application using OpenWeather API
• Task Management System: Built a Kanban-style project management tool using React and Firebase`
      },
      {
        id: '2',
        title: 'Certifications',
        content: `• AWS Certified Cloud Practitioner
• Meta Frontend Developer Professional Certificate
• Google UX Design Professional Certificate`
      }
    ]
  }
}
