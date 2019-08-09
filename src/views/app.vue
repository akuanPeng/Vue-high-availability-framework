<template>
    <div ref="app" :class="['layout', { 0: 'default', 1: 'dark' }[skin]]" @click.stop="docClick">
        <Layout :style="{background: skin === 1 ? '#252b34' : '#fafafa' }">
            <Sider ref="menus" class="animated fadeInLeftBig" style="animation-fill-mode: none;" hide-trigger collapsible :collapsed-width="54" v-model="isCollapsed">
                <div :class="`ak-logo ${isCollapsed ? 'active' : ''}`">
                    呼{{isCollapsed ? '' : '叫中心管理'}}
                </div>
                <!-- 菜单 -->
                <akMenus :menuitem-data="modules[moduleSelected] ? modules[moduleSelected].ChildMenus : []"></akMenus>
            </Sider>
            <Layout style="box-shadow: 0 0 16px #bababa inset">
                <Header class="layout-header-bar">
                    <Icon @click.native="collapsedSider" :class="rotateIcon" type="navicon-round" size="24"></Icon>
                    <!-- 模块 -->
                    <akModules class="animated fadeIn" :modules-data="modules"></akModules>
                    <!-- 用户 -->
                    <akUser class="animated fadeInRightBig" :user-data="user"></akUser>
                </Header>
                <Content>
                    <!-- 收藏 -->
                    <akCollecting :is-full="isFull" v-if="moduleSelected === 4"></akCollecting>
                    <!-- 分屏 -->
                    <transition name="fade">
                        <akScreens :screens-data="screens" v-if="isScreenShow"></akScreens>
                        <div class="loadPage" v-else>
                            <Spin size="large" fix></Spin>
                        </div>
                    </transition>
                </Content>
            </Layout>
        </Layout>
        <akHelp v-if="help"></akHelp>
    </div>
</template>

<script>
// api对象
import api from '../api'
// 依赖组件
import akMenus from './app/menus'
import akModules from './app/modules'
import akUser from './app/user'
import akCollecting from './app/collecting'
import akScreens from './app/screens'
import akHelp from './app/help'
export default {
    data () {
        // 配置的分屏个数
        const len = localStorage.screen || this.$store.state.screen
        // 根据个数生成分屏
        const screens = R.times(() => [], len)
        // 配置的菜单状态
        this.$store.state.menuValue = parseInt(localStorage.menuValue || 0)
        this.$store.state.skin = parseInt(localStorage.skin || 0)
        this.$store.state.layout = parseInt(localStorage.layout || 0)
        return {
            // 组件异步加载
            isScreenShow: false,
            // 帮助页开关
            help: false,
            skin: parseInt(localStorage.skin || 0),
            ...{
                // 菜单延迟中间值
                timerC: false,
                // 菜单自动闭合开关
                isCollapsed: {
                    0: document.documentElement.clientWidth <= 1366,
                    1: false,
                    2: true
                }[localStorage.menuValue || 0]
            },
            // 文档单击切换页签
            open: -1,
            ...{
                // 动态算高
                timerH: false,
                fullHeight: document.documentElement.clientHeight,
                // 动态算宽
                timerW: false,
                fullWidth: document.documentElement.clientWidth
            },
            // 当前选择的模块
            moduleSelected: 0,
            menuitemOpen: [],
            menuitemSelected: [],
            modules: [],
            user: {},
            screenSelected: 0,
            screenTabSelected: [],
            screens,
            screenRefs: [],
            ws: null,
            timestamp: 0,
            wsMsg: '',
            count: 0,
            clgz: {
                0: 0,
                1: 5,
                2: 15,
                3: 30,
                4: 30
            },
            full: false,
            monitoringPlatform: '[]'
        }
    },
    provide () {
        return {
            'parent': this,
            api
        }
    },
    computed: {
        isFull () {
            let slts = this.screenTabSelected[this.moduleSelected || 0] || []
            for (let i = 0, ilen = slts.length; i < ilen; i++) {
                if (slts[i] && slts[i] !== -1) {
                    return true
                }
            }
            return false
        },
        rotateIcon () {
            return [
                'menu-icon',
                this.isCollapsed ? 'rotate-icon' : ''
            ]
        }
    },
    // 依赖
    components: {
        akMenus,
        akModules,
        akUser,
        akCollecting,
        akScreens,
        akHelp
    },
    methods: {
        webcheck (cb) {
            if (this.ws.readyState === 1) {
                cb(this.ws)
            } else {
                this.$Notice.error(this.eF('WebSocket服务异常', {
                    0: '正在建立连接, 无法发送请求',
                    2: '正在关闭连接, 无法发送请求',
                    3: '已经关闭连接, 无法发送请求'
                }[this.ws.readyState]))
            }
        },
        collapsedSider () {
            this.$refs.menus.toggleCollapse()
        },
        // 获取选项位置
        getLocation (selected) {
            for (let i = 0, ilen = this.screens.length; i < ilen; i++) {
                for (let j = 0, z = -1, jlen = this.screens[i].length; j < jlen; j++) {
                    if (this.screens[i][j][0] === this.moduleSelected) z++
                    if (this.screens[i][j].join() === selected) return [i, j, z]
                }
            }
            return [0, -1, -1]
        },
        // 获取路径
        getPath (s) {
            const module = this.modules[s[0]]
            return module ? [module.Title, module.ChildMenus[s[1]].Title, module.ChildMenus[s[1]].ChildMenus[s[2]].Title] : []
        },
        // 文档点击
        docClick () {
            this.open = -1
        },
        // 错误信息格式
        eF (title, desc, type) {
            return { title: `${title} - ${type ? '返回错误' : '请求出错'}`, desc, duration: 3, closable: true }
        },
        // 计算权限
        auths (modules) {
            const auths = {}
            for (let i = 0, ilen = modules.length; i < ilen; i++) {
                if (modules[i].ChildMenus) {
                    for (let j = 0, jlen = modules[i].ChildMenus.length; j < jlen; j++) {
                        if (modules[i].ChildMenus[j].ChildMenus) {
                            for (let z = 0, zlen = modules[i].ChildMenus[j].ChildMenus.length; z < zlen; z++) {
                                const auth = modules[i].ChildMenus[j].ChildMenus[z]
                                if (auth.ChildMenus && auth.ChildMenus.length) {
                                    auths[auth.Name] = {}
                                    for (let n = 0, nlen = auth.ChildMenus.length; n < nlen; n++) {
                                        auths[auth.Name][auth.ChildMenus[n].Name] = true
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return auths
        },
        // 长连接
        connect (cb) {
            if (window.WebSocket) {
                if (!this.ws) {
                    // const url = 'localhost:9003'
                    const url = location.port ? (location.hostname + ':9003') : (location.hostname + '/proxy')
                    this.ws = new WebSocket(`ws://${url}/webSocketServer`)
                    this.ws.onopen = () => {
                        this.count = 0
                        console.log('连接成功')
                        if (cb) cb(this.ws)
                    }
                    this.ws.onerror = () => {
                        console.log(this.count ? `${this.clgz[this.count]}秒后重连` : '立即重连!')
                        this.count++
                        setTimeout(() => {
                            this.ws = undefined
                            if (this.count < 5) {
                                this.connect(ws => {
                                    this.ws = ws
                                    this.timestamp = Date.now()
                                })
                            } else {
                                console.log('连接错误: ' + url)
                            }
                        }, this.clgz[this.count] * 10000)
                    }
                    this.ws.onclose = () => {
                        console.log(this.count ? `${this.clgz[this.count]}秒后重连` : '立即重连!')
                        this.count++
                        setTimeout(() => {
                            this.ws = undefined
                            if (this.count < 5) {
                                this.connect(ws => {
                                    this.ws = ws
                                    this.timestamp = Date.now()
                                })
                            } else {
                                console.log('连接关闭: ' + url)
                            }
                        }, this.clgz[this.count] * 10000)
                    }
                } else {
                    if (cb) cb(this.ws)
                }
                return this.ws
            }
        }
    },
    created () {
        if (api.isEnabled) {
            // 请求用户信息
            api.getUser().then(d => {
                if (d.data.IsSuccess) {
                    this.user = d.data.Data
                    window.user = d.data.Data
                } else {
                    window.location.href = '/Manage/Home/LogOut'
                }
            }).catch(e => {
                this.$Notice.error(this.eF('用户信息', e.message))
                window.location.href = '/Manage/Home/LogOut'
            })
            // 请求菜单权限
            api.getMenus().then(d => {
                // d = {"IsSuccess":true,"Info":"获取用户权限成功","Data":[{"MenuId":118461,"Name":"home","Title":"系统首页","Address":"home","OrderNo":0,"Type":1,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":107503,"Name":"agentManagement","Title":"坐席管理","Address":"person-stalker","OrderNo":100000,"Type":1,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":107504,"Name":"agentManagement","Title":"坐席管理","Address":"person-stalker","OrderNo":101000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":107505,"Name":"applyOrRecallAgency","Title":"坐席申请及回收","Address":"","OrderNo":101010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":107567,"Name":"applicationOrRecyclingReview","Title":"申请审批","Address":"","OrderNo":101020,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":113538,"Name":"seatAdjustment","Title":"坐席技能调整","Address":"","OrderNo":101030,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":113779,"Name":"agentLogout","Title":"坐席强退","Address":"","OrderNo":101040,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":114451,"Name":"agentRelationship","Title":"合肥坐席关系","Address":"","OrderNo":101050,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":107568,"Name":"internalConfiguration","Title":"内部配置","Address":"android-settings","OrderNo":102000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":107569,"Name":"projectConfiguration","Title":"项目配置","Address":"","OrderNo":102010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":112607,"Name":"show","Title":"显示","Address":"","OrderNo":1,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":112608,"Name":"update","Title":"更新","Address":"","OrderNo":2,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":112609,"Name":"add","Title":"添加","Address":"","OrderNo":4,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":112610,"Name":"delete","Title":"删除","Address":"","OrderNo":8,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":107570,"Name":"channelManagement","Title":"渠道管理","Address":"","OrderNo":102020,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":112611,"Name":"show","Title":"显示","Address":"","OrderNo":1,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":112612,"Name":"update","Title":"更新","Address":"","OrderNo":2,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":112613,"Name":"add","Title":"添加","Address":"","OrderNo":4,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":112614,"Name":"delete","Title":"删除","Address":"","OrderNo":8,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":107571,"Name":"skillGroupManagement","Title":"技能组管理","Address":"","OrderNo":102030,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":112615,"Name":"show","Title":"显示","Address":"","OrderNo":1,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":112617,"Name":"update","Title":"更新","Address":"","OrderNo":2,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":112616,"Name":"add","Title":"添加","Address":"","OrderNo":4,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":112618,"Name":"delete","Title":"删除","Address":"","OrderNo":8,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]}]}]},{"MenuId":107572,"Name":"projectDepartment","Title":"项目部门","Address":"android-options","OrderNo":103000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":107573,"Name":"organization","Title":"组织架构","Address":"","OrderNo":203010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":107574,"Name":"authorityManagement","Title":"权限管理","Address":"","OrderNo":203020,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":107575,"Name":"numberManagement","Title":"号码管理","Address":"android-call","OrderNo":104000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":107576,"Name":"numberManagement","Title":"号码管理","Address":"","OrderNo":104010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":107577,"Name":"numberQuery","Title":"号码查询","Address":"","OrderNo":104020,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":108317,"Name":"extManagement","Title":"分机管理","Address":"headphone","OrderNo":105000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":108318,"Name":"extManagement","Title":"分机管理","Address":"","OrderNo":105010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":113149,"Name":"opts","Title":"除搜索/导出/座位号外的操作","Address":"","OrderNo":0,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":113150,"Name":"show","Title":"显示密码和Mac","Address":"","OrderNo":0,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":113148,"Name":"list","Title":"列表","Address":"","OrderNo":1,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":113151,"Name":"edit","Title":"修改座位号","Address":"","OrderNo":4,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":113116,"Name":"extensionNumberApplicationAndRecycling","Title":"分机号申请及回收","Address":"","OrderNo":105020,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":113117,"Name":"extensionNumberApplicationForApproval","Title":"申请审批","Address":"","OrderNo":105030,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":113118,"Name":"extensionNumberApplicationProcessing","Title":"申请处理","Address":"","OrderNo":105040,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":113535,"Name":"statisticalReport","Title":"统计报表","Address":"","OrderNo":105050,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":117421,"Name":"usingTheDetails","Title":"使用详情","Address":"","OrderNo":105060,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":110820,"Name":"supportManagement","Title":"支援管理","Address":"help-buoy","OrderNo":106000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":110821,"Name":"supportBackgroundManagement","Title":"支援管理后台","Address":"","OrderNo":106010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":110822,"Name":"accountCollectionAndCollection","Title":"账号领取及回收","Address":"","OrderNo":106020,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":110823,"Name":"allocationRecordQuery","Title":"分配记录查询","Address":"","OrderNo":106030,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":115165,"Name":"forecastOutgoingCall","Title":"预测式外呼","Address":"volume-medium","OrderNo":107000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":115167,"Name":"forecastOutgoingCallSettings","Title":"配置页面","Address":"","OrderNo":107010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":115171,"Name":"list","Title":"列表","Address":"","OrderNo":1,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":115172,"Name":"add","Title":"添加","Address":"","OrderNo":2,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":115173,"Name":"upd","Title":"编辑","Address":"","OrderNo":4,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":115174,"Name":"del","Title":"删除","Address":"","OrderNo":8,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":115168,"Name":"forecastOutgoingCallReport","Title":"明细报表","Address":"","OrderNo":107020,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":117403,"Name":"forecastOutgoingCallPage","Title":"使用报表","Address":"","OrderNo":107030,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":115166,"Name":"automaticVoiceCall","Title":"自动语音外呼","Address":"volume-medium","OrderNo":108000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":115169,"Name":"automaticVoiceCallSettings","Title":"配置页面","Address":"","OrderNo":108010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":115175,"Name":"list","Title":"列表","Address":"","OrderNo":1,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":115176,"Name":"add","Title":"添加","Address":"","OrderNo":2,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":115177,"Name":"upd","Title":"编辑","Address":"","OrderNo":4,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":115178,"Name":"del","Title":"删除","Address":"","OrderNo":8,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":115170,"Name":"automaticVoiceCallReport","Title":"报表统计","Address":"","OrderNo":108020,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":119122,"Name":"blackNumberManage","Title":"黑名单管理","Address":"flash-off","OrderNo":109000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":119123,"Name":"blackNumber","Title":"黑名单管理","Address":"","OrderNo":109010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]}]},{"MenuId":107578,"Name":"reportingSystem","Title":"报表系统","Address":"pie-graph","OrderNo":200000,"Type":1,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":107582,"Name":"servicePerformanceRelated","Title":"服务效能相关","Address":"connection-bars","OrderNo":201000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":107586,"Name":"inBoundConnectionRate","Title":"呼入接通率","Address":"","OrderNo":201010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":107588,"Name":"inOutBoundConnectionRate","Title":"呼出接通率","Address":"","OrderNo":201020,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":107590,"Name":"agentJobDetailsStatistics","Title":"坐席工作详情统计","Address":"","OrderNo":201040,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":107592,"Name":"callDurationStatistics","Title":"通话等待时长统计","Address":"","OrderNo":201050,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":107593,"Name":"agentLoginAndOut","Title":"坐席登入登出统计","Address":"","OrderNo":201060,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":107583,"Name":"serviceQualityIndex","Title":"服务质量指标","Address":"stats-bars","OrderNo":202000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":107594,"Name":"telephoneSatisfactionStatistics","Title":"电话满意度统计","Address":"","OrderNo":202010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":107595,"Name":"questionnaireSatisfactionStatistics","Title":"问卷满意度统计","Address":"","OrderNo":202020,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":107597,"Name":"oneTimeResolutionStatistics","Title":"一次性解决率统计","Address":"","OrderNo":202030,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":107599,"Name":"repeatRateStatistics","Title":"重复率统计","Address":"","OrderNo":202040,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":107600,"Name":"transferRateStatistics","Title":"转接率统计","Address":"","OrderNo":202050,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":107584,"Name":"internalConfiguration","Title":"内部配置","Address":"android-settings","OrderNo":203000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":107602,"Name":"smsShortUrlVDNRelation","Title":"短连接维护","Address":"","OrderNo":203010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":107603,"Name":"weChatMessageUserByProductID","Title":"预警人员维护","Address":"","OrderNo":203020,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":107605,"Name":"earlyWarningMaintenance","Title":"来电量预警维护","Address":"","OrderNo":203030,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":107607,"Name":"distributionNumberMaintenance","Title":"分销号码维护","Address":"","OrderNo":203040,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":107585,"Name":"dailyProcessing","Title":"日常处理","Address":"calendar","OrderNo":204000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":107608,"Name":"repeatedCalls","Title":"重复来电处理","Address":"","OrderNo":204010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":107609,"Name":"callLossCalls","Title":"呼损来电处理","Address":"","OrderNo":204020,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":107610,"Name":"unsatisfactoryCall","Title":"不满意来电处理","Address":"","OrderNo":204030,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":116040,"Name":"intelligentNavigationStatistics","Title":"智能导航统计","Address":"social-android","OrderNo":205000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":116041,"Name":"smartNavigationReport","Title":"来电量统计","Address":"","OrderNo":205010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":116516,"Name":"accessStatistics","Title":"访问信息统计","Address":"ios-pulse-strong","OrderNo":206000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":116517,"Name":"accessStatisticsReport","Title":"统计报表","Address":"","OrderNo":206010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":116518,"Name":"accessStatisticsDetails","Title":"访问明细","Address":"","OrderNo":206020,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]}]},{"MenuId":107579,"Name":"chargingSys","Title":"计费系统","Address":"cash","OrderNo":300000,"Type":1,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":107611,"Name":"chargingReport","Title":"费用报表","Address":"pie-graph","OrderNo":301000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":107613,"Name":"departmentCostReport","Title":"部门费用统计","Address":"","OrderNo":301010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":107612,"Name":"configurationCenter","Title":"系统配置","Address":"android-settings","OrderNo":302000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":107614,"Name":"billingRule","Title":"计费规则配置","Address":"","OrderNo":302010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":107615,"Name":"numberRule","Title":"号码规则配置","Address":"","OrderNo":302020,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]}]},{"MenuId":107580,"Name":"monitoringPlatform","Title":"监控平台","Address":"monitor","OrderNo":400000,"Type":1,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":107616,"Name":"monitoringCenter","Title":"监控中心","Address":"monitor","OrderNo":401000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":115205,"Name":"marketMonitoring","Title":"大盘监控","Address":"","OrderNo":401010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":115206,"Name":"agentMonitoring","Title":"坐席监控","Address":"","OrderNo":401020,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":107618,"Name":"personnelToMonitor","Title":"位置监控","Address":"","OrderNo":401030,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":115614,"Name":"list","Title":"列表","Address":"","OrderNo":1,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":115615,"Name":"dot","Title":"打点","Address":"","OrderNo":2,"Type":4,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":115207,"Name":"callMonitoring","Title":"来电监控","Address":"","OrderNo":401040,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":119119,"Name":"desktopMonitor","Title":"桌面监控","Address":"","OrderNo":401050,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":114476,"Name":"configurationCenter","Title":"系统管理","Address":"android-settings","OrderNo":402000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":115208,"Name":"earlyWarningConfiguration","Title":"预警配置","Address":"","OrderNo":402010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":114477,"Name":"dataQuery","Title":"数据查询","Address":"","OrderNo":402020,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]}]},{"MenuId":107581,"Name":"theRecordingSystem","Title":"录音系统","Address":"mic-c","OrderNo":500000,"Type":1,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":107619,"Name":"theRecordingManagement","Title":"录音管理","Address":"mic-a","OrderNo":501000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":117067,"Name":"recordingTheQueryOld","Title":"录音查询","Address":"","OrderNo":501009,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":107620,"Name":"recordingTheQuery","Title":"苏州录音查询（历史）","Address":"","OrderNo":501010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":114164,"Name":"genesys","Title":"合肥录音查询（历史）","Address":"","OrderNo":501020,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":107621,"Name":"adjustableToLog","Title":"调听日志","Address":"","OrderNo":501030,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]}]},{"MenuId":118152,"Name":"sysMonitor","Title":"系统监控","Address":"easel","OrderNo":600000,"Type":1,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":118153,"Name":"numberMonitor","Title":"号码监控","Address":"calculator","OrderNo":601000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":118154,"Name":"numberDialCheck","Title":"号码拨测","Address":"","OrderNo":601010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]}]},{"MenuId":119140,"Name":"qualityInspectionPlatform","Title":"质检平台","Address":"social-skype","OrderNo":700000,"Type":1,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":119141,"Name":"systemConfiguration","Title":"系统配置","Address":"android-settings","OrderNo":701000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":119144,"Name":"samplingSetting","Title":"抽样设置","Address":"","OrderNo":701010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":119145,"Name":"qualityInspectionStandardMaintenance","Title":"质检标准维护","Address":"","OrderNo":701020,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":119146,"Name":"summaryMaintenance","Title":"概要维护","Address":"","OrderNo":701030,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":119188,"Name":"personnelRoleManagement","Title":"人员角色管理","Address":"","OrderNo":701040,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":119189,"Name":"departmentManagement","Title":"部门管理","Address":"","OrderNo":701050,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":119142,"Name":"qualityManagement","Title":"质检管理","Address":"social-skype","OrderNo":702000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":119190,"Name":"qcPage","Title":"质检页面","Address":"","OrderNo":702010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":119191,"Name":"cfPage","Title":"处罚页面","Address":"","OrderNo":702020,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":119192,"Name":"gdPage","Title":"工单质检","Address":"","OrderNo":702030,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":119193,"Name":"fjPage","Title":"复检页面","Address":"","OrderNo":702040,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]},{"MenuId":119194,"Name":"zyPage","Title":"质检单转移","Address":"","OrderNo":702050,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]},{"MenuId":119143,"Name":"my","Title":"我的","Address":"person","OrderNo":703000,"Type":2,"Remark":"","HasPermission":true,"ChildMenus":[{"MenuId":119195,"Name":"myzjd","Title":"我的质检单","Address":"","OrderNo":703010,"Type":3,"Remark":"","HasPermission":true,"ChildMenus":[]}]}]}]}
                if (d.data.IsSuccess) {
                    this.modules = d.data.Data
                    this.$store.state.auths = this.auths(d.data.Data)
                    this.screenTabSelected = d.data.Data.map(modules => ['', '', '', ''])
                    // 打开初始菜单
                    // if (this.screenTabSelected.length) {
                    //     this.menuitemOpen = [0, 0]
                    //     this.menuitemSelected = [0, 0, 0]
                    //     this.screenTabSelected[0][0] = '0,0,0'
                    //     this.screens[0] = [
                    //         [0, 0, 0]
                    //     ]
                    // }
                } else {
                    window.location.href = '/Manage/Home/LogOut'
                }
            }).catch(e => {
                this.$Notice.error(this.eF('菜单权限', e.message))
                window.location.href = '/Manage/Home/LogOut'
            })
        }
    },
    mounted () {
        const that = this
        this.isScreenShow = true
        window.levels = {}
        this.$store.state.screen = parseInt(localStorage.screen || this.$store.state.screen)
        window.onresize = () => {
            return (() => {
                window.fullHeight = document.documentElement.clientHeight
                window.fullWidth = document.documentElement.clientWidth
                that.fullHeight = window.fullHeight
                that.fullWidth = window.fullWidth
                that.isCollapsed = {
                    0: document.documentElement.clientWidth <= 1366,
                    1: false,
                    2: true
                }[localStorage.menuValue || 0]
            })()
        }
        // Events
        document.addEventListener('fullscreenchange', e => {
            this.full = !this.full
        })
        // 禁用右击
        const self = this
        document.oncontextmenu = function (e) {
            let node = e.target
            while (node.tagName !== 'BODY') {
                const contextmenu = node.getAttribute('contextmenu')
                if (contextmenu) {
                    self[contextmenu] = JSON.stringify([e.x, e.y])
                    return false
                } else {
                    node = node.parentNode
                }
            }
        }
        this.$refs.app.addEventListener('click', () => {
            this.monitoringPlatform = '[-10000,-10000]'
        })
    },
    beforeDestroy () {
        this.modules = []
        this.screenTabSelected = []
        this.user = {}
        this.fullHeight = 0
        this.fullWidth = 0
        this.ws = null
        delete window.fullHeight
        delete window.fullWidth
        window.onresize = undefined
    },
    watch: {
        fullHeight (val) {
            if (!this.timerH) {
                this.fullHeight = val
                this.timerH = true
                let that = this
                setTimeout(function () {
                    that.timerH = false
                }, 400)
            }
        },
        fullWidth (val) {
            if (!this.timerW) {
                this.fullWidth = val
                this.timerW = true
                let that = this
                setTimeout(function () {
                    that.timerW = false
                }, 400)
            }
        },
        isCollapsed (val) {
            if (!this.timerC) {
                this.isCollapsed = val
                this.timerC = true
                let that = this
                setTimeout(function () {
                    that.timerC = false
                }, 400)
            }
        }
    }
}
</script>

<style lang="stylus">
@import 'app.styl'
.selection-all .ivu-checkbox-wrapper
    margin-right 0
.ak-tree-select .ivu-select-selection
    border-right-color #fff
    &:hover, &:focus
        border-right-color #57a3f3
.ak-info-all-card
    position relative
    width: 100%;
    height: 64px;
    line-height: 64px;
    font-size: 18px;
    background: #f5f5f5;
    border: 1px solid #e9eaec;
    box-shadow: #f5f5f5 0px 0px 8px;
    padding-left: 160px
    text-shadow 1px 1px 1px #c5c8ce;
    div
        position absolute
        left 0
        top 0
        bottom 0
        width 160px
        text-align right
        padding-right: 12px
    span
        font-size 32px
.layout
    .loadPage
        position absolute
        top 28px
        left 0
        right 0
        bottom 0
        background #fff !important
        border-right 1px solid #ddd
        border-bottom 1px solid #ddd
        border-top 1px solid #f2f2f2
        border-left 1px solid #ddd
        text-align center
    &.dark .loadPage
        background #252b34 !important
        border-right 1px solid #424d59
        border-bottom 1px solid #424d59
        border-top 1px solid #424d59
        border-left 1px solid #424d59
        .ivu-spin-fix
            background #252b34 !important
.resize_none textarea
    resize: none
.ak-x-tree
    color #5cadff
    ul li
        margin 4px 0
        user-select none
        .ak-tree-hover
            cursor pointer
            &:hover
                color #19be6b
// 树上按钮样式
.row-tree
    .tree-cursor
        position relative
        font-size 15px
        top 1px
        margin-left 0px
        cursor pointer
        color #9c9c9c
        display none
        &:hover
            color #202730
    &:hover .tree-cursor
        display inline-block
.tree-select .ivu-tag-text
    position relative
    top -1px
// 虚拟部门颜色
.virtual-department
    color #19be6b
.ivu-tree-title
    margin-right 5px
// 弹出层 - 表单样式
.ivu-modal
    .row-info
        padding-top 20px
        line-height 32px
        .ivu-table-cell
            line-height 1.5
    .row-label
        text-align right
        padding 0 12px 0 0
        position relative
        top 2px
    .ak-form
        .item
            height 52px
            padding-top 20px
            .ak-append
                position absolute
                padding 0 7px
                font-size inherit
                font-weight 400
                color #495060
                text-align center
                background-color #eee
                border 1px solid #e9eaec
                border-radius 0
                left 0
                height 32px
                line-height 30px
        .select
            background #fff
            border 1px solid #dddee1
            border-top 0
            transition height 0.2s ease
            overflow auto
            .item-select
                &:hover
                    color #47cb89
                    background-color #f5f5f5 !important
                   cursor pointer
.select-ak
    .selecteds-x
        height 29px
        overflow hidden
    &:hover
        .selecteds-x
            height inherit
            .ivu-btn-group .ivu-btn
                border-bottom 1px solid #e9eaec !important
// 表格汇总颜色
.ivu-table .info-row-count td
    background-color #fafafa
.ivu-table-fixed-right-header, .ivu-table-fixed-header, .ivu-table-header
    background #f5f5f5
.ivu-table-fixed-body
    background #fff
.layout
    height 100%
    .ivu-layout
        .layout-header-bar .ivu-icon
            text-shadow 1px 0 1px #9c9c9c
            cursor pointer
        .ivu-layout-content
            .ivu-page.ak-page
                position relative
                top 3px
        .ivu-layout-sider
            position relative
            background #313d4a
            .ivu-layout-sider-children
                border-right 1px solid #202730
                box-shadow 2px 0 4px #9c9c9c
            .ak-logo
                height 48px
                line-height 50px
                width 100%
                background #202730
                border-bottom 1px solid #131313
                box-shadow 0 1px 1px rgba(255, 255, 255, 0.1)
                font-size 21px
                font-weight bold
                color #fff
                letter-spacing 1px
                padding-left 15px
                overflow hidden
                &.active
                    color #32ff98
                    transition color 0.4s ease
.ivu-layout-content
    overflow hidden
.page .ivu-poptip
    .ivu-poptip-rel
        line-height 17px
    .ivu-poptip-popper
        margin-left -9px
        margin-top -3px
        .ivu-poptip-inner
            background-color rgb(49, 61, 74)
            border-radius 0
            box-shadow 0 3px 9px rgba(0, 0, 0, 0.7)
            letter-spacing 1px
            border-right 1px solid #202730
            .ivu-poptip-title
                padding 8px 12px 5px
                .ivu-poptip-title-inner
                    color #32ff7d
                    font-size 16px
                &:after
                    background-color #32ff7d
                    height 1px
                    left 12px
                    right 12px
            .ivu-poptip-body
                padding 6px 12px 11px
                .ivu-poptip-body-content
                    color #f5f5f5
                    word-wrap break-word
                    pre
                        font-size 12px
                        line-height 16px
                        margin 0
                        position relative
        .ivu-poptip-arrow
            margin-top 2px
            left 12px
            opacity 0.6
            &:after
                border-top-color #202730
.spin-icon-load-a
    animation ani-spin .8s linear infinite
.spin-icon-load
    animation ani-spin .8s linear infinite
    width 10px !important
    height 11px !important
    margin-right 4px
.ivu-breadcrumb a
    color #80848f
.ivu-breadcrumb > span:last-child
    color #19be6b
.ivu-card
    height 100%
.ivu-card-head
    padding 8px
    background #fafafa
    border-top 1px solid #f2f2f2
    border-bottom 1px solid #f2f2f2
    letter-spacing 1px
    box-shadow 0px 2px 4px #f2f2f2
.ivu-card-body
    padding 8px
tr.ivu-table-row.err-o, tr.ivu-table-row.err-o td
    background #f79d86 !important
.ivu-table .table-error-row td
    background-color: #ff6600 !important
    color: #fff !important
    border: 0
.ivu-table-row-hover.hide, .info-row-count.hide
    display none !important
.ivu-picker-confirm-time
    float left
.row-form-info
    position absolute
    left 0
    bottom -27px
.row-form-value
    position absolute
    right 0
    bottom -27px
    color #5cadff
    &.hide
        display none
.ivu-form-item-error .row-form-info
    color #ed4014
.ivu-form-item-error .tree-select
    border: 1px solid #ed3f14 !important
td.ivu-table-expanded-cell
    padding 0 8px
    background #f5f5f5 !important
.ivu-table-cell-expand i
    font-size 18px
    top 3px
    position relative
.tabs-class-1.ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab
    background #fff
    border 1px solid #e9eaec
    border-left none
    border-bottom none
    color #bbbec4
    line-height 22px
.tabs-class-1.ivu-tabs-card>.ivu-tabs-bar .ivu-tabs-tab-active
    background #e9eaec
    color #495060
    font-weight 700
.tabs-class-1.ivu-tabs-card>.ivu-tabs-bar
    border-left 1px solid #e9eaec
.tabs-class-1.ivu-tabs-card .ivu-tabs-nav-scroll
    padding 0
.ak-play i
    left 2px
.ak-play1 i
    left -2px
@keyframes ani-spin
    from
        transform rotate(0deg)
    50%
        transform rotate(180deg)
    to
        transform rotate(360deg)
.ak-Steps-modal
    border 3px #e9eaec double
    border-bottom 0
    padding 24px 20px 10px
    position relative
    top 10px
    border-radius 18px 18px 0 0
    overflow hidden
    box-shadow 0 0 10px #e8e8e8 inset
.ak-footer-top-10
    margin-top 10px !important
.ak-top-10
    padding-top 10px !important
.ak-top-0
    padding-top 0 !important
.ak-top-5
    padding-top 5px !important
.ivu-checkbox-inner
    border 1px solid #2db7f5
.ivu-tabs.ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab
    transition none!important
.ivu-modal-confirm-head
    font-size: 18px;
.dark
    .ak-logo
        background #252b34 !important
        text-shadow #495060
        box-shadow 0 0 6px #000 inset !important
    .ivu-layout
        background #000
        box-shadow none !important
        .ivu-layout-sider .ivu-layout-sider-children
            box-shadow none
            border-right 1px solid #424d59
    .layout-header-bar
        background #313d4a
        box-shadow 3px 3px 6px #131313 inset
        border-bottom 1px solid #424d59 !important
    .ivu-icon.ivu-icon-navicon-round
        color #bbb
        text-shadow 1px 1px 1px #202730
    .ak-modules li
        color #bbb
        text-shadow 1px 1px 1px #202730
        border-right 1px solid #131313 !important
        box-shadow 1px 0 1px rgba(255,255,255,0.1)
        &:hover
            box-shadow none !important
            background #287558 !important
        &.active
            color #32ff98 !important
        .ivu-icon
            box-shadow none
    .ak-collecting
        background #313d4a !important
        border-left 1px solid #424d59 !important
        border-right 1px solid #424d59 !important
        border-top 1px solid #424d59 !important
        .list
            padding 1px 3px !important
            .tab
                color #bbb !important
                height 21px !important
                padding 1px 6px 0px !important
                border 1px solid #313d4a !important
                &.active
                    background #252b34 !important
                    border 1px solid #424d59 !important
                    transition none
                    ul
                        top 19px !important
                        background #313d4a !important
                        border 1px solid #424d59 !important
                        box-shadow 2px 2px 6px #131313 !important
                        left -1px !important
                        li
                            padding 0 20px 0 8px !important
                            .ivu-icon
                                top 1px !important
                            span
                                top 1px !important
                            &:hover
                                background #252b34 !important
                .ivu-icon
                    top 0 !important
                f
                    position relative
                    top -1px
                span
                    top 3px !important
                &:hover
                    background #252b34 !important
                    color #bbb !important
                    box-shadow 0 0 4px #000 inset !important
                    border 1px solid #424d59 !important
        .add, .full
            color #bbb
            border-left 1px solid #424d59 !important
            border-bottom 1px solid #424d59 !important
    .ivu-layout-content
        background #252b34
    .ak-screens.l1 .screen, .ak-screens.l2 .screen, .ak-screens.l3 .screen, .ak-screens.l4 .screen
        border-right 1px solid #424d59 !important
        border-bottom 1px solid #424d59 !important
        border-top 1px solid #424d59 !important
        border-left 1px solid #424d59 !important
        background-color #252b34 !important
        box-shadow none !important
        .ivu-tabs-bar
            border-bottom 1px solid #424d59
            .ivu-tabs-nav-scroll
                padding 0
        .ivu-tabs.ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab
            border-color #17233d
            background #313d4a
            color #babbbb
        .ivu-tabs.ivu-tabs-card>.ivu-tabs-bar .ivu-tabs-tab-active
            background #546a82 !important
            color #ddd !important
            .ivu-icon-ios-close-empty
                color #ddd !important
        &.active
            box-shadow 0 0 12px #000 inset !important
            .ivu-tabs.ivu-tabs-card>.ivu-tabs-bar .ivu-tabs-tab-active
                color #32ff98!important
                background #546a82!important
                .ivu-icon-ios-close-empty
                    color #32ff98 !important
</style>
