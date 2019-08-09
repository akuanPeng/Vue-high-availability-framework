<template>
    <div :class="`ak-screens l${screensData.length} module${parent.moduleSelected}`" v-if="screensData.length > 0">
        <div v-for="(screen, index) in screensData" :key="index" :class="`screen s${index + 1} ${screen.length > 0 ? '' : 'selected'} ${parent.screenSelected === index ? 'active' : ''}`" @click="screenSelectedFunc(index)" @dragover="dragover" @drop="drop(index, $event)">
            <template v-if="screen.filter(a => a[0] === parent.moduleSelected).length === 0">
                <transition name="fade" v-if="parent.modules[parent.moduleSelected]">
                    <keep-alive>
                        <component class="ak-show" :is="parent.modules[parent.moduleSelected].Name" :screen-height="screenHeight" :screen-width="screenWidth" :screen-count="screensData.length" :is-collapsed="parent.isCollapsed"></component>
                    </keep-alive>
                </transition>
            </template>
            <template v-else>
                <Tabs :ref="index" :name="index" v-model="mSelecteds[index]" type="card" size="small" closable :animated="false" :draggable="true" @on-dragstart="dragstart" @on-tab-remove="closeTagPage" @on-click="selectTabPage">
                    <TabPane v-for="s in screen.filter(a => a[0] === parent.moduleSelected)" :key="s.join()" :name="s.join()" icon="record" :label="parent.modules[s[0]].ChildMenus[s[1]].ChildMenus[s[2]].Title" :title="'● ' + parent.getPath(s).join(' / ')">
                        <transition name="fade">
                            <keep-alive>
                                <component class="ak-show" :is="parent.modules[s[0]].ChildMenus[s[1]].ChildMenus[s[2]].Name" :screen-path="s" :screen-height="screenHeight" :screen-width="screenWidth" :screen-count="screensData.length" :is-collapsed="parent.isCollapsed"></component>
                            </keep-alive>
                        </transition>
                    </TabPane>
                </Tabs>
            </template>
        </div>
    </div>
</template>

<script>
import utils from '../../utils'
import components from '../pages'
export default {
    name: 'akScreens',
    provide () {
        return {
            utils,
            api: this.api,
            eF: this.parent.eF,
            parent: this.parent,
            setTheme: value => {
                this.parent.skin = value
            },
            // 统计点击数
            setVisit: (vm, type, obj) => {
                const s = vm.screenPath
                const m = this.parent.modules
                if (type === 'start') {
                    const stime = Date.now()
                    vm.stime = stime
                    vm.paramCfg.stime = stime
                } else if (type === 'end') {
                    if (vm.stime) {
                        const u = this.parent.user
                        const state = this.$store.state
                        const page = state[m[s[0]].ChildMenus[s[1]].ChildMenus[s[2]].Name]
                        page.pvid = utils.guid()
                        page.pvend = Date.now()
                        page.pvobj = {
                            module_EN: m[s[0]].Name,
                            module_CN: m[s[0]].Title,
                            childModule_EN: m[s[0]].ChildMenus[s[1]].Name,
                            childModule_CN: m[s[0]].ChildMenus[s[1]].Title,
                            functionName_EN: m[s[0]].ChildMenus[s[1]].ChildMenus[s[2]].Name,
                            functionName_CN: m[s[0]].ChildMenus[s[1]].ChildMenus[s[2]].Title
                        }
                        this.api.eSUserVisitHistoryInsert([{
                            id: page.pvid,
                            type: 1,
                            parentId: '',
                            ...page.pvobj,
                            childFuncationName_EN: '',
                            childFuncationName_CN: '',
                            userJobNumber: u.newJobNumber,
                            userName: u.userName,
                            userDepartId: u.detpId,
                            requestTime: vm.stime,
                            responseTime: page.pvend,
                            departureTime: 0
                        }]).then(d => {
                            if (!d.data.IsSuccess) {
                                this.$Notice.error(this.parent.eF('录入访问量', d.data.Info))
                            }
                        }).catch(e => {
                            this.$Notice.error(this.parent.eF('录入访问量', e.message))
                        })
                    }
                } else if (type === 'opt') {
                    const u = this.parent.user
                    const state = this.$store.state
                    const page = state[m[s[0]].ChildMenus[s[1]].ChildMenus[s[2]].Name]
                    this.api.eSUserVisitHistoryInsert([{
                        type: 2,
                        parentId: page.pvid,
                        ...page.pvobj,
                        childFuncationName_EN: obj.en,
                        childFuncationName_CN: obj.cn,
                        userJobNumber: u.newJobNumber,
                        userName: u.userName,
                        userDepartId: u.detpId,
                        requestTime: obj.stime,
                        responseTime: Date.now(),
                        departureTime: 0
                    }]).then(d => {
                        if (!d.data.IsSuccess) {
                            this.$Notice.error(this.parent.eF('录入操作量', d.data.Info))
                        }
                    }).catch(e => {
                        this.$Notice.error(this.parent.eF('录入操作量', e.message))
                    })
                }
            }
        }
    },
    inject: ['parent', 'api'],
    props: ['screensData'],
    data () {
        return {
            val: '',
            count: 1
        }
    },
    computed: {
        mSelecteds () {
            return this.parent.screenTabSelected[this.parent.moduleSelected] || []
        },
        moduleName () {
            return this.parent.modules[this.parent.moduleSelected] ? this.parent.modules[this.parent.moduleSelected].Name : ''
        },
        screenHeight () {
            const height = this.parent.fullHeight - 48 - 8
            return this.parent.full ? this.parent.fullHeight : (Math.ceil(this.count > 2 ? height / 2 : height) - 33)
        },
        screenWidth () {
            const width = this.parent.fullWidth - 200 - 8
            return Math.ceil(this.count > 1 ? width / 2 : width)
        }
    },
    components: {
        ...components
    },
    methods: {
        // 拖拽开始
        dragstart (name) {
            this.val = name
        },
        // 拖拽执行
        dragover (ev) {
            ev.preventDefault()
        },
        // 拖拽结束
        drop (num, ev) {
            const d = this.parent.getLocation(this.val)
            if (num === d[0]) return
            this.closeTagPage(this.val, d[1])
            this.parent.screenTabSelected[this.parent.moduleSelected][num] = this.val
            this.parent.screens[num][this.parent.screens[num].length] = this.val.split(',').map(_ => parseInt(_))
            this.parent.screenSelected = num
            this.selectStatus(num)
            ev.preventDefault()
        },
        // 选择页签
        selectTabPage (name, index, e) {
            if (e) {
                let $div = e.target
                $div = $div.tagName === 'DIV' ? $div : $div.parentNode
                if ($div.children[0].getAttribute('class') === 'ivu-icon ivu-icon-load-b spin-icon-load') return
                $div.children[0].setAttribute('class', 'ivu-icon ivu-icon-load-b spin-icon-load')
                this.$nextTick(_ => {
                    setTimeout(_ => {
                        $div.children[0].setAttribute('class', 'ivu-icon ivu-icon-record')
                    }, 200)
                })
            }
            this.parent.screenSelected = index
            const screenTabSelected = [...this.parent.screenTabSelected]
            screenTabSelected[this.parent.moduleSelected][this.parent.screenSelected] = name
            this.$set(this.parent, 'screenTabSelected', screenTabSelected)
            this.selectStatus(index)
            const wz = name.split(',')
            const page = this.parent.modules[wz[0]].ChildMenus[wz[1]].ChildMenus[wz[2]]
            const state = this.$store.state
            const obj = state[page.Name]
            if (obj && obj.paramCfg) {
                const refreshFunc = obj.paramCfg.refreshFunc
                if (refreshFunc) refreshFunc()
            }
        },
        // 关闭页签
        closeTagPage (name, isDrag) {
            // 关闭页签
            const screens = [...this.parent.screens]
            const [index, i] = this.parent.getLocation(name)
            const screenTabSelected = [...this.parent.screenTabSelected]
            const wz = name.split(',')
            const page = this.parent.modules[wz[0]].ChildMenus[wz[1]].ChildMenus[wz[2]]
            const state = this.$store.state
            // 清除缓存
            const obj = state[page.Name]
            if (obj) {
                const cacheEmpty = obj.paramCfg.cacheEmpty
                const stime = obj.paramCfg.stime
                const u = this.parent.user
                this.api.eSUserVisitHistoryInsert([{
                    id: obj.pvid,
                    type: 1,
                    parentId: '',
                    ...obj.pvobj,
                    childFuncationName_EN: '',
                    childFuncationName_CN: '',
                    userJobNumber: u.newJobNumber,
                    userName: u.userName,
                    userDepartId: u.detpId,
                    requestTime: stime,
                    responseTime: obj.pvend,
                    departureTime: Date.now()
                }]).then(d => {
                    if (!d.data.IsSuccess) {
                        this.$Notice.error(this.parent.eF('更新关闭时间', d.data.Info))
                    }
                }).catch(e => {
                    this.$Notice.error(this.parent.eF('更新关闭时间', e.message))
                })
                if (cacheEmpty) cacheEmpty()
            }
            if (!isDrag) this.$delete(state, page.Name)
            //  关闭项是否被选中
            if (screenTabSelected[this.parent.moduleSelected][index] === name) {
                //  只有一个页签，最后一个页签，其它
                if (screens[index].length === 1) {
                    screenTabSelected[this.parent.moduleSelected][index] = ''
                } else if ((screens[index].length - 1) === i) {
                    screenTabSelected[this.parent.moduleSelected][index] = screens[index][i - 1].join()
                } else {
                    screenTabSelected[this.parent.moduleSelected][index] = screens[index][i + 1].join()
                }
            }
            screens[index].splice(i, 1)
            this.parent.screenTabSelected = screenTabSelected
            this.parent.screens = screens
            this.selectStatus(index)
        },
        // 选中状态切换
        selectStatus (index) {
            const val = this.parent.screenTabSelected[this.parent.moduleSelected][index]
            const selected = (this.parent.screenTabSelected[this.parent.moduleSelected][index] === -1 ? '' : val).split(',')
            this.parent.moduleSelected = this.parent.moduleSelected
            this.parent.menuitemOpen = [parseInt(selected[0]), parseInt(selected[1])]
            this.parent.menuitemSelected = [parseInt(selected[0]), parseInt(selected[1]), parseInt(selected[2])]
        },
        // 选择分屏
        screenSelectedFunc (index) {
            this.parent.screenSelected = index
            this.selectStatus(index)
        }
    },
    watch: {
        screensData (v) {
            this.count = v.length
        }
    },
    mounted () {
        this.parent.screenRefs = this.$refs
        // 离开页面触发
        window.onbeforeunload = e => {
            e = e || window.event
            // 记录关闭时间
            for (let i = 0, ilen = this.screensData.length; i < ilen; i++) {
                for (let j = 0, jlen = this.screensData[i].length; j < jlen; j++) {
                    const s = this.screensData[i][j]
                    const pageName = this.parent.modules[s[0]].ChildMenus[s[1]].ChildMenus[s[2]].Name
                    const state = this.$store.state
                    const u = this.parent.user
                    if (state[pageName] && state[pageName].paramCfg) {
                        this.api.eSUserVisitHistoryInsert([{
                            id: state[pageName].pvid,
                            type: 1,
                            parentId: '',
                            ...state[pageName].pvobj,
                            childFuncationName_EN: '',
                            childFuncationName_CN: '',
                            userJobNumber: u.newJobNumber,
                            userName: u.userName,
                            userDepartId: u.detpId,
                            requestTime: state[pageName].paramCfg.stime,
                            responseTime: state[pageName].pvend,
                            departureTime: Date.now()
                        }]).then(d => {
                            if (!d.data.IsSuccess) {
                                this.$Notice.error(this.parent.eF('更新关闭时间', d.data.Info))
                            }
                        }).catch(e => {
                            this.$Notice.error(this.parent.eF('更新关闭时间', e.message))
                        })
                    }
                }
            }
        }
    },
    beforeDestroy () {
        this.parent.screenRefs = []
    }
}
</script>

<style lang="stylus" scoped>
.ak-show
    height: 100%
    padding: 1px 0
    display block !important
.ak-screens
    position absolute
    top 0
    left 0
    right 0
    bottom 0
    &.l4
        .screen
            width 50%
            height 50%
            &.s1, &.s3
                border-left 1px solid #ddd
            &.s3, &.s4
                border-bottom none
    &.l3
        .screen
            height 50%
            &.s1, &.s2
                width 50%
            &.s3
                width 100%
                border-right 1px solid #ddd
                border-bottom none
    &.l2
        .screen
            height 100%
            width 50%
            border-bottom 1px solid #ddd
            border-left 1px solid #ddd
    &.l1
        .screen
            height 100%
            width 100%
            border-right 1px solid #ddd
            border-bottom 1px solid #ddd
            box-shadow none !important
            border-top 1px solid #f2f2f2
            border-left 1px solid #ddd
            background #fff
    .screen
        position relative
        float left
        box-sizing border-box
        border-left 1px solid #fff
        border-top 1px solid #fff
        background url('/Manage/content/drag.png') no-repeat
        background-position center
        box-shadow 0 0 8px #ddd inset
        &.selected
            cursor pointer
        &.s2, &.s4
            border-right 1px solid #ddd
        &.s3, &.s4
            border-bottom 1px solid #ddd
        &.active
            box-shadow 0 0 12px #ccc
            transition box-shadow 0.4s ease
            position relative
            z-index 1
        .ivu-tabs
            position absolute
            top 1px
            left 1px
            right 1px
            bottom 1px
</style>
