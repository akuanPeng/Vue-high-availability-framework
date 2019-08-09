// 框架
import Vue from 'vue'
// 编程
import * as R from 'ramda'
// 组件库
import IView from 'iview'
// 请求库
import Axios from 'axios'
// 图表库
import ECharts from 'echarts'
import 'echarts/map/js/china.js'
// 数据
import store from './store'
// 主页面
import App from './views/app'
// 动画库
import { TweenMax } from 'gsap/TweenMax'

// 组件样式
import 'iview/dist/styles/iview.css'
import 'animate.css'

// 注册基础项
import Components from './components'
import Filters from './filters'
import Directives from './directives'

// 安装
Vue.use(IView)

// 引入
Vue.prototype.$echarts = ECharts
Vue.$http = Axios
window.R = R
window.TweenMax = TweenMax

// 日志与警告开关
Vue.config.silent = false
// 是否允许检查代码
Vue.config.devtools = true
// 指定组件的渲染和观察期间未捕获错误的处理函数
Vue.config.errorHandler = err => console.log('错误捕捉：', err)
// 组件忽略策略，支持正则
Vue.config.ignoredElements = []
// 自定义键位别名
Vue.config.keyCodes = {}
// 设置为 false 以阻止 vue 在启动时生成生产提示
Vue.config.productionTip = false

// 注册方法
const register = key => (value, name) => Vue[key](name, value)

// 注册指令
R.forEachObjIndexed(register('directive'))(Directives)
// 注册过滤器
R.forEachObjIndexed(register('filter'))(Filters)
// 注册组件
R.forEachObjIndexed(register('component'))(Components)

// 创建VM实列并挂载到DOM上
window.vm = new Vue({ ...App, store }).$mount('#app')
