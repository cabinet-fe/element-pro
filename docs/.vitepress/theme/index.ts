import ElementUltra, { useConfig, type ProTableRequestMethod } from 'element-ultra'
import Layout from './components/vp-app.vue'
import NotFound from './components/vp-not-found.vue'

import { Theme } from 'vitepress'

import 'uno.css'

const request: ProTableRequestMethod = ({ api, query }) => {
  //  在控制台查看参数
  console.log('api: ', api)
  console.log('query', query)
  return new Promise((rs, rj) => {
    setTimeout(() => {
      const data = Array.from({ length: 20 }).map((_, i) => ({
        name: '张' + i,
        age: 10 + i
      }))
      let random = Math.random()
      if (random > 0.4) {
        rs({
          data,
          total: data.length // 在分页时total必须返回
        })
      }
      rj({
        data: [],
        total: 0
      })
    }, 600)
  })
}

const [, setConfigStore] = useConfig()
setConfigStore({
  proTableDefaultSize: 60,
  proTableRequestMethod: request
})

const theme: Theme = {
  NotFound,
  Layout,
  enhanceApp: ({ app }) => {
    // @ts-ignore
    app.use(ElementUltra)
  }
}

export default theme

