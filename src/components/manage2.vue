<template>
    <div class="ak-manage" v-if="name">
        <div class="tabs" v-if="tabsDataLen">
            <div v-for="(tab, index) in tabsCfg.data" :key="index" :class="`tab ${index === active ? 'active' : ''}`" @click.stop="tabClick(index)">
                <Icon type="pricetag"></Icon>
                {{tab.title}}
            </div>
        </div>
        <div ref="where" class="header">
            <div class="control" v-for="control in tabsCfg.data[active].controls" :key="control.key" :style="{ width: control.width }">
                <div class="label">{{control.title}}</div>
                <div class="item">
                    <template v-if="control.type === 'akSelectTree'">
                        <akSelectTree :name="name" :selected-items="where[active][control.key]" :data="pCfg[control.key]" :multiple="control.multiple" :title-key="control.name" :placeholder="control.placeholder" :clearable="control.clearable" :children-key="control.children" :m-key="control.id" @on-selected="control.onSelected"></akSelectTree>
                    </template>
                    <template v-else-if="control.type === 'DatePicker'">
                        <DatePicker v-model="where[active][control.key]" :clearable="control.clearable" :type="control._type" :options="control.options" :format="control.format" :placeholder="control.placeholder" style="width: 100%"></DatePicker>
                    </template>
                    <template v-else-if="control.type === 'autoSelect'">
                        <Select v-model="where[active][control.key]" :loading="pCfg.loading" :placeholder="control.placeholder" filterable remote clearable :remote-method="control.remoteMethod">
                            <Option v-for="(option, i) in pCfg.users" :value="option.newJobNumber + ' ' + option.userName" :key="i">{{`${option.userName} (${option.newJobNumber})`}}</Option>
                        </Select>
                    </template>
                    <component :is="control.type" v-model="where[active][control.key]" :disabled="control.disabled || false" :filterable="control.filterable" :clearable="control.clearable" :multiple="control.multiple" :placeholder="control.placeholder" v-else>
                        <template v-if="control.type === 'Select'">
                            <Option v-for="option in [...(control.options || []), ...pCfg[control.optionKey]]" :value="option[control.option_k || 'value']" :key="option[control.option_k || 'value']">{{ option[control.option_v || 'label'] }}</Option>
                        </template>
                    </component>
                </div>
            </div>
            <div style="float: right;">
                <div class="opt" v-for="(opt, index) in tabsCfg.data[active].optsCfg" :key="index">
                    <Button :type="opt.type" :icon="opt.icon" @click.stop="opt.click" :disabled="status.apply || status.recovery">{{opt.title}}</Button>
                </div>
            </div>
        </div>
        <div class="opts" v-if="tabsCfg.data[this.active].isOpts">
            <template v-if="!status.apply">
                <Button type="warning" size="small" @click.stop="openRecoveryAll">{{columnsLen ? '取消' : '开启'}} - 批量回收</Button>
            </template>
            <template v-if="!status.recovery">
                <Button type="info" size="small" @click.stop="openApplyAll">{{columnsLen ? '取消' : '开启'}} - 批量申请</Button>
            </template>
            <Button type="primary" size="small" style="float: right;margin-left: 4px" v-if="isShow" @click.stop="submitFunc">确定 - 批量操作</Button>
        </div>
        <Table :dc="0" :dc-height="40" stripe :loading="tabsCfg.data[active].tableCfg.loading" :columns="[...columns, ...tabsCfg.data[active].tableCfg.columns]" :data="dts[active]" size="small" border :height="tableHeight"></Table>
        <div class="page" :style="{paddingLeft: `${(help.标题 ? 32 : 0) + (pCfg.download ? 32 : 0)}px`}">
            <Poptip :title="help.标题" trigger="hover" placement="top-start" v-if="help.标题">
                <Icon type="help-circled" :style="{ position: 'relative', color: '#80848f', top: '1px' }"></Icon>
                <div slot="content">
                    <pre>{{help.内容}}</pre>
                </div>
            </Poptip>
            <Poptip title="坐席申请自动化操作文档.pptx" trigger="hover" placement="top-start" v-if="pCfg.download" :style="{ left: help.标题 ? '34px' : '' }">
                <span :style="{ position: 'relative', color: '#19be6b', top: '0', fontSize: '12px', cursor: 'pointer', 'text-decoration': 'underline', 'letter-spacing': '1px' }" @click="download(pCfg.download)">下载操作文档</span>
                <div slot="content">
                    <pre>● 坐席申请
 ● 坐席技能调整
 ● 坐席回收</pre>
                </div>
            </Poptip>
            <Page :current="where[active].current" :total="total[active]" class-name="paging" size="small" :page-size-opts="active === 0 && columnsLen ? [] : tabsCfg.data[active].tableCfg.sizeOpts" :page-size="where[active].size" show-total show-sizer show-elevator @on-page-size-change="pageSizeChange" @on-change="pageChange"></Page>
        </div>
    </div>
</template>

<script>
export default {
    data () {
        return {
            spinShow: true,
            ch: 0
        }
    },
    computed: {
        columnsLen () {
            return this.columns.length
        },
        tabsDataLen () {
            return this.tabsCfg.data.length
        },
        active () {
            return this.$store.state[this.name].active
        },
        where () {
            return this.$store.state[this.name].where
        },
        dts () {
            return this.$store.state[this.name].dts
        },
        total () {
            return this.$store.state[this.name].total
        },
        columns () {
            return this.$store.state[this.name].columns
        },
        status () {
            return this.$store.state[this.name].status
        },
        isShow () {
            const sts = this.$store.state[this.name].status
            return (sts.recovery && sts.recovery_count > 0) || (sts.apply && sts.apply_count > 0)
        },
        pCfg () {
            return this.$store.state[this.name].paramCfg
        },
        help () {
            return this.$store.state.helps[this.name][this.active]
        },
        tableHeight () {
            return this.screenHeight - this.ch - 34 - (this.tabsDataLen ? 31 : 0) - (this.tabsCfg.data[this.active].isOpts ? 32 : 0)
        }
    },
    props: {
        name: {
            type: String,
            default: ''
        },
        screenHeight: {
            type: Number,
            default: 0
        },
        screenWidth: {
            type: Number,
            default: 0
        },
        screenCount: {
            type: Number,
            default: 1
        },
        isCollapsed: {
            type: Boolean,
            default: false
        },
        tabsCfg: {
            type: Object,
            default () {
                return {
                    active: 0,
                    data: []
                }
            }
        },
        paramCfg: {
            type: Object,
            default () {
                return {
                    dt: []
                }
            }
        }
    },
    methods: {
        setValue (key, value) {
            const state = this.$store.state
            if (state[this.name]) {
                state[this.name][key] = typeof value === 'function' ? value(state[this.name][key]) : value
            }
        },
        // tab切换
        tabClick (index) {
            this.setValue('active', index)
            this.$emit('tabClick', index)
        },
        // 切换每页条数时触发
        pageSizeChange (size) {
            this.setValue('where', obj => {
                obj[this.active].current = 1
                obj[this.active].size = size
                return obj
            })
            this.$emit('refresh' + this.active)
        },
        // 切换页码
        pageChange (current) {
            this.setValue('where', obj => {
                obj[this.active].current = current
                return obj
            })
            this.$emit('refresh' + this.active)
        },
        // 状态切换申请
        openApplyAll () {
            this.setValue('columns', this.columnsLen ? [] : [
                {
                    width: 60,
                    renderHeader: (h, params) => {
                        const current = this.where[this.active].current
                        const value = !!this.status.apply_all[current]
                        const data = this.dts[this.active].filter(_ => _.seatState === 1)
                        const ilen = data.length
                        return ilen > 0 ? h('span', {
                            style: {
                                marginLeft: '8px'
                            }
                        }, [
                            h('Checkbox', {
                                props: {
                                    value
                                },
                                on: {
                                    'on-change': b => {
                                        this.setValue('status', status => {
                                            if (b) {
                                                for (let i = 0; i < ilen; i++) {
                                                    status.apply_list[data[i].jobNumber] = data[i].userName
                                                    status.apply_count++
                                                }
                                                status.apply_all[current] = b
                                            } else {
                                                for (let i = 0; i < ilen; i++) {
                                                    delete status.apply_list[data[i].jobNumber]
                                                    status.apply_count--
                                                }
                                                delete status.apply_all[current]
                                            }
                                            return status
                                        })
                                    }
                                }
                            })
                        ]) : ''
                    },
                    align: 'center',
                    fixed: 'left',
                    render: (h, params) => {
                        const value = !!this.status.apply_list[params.row.jobNumber]
                        return params.row.seatState === 1 ? h('span', {
                            style: {
                                marginLeft: '8px'
                            }
                        }, [
                            h('Checkbox', {
                                props: {
                                    value
                                },
                                on: {
                                    'on-change': b => {
                                        this.setValue('status', status => {
                                            if (b) {
                                                status.apply_list[params.row.jobNumber] = params.row.userName
                                                status.apply_count++
                                            } else {
                                                delete status.apply_list[params.row.jobNumber]
                                                status.apply_count--
                                            }
                                            return status
                                        })
                                    }
                                }
                            })
                        ]) : ''
                    }
                }
            ])
            this.setValue('status', status => {
                if (status.apply) {
                    status.apply_list = {}
                    status.apply_all = []
                }
                status.apply_count = 0
                status.apply = !status.apply
                return status
            })
        },
        // 状态切换回收
        openRecoveryAll () {
            this.setValue('columns', this.columnsLen ? [] : [
                {
                    width: 60,
                    renderHeader: (h, params) => {
                        const current = this.where[this.active].current
                        const value = !!this.status.recovery_all[current]
                        const data = this.dts[this.active].filter(_ => _.seatState === 3)
                        const ilen = data.length
                        return ilen > 0 ? h('span', {
                            style: {
                                marginLeft: '8px'
                            }
                        }, [
                            h('Checkbox', {
                                props: {
                                    value
                                },
                                on: {
                                    'on-change': b => {
                                        this.setValue('status', status => {
                                            if (b) {
                                                for (let i = 0; i < ilen; i++) {
                                                    status.recovery_list[data[i].jobNumber] = data[i].userName
                                                    status.recovery_count++
                                                }
                                                status.recovery_all[current] = b
                                            } else {
                                                for (let i = 0; i < ilen; i++) {
                                                    delete status.recovery_list[data[i].jobNumber]
                                                    status.recovery_count--
                                                }
                                                delete status.recovery_all[current]
                                            }
                                            return status
                                        })
                                    }
                                }
                            })
                        ]) : ''
                    },
                    align: 'center',
                    fixed: 'left',
                    render: (h, params) => {
                        const value = !!this.status.recovery_list[params.row.jobNumber]
                        return params.row.seatState === 3 ? h('span', {
                            style: {
                                marginLeft: '8px'
                            }
                        }, [
                            h('Checkbox', {
                                props: {
                                    value
                                },
                                on: {
                                    'on-change': b => {
                                        this.setValue('status', status => {
                                            if (b) {
                                                status.recovery_list[params.row.jobNumber] = params.row.userName
                                                status.recovery_count++
                                            } else {
                                                delete status.recovery_list[params.row.jobNumber]
                                                status.recovery_count--
                                            }
                                            return status
                                        })
                                    }
                                }
                            })
                        ]) : ''
                    }
                }
            ])
            this.setValue('status', status => {
                if (status.recovery) {
                    status.recovery_list = {}
                    status.recovery_all = []
                }
                status.recovery_count = 0
                status.recovery = !status.recovery
                return status
            })
        },
        submitFunc () {
            this.$emit('submitBatch', this.status, () => {
                this.setValue('columns', [])
                this.setValue('status', status => {
                    status.apply_list = {}
                    status.apply_count = 0
                    status.apply = false
                    status.recovery_list = {}
                    status.recovery_count = 0
                    status.recovery = false
                    return status
                })
            })
        },
        // 下载
        download (url) {
            location.href = url
        }
    },
    created () {
        // 是否存在页面状态，否注册页面状态数据
        const state = this.$store.state
        if (this.name && !state[this.name]) {
            this.$set(state, this.name, {
                active: this.tabsCfg.active,
                where: this.tabsCfg.where,
                columns: [],
                status: {
                    recovery: false,
                    recovery_all: [],
                    recovery_list: {},
                    recovery_count: 0,
                    apply: false,
                    apply_all: [],
                    apply_list: {},
                    apply_count: 0
                },
                dts: this.tabsCfg.dts,
                total: this.tabsCfg.total,
                titles: {},
                paramCfg: this.paramCfg
            })
        }
    },
    beforeDestroy () {
        const state = this.$store.state
        if (this.name && !state[this.name]) {
            this.$delete(state, this.name)
        }
    },
    watch: {
        screenCount () {
            if (this.spinShow) {
                this.spinShow = false
                setTimeout(() => {
                    this.ch = this.$refs.where.clientHeight
                    this.spinShow = true
                }, 1000)
            }
        },
        screenWidth () {
            if (this.spinShow) {
                this.spinShow = false
                setTimeout(() => {
                    this.ch = this.$refs.where.clientHeight
                    this.spinShow = true
                }, 1000)
            }
        },
        screenHeight () {
            if (this.spinShow) {
                this.spinShow = false
                setTimeout(() => {
                    this.ch = this.$refs.where.clientHeight
                    this.spinShow = true
                }, 1000)
            }
        },
        isCollapsed () {
            if (this.spinShow) {
                this.spinShow = false
                setTimeout(() => {
                    this.ch = this.$refs.where.clientHeight
                    this.spinShow = true
                }, 1000)
            }
        }
    },
    mounted () {
        this.spinShow = true
        this.ch = this.$refs.where.clientHeight
    }
}
</script>

<style lang="stylus" scoped>
.ak-manage
    position relative
    height 100%
    width 100%
    background #fff
    .tabs
        height 30px
        .tab
            display inline-block
            border 1px solid #dddee1
            height 31px
            box-sizing border-box
            line-height 31px
            padding 0 12px
            font-size 12px
            cursor pointer
            user-select none
            margin-right 1px
            color #9c9c9c
            background #fafafa
            font-family serif
            .ivu-icon
                position relative
                top 1px
            &:hover
                border-color #2db7f5
            &.active
                border-color #dddee1
                border-bottom-color #fff
                background #fff
                color #47cb89
                font-weight bold
    .header
        min-height 43px
        padding 0 5px 5px
        background #fff
        border-top 1px solid #dddee1
        border-left 1px solid #dddee1
        border-right 1px solid #dddee1
        background #fff
        box-sizing border-box
        display table
        width 100%
        .opt
            display inline-block
            height 32px
            position relative
            margin-top 5px
            margin-left 5px
            float right
        .control
            display inline-block
            height 32px
            float left
            position relative
            margin-top 5px
            .label
                position absolute
                left 0
                width 60px
                line-height 32px
                text-align right
            .item
                position absolute
                height 100%
                top 0
                left 70px
                right 0
                &:hover
                    z-index 4
    .opts
        height 32px
        border-top 1px solid #e9eaec
        border-left 1px solid #e9eaec
        border-right 1px solid #e9eaec
        padding 4px 5px
    .page
        height 32px
        line-height 34px
        background #fff
        border-bottom 1px solid #dddee1
        border-left 1px solid #dddee1
        border-right 1px solid #dddee1
        background linear-gradient(#eee, #ddd)
        user-select none
        box-sizing border-box
        .paging
            text-align right
            padding-right 4px
        .ivu-poptip
            position absolute
            left 9px
            font-size 16px
</style>
