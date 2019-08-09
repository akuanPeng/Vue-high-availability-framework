<template>
    <div class="ak-collecting">
        <div class="list">
            <div v-for="(tab, index) in tabs" :key="index" :class="`tab ${parent.open === index && tab.l && tab.l.length > 0 ? 'active' : ''}`" :title="'● ' + (tab.t === 'd' ? parent.getPath(tab.v).join(' / ') : tab.v)" @click.stop="openTab(tab.v, tab.t, index, $event)">
                <template v-if="tab.t === 'd'">
                    <Icon :type="(parent.screenTabSelected[parent.moduleSelected] || [])[parent.screenSelected] === tab.v.join() ? 'android-document' : 'document'"></Icon>
                    <f>{{parent.getPath(tab.v)[2]}}</f>
                    <span @click.self="closeTab(index)">╳</span>
                </template>
                <template v-else>
                    <Icon :type="tab.l.filter(_ => _.v.join() === (parent.screenTabSelected[parent.moduleSelected] || [])[parent.screenSelected]).length ? 'ios-folder' : 'ios-folder-outline'"></Icon>
                    <f>{{tab.v}}</f>
                    <span @click.self="closeTab(index)">╳</span>
                    <ul v-if="parent.open === index && tab.l.length > 0">
                        <li v-for="(item, i) in tab.l" :key="i" @click.stop="openTab(item.v, item.t, i, $event)">
                            <Icon :type="(parent.screenTabSelected[parent.moduleSelected] || [])[parent.screenSelected] === item.v.join() ? 'android-document' : 'document'"></Icon>
                            {{parent.getPath(item.v)[2]}}
                            <span @click.self="closeTab(index, i)">╳</span>
                        </li>
                    </ul>
                </template>
            </div>
        </div>
        <div :class="`add ${isCollectingAdd ? '' : 'disabled'}`" @click.stop="setTab" v-if="false">
            <Icon type="android-star-outline"></Icon>
            收藏
        </div>
        <div :class="`full ${isFull ? '' : 'disabled'}`" @click.prevent="fullFunc()">
            <Icon :type="`android-expand`"></Icon>
        </div>
    </div>
</template>

<script>
export default {
    name: 'akCollecting',
    inject: ['parent'],
    data () {
        return {
            fx: false,
            folder: '',
            tabs: JSON.parse(localStorage.collecting || '[]')
        }
    },
    props: ['isFull'],
    computed: {
        // 是否可以添加收藏
        isCollectingAdd () {
            // 运算中间量
            const [mds, sss, sts] = [this.parent.moduleSelected, this.parent.screenSelected, this.parent.screenTabSelected]
            // 进行复杂判断
            return R.gt(
                R.length(
                    R.filter(
                        a => R.gte(a[0])(mds)
                    )(this.parent.screens[sss])
                )
            )(0) && R.gte(
                R.length(
                    R.filter(
                        tab => R.gte(tab.t)('f') ? R.gt(
                            R.length(
                                R.filter(
                                    _ => R.gte(_.v.join())(sts[mds][sss])
                                )(tab.l)
                            )
                        )(0) : R.gte(
                            tab.v.join()
                        )(sts[mds][sss])
                    )(this.tabs)
                )
            )(0)
        }
    },
    methods: {
        // 打开快捷
        openTab (selected, type, index, e) {
            // 关闭按钮不触发
            if (R.gte(e.target.tagName)('SPAN')) return
            if (type === 'd') {
                // 选中菜单
                this.parent.menuitemSelected = selected
                // 页签生成确定浏览
                let screens = [...this.parent.screens]
                // 获得当前选择的页签位置
                const d = this.parent.getLocation(selected.join())
                const sed = [...selected]
                if (d[1] !== -1) {
                    this.parent.moduleSelected = sed[0]
                    this.$set(this.parent.screenTabSelected[sed[0]], this.parent.screenSelected, sed.join())
                } else {
                    screens[this.parent.screenSelected].push(sed)
                    this.parent.moduleSelected = sed[0]
                    this.$set(this.parent.screenTabSelected[sed[0]], this.parent.screenSelected, sed.join())
                    this.parent.screens = screens
                }
                this.parent.menuitemOpen = [parseInt(selected[0]), parseInt(selected[1])]
                this.parent.open = -1
            } else {
                if (this.tabs[index].l.length > 0) {
                    this.parent.open = this.parent.open === index ? -1 : index
                } else {
                    this.parent.open = -1
                }
            }
        },
        // 设置快捷
        setTab () {
            if (!this.isCollectingAdd) return
            const path = this.parent.screenTabSelected[this.parent.moduleSelected || 0][this.parent.screenSelected].split(',').map(p => parseInt(p))
            this.folder = ''
            this.fx = false
            this.$Modal.confirm({
                title: '添加收藏',
                render: h => {
                    return h('div', {
                        class: 'ak-form'
                    }, [
                        h('div', {
                            class: 'item'
                        }, [
                            h('Input', {
                                props: {
                                    value: this.parent.getPath(path).join(' / '),
                                    readonly: true,
                                    placeholder: '路径...'
                                }
                            }, [
                                h('div', {
                                    slot: 'prepend',
                                    style: {
                                        width: '54px'
                                    }
                                }, '路径')
                            ])
                        ]),
                        h('div', {
                            class: 'item'
                        }, [
                            h('Input', {
                                props: {
                                    value: this.folder,
                                    placeholder: '收藏夹...'
                                },
                                on: {
                                    'on-change': _ => {
                                        this.folder = _.target.value
                                    }
                                }
                            }, [
                                h('div', {
                                    slot: 'prepend',
                                    style: {
                                        width: '54px'
                                    }
                                }, '收藏夹'),
                                h('Button', {
                                    slot: 'append',
                                    props: {
                                        icon: this.fx ? 'arrow-down-b' : 'arrow-left-b'
                                    },
                                    style: {
                                        width: '42px',
                                        'box-shadow': 'none!important'
                                    },
                                    on: {
                                        click: () => {
                                            this.fx = !this.fx
                                        }
                                    }
                                })
                            ])
                        ]),
                        h('div', {
                            class: 'select',
                            style: {
                                'height': this.fx ? '224px' : '0px'
                            }
                        }, this.tabs.map((item, i) => {
                            return item.t === 'f' ? h('div', {
                                class: 'item-select',
                                style: {
                                    height: '32px',
                                    'line-height': '32px',
                                    'padding': '0 12px',
                                    'border-bottom': '1px solid #eee'
                                },
                                on: {
                                    click: _ => {
                                        this.folder = item.v
                                        this.fx = false
                                    }
                                }
                            }, [
                                h('Icon', {
                                    props: {
                                        type: 'ios-folder-outline'
                                    },
                                    style: {
                                        'margin-right': '8px',
                                        'font-size': '13px',
                                        position: 'relative',
                                        top: '1px'
                                    }
                                }),
                                item.v
                            ]) : ''
                        }))
                    ])
                },
                onOk: () => {
                    if (this.folder) {
                        const folder = this.tabs.filter(_ => _.t === 'f' && _.v === this.folder)
                        if (folder.length) {
                            folder[0].l = [...folder[0].l, {
                                t: 'd',
                                v: path
                            }]
                        } else {
                            this.tabs.push({
                                t: 'f',
                                v: this.folder,
                                l: [
                                    {
                                        t: 'd',
                                        v: path
                                    }
                                ]
                            })
                        }
                    } else {
                        this.tabs.push({
                            t: 'd',
                            v: path
                        })
                    }
                    localStorage.collecting = JSON.stringify(this.tabs)
                }
            })
        },
        // 关闭快捷
        closeTab (index, i) {
            const tabs = this.tabs
            if (tabs[index].t === 'f' && typeof i === 'number') {
                tabs[index].l.splice(i, 1)
                this.parent.open = -1
            } else {
                tabs.splice(index, 1)
            }
            this.tabs = tabs
            localStorage.collecting = JSON.stringify(this.tabs)
        },
        launchIntoFullscreen (element) {
            if (element.requestFullscreen) {
                element.requestFullscreen()
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen()
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen()
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen()
            }
        },
        fullFunc () {
            const m = this.parent.modules
            const t = this.parent.screenTabSelected[this.parent.moduleSelected || 0].filter(_ => _)
            if ((t.length && t[0])) {
                const s = t[0].split(',')
                const dom = document.querySelector(`.ak-${m[s[0]].ChildMenus[s[1]].ChildMenus[s[2]].Name}`)
                if (dom) {
                    this.launchIntoFullscreen(dom)
                    this.$nextTick(() => {
                        this.$set(this.parent, 'fullHeight', document.documentElement.clientHeight)
                        this.$set(this.parent, 'fullWidth', document.documentElement.clientWidth)
                    })
                }
            } else {
                if (this.parent.moduleSelected === 1) {
                    const dom = document.querySelector(`.ak-reportingSystem`)
                    if (dom) {
                        this.launchIntoFullscreen(dom)
                        this.$nextTick(() => {
                            this.$set(this.parent, 'fullHeight', document.documentElement.clientHeight)
                            this.$set(this.parent, 'fullWidth', document.documentElement.clientWidth)
                        })
                    }
                }
            }
        }
    }
}
</script>

<style lang="stylus" scoped>
.ak-collecting
    height 30px
    line-height 30px
    box-sizing border-box
    border-left 1px solid #ddd
    border-right 1px solid #ddd
    box-sizing border-box
    position relative
    background #fafafa
    .add
        height 100%
        text-align center
        cursor pointer
        position absolute
        right 30px
        top 0
        z-index 5
        box-sizing border-box
        border-left 1px solid #f2f2f2
        user-select none
        padding 0 12px
        .ivu-icon
            font-size 15px
            position relative
            top 1px
        &.disabled
            display none
        &:not(.disabled):hover
            color #47cb89
            box-shadow 0 0 8px #ccc
            transition color 0.2s ease
    .full
        height 100%
        text-align center
        cursor pointer
        position absolute
        right 0
        top 0
        width 30px
        z-index 5
        box-sizing border-box
        border-left 1px solid #f2f2f2
        border-bottom: 1px solid #f2f2f2
        user-select none
        &.disabled
            display none
        &:not(.disabled):hover
            color #47cb89
            box-shadow 0 0 8px #ccc
            transition color 0.2s ease
    .list
        position absolute
        top 0
        left 0
        right 94px
        bottom 0
        padding 1px 5px
        .tab
            user-select none
            display inline-block
            height 22px
            line-height 14px
            padding 0 4px
            color #495060
            cursor pointer
            position relative
            border 2px solid transparent
            border-bottom none
            box-sizing border-box
            .ivu-icon
                margin-right 4px
                font-size 14px
                position relative
                top 1px
            span
                display inline-block
                font-size 14px
                position relative
                top 4px
                margin-left 0
                width 0
                overflow hidden
            &:hover
                color #47cb89
                background #fff
                box-shadow 0 0 3px #ccc
                transition box-shadow 0.4s ease
                span
                    margin-left 4px
                    width 9px
                    transition width 0.3s ease, margin-left 0.3s ease
            &.active
                color #47cb89
                background #fefefe
                transition background 0.4s ease
                border 2px solid #fefefe
                border-bottom none
                box-sizing border-box
                box-shadow none
                transition border 0.5s ease
                span
                    margin-left 4px
                    width 9px
                    top 6px
                    visibility hidden
                ul
                    position absolute
                    top 22px
                    left -2px
                    z-index 5
                    list-style-type none
                    margin 0
                    padding 0
                    width 160px
                    background #fff
                    border 1px solid #e2e2e2
                    border-top-width 1px
                    box-sizing border-box
                    box-shadow 2px 2px 6px #c5c8ce
                    li
                        height 25px
                        line-height 27px
                        padding 0 20px 0 10px
                        border-bottom 1px solid #e2e2e2
                        box-sizing border-box
                        border-top 0
                        position relative
                        .ivu-icon
                            margin-right 6px
                        span
                            position absolute
                            top 0
                            right 8px
                            visibility visible
                        &:last-child
                            border-bottom none
                        &:hover
                            color #47cb89
                            background #fefefe
                            transition box-shadow 0.4s ease
</style>
