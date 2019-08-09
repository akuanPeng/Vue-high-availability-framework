<template>
    <div class="ak-manage" v-if="name">
        <div ref="where" class="header">
            <span class="m-title" v-if="title">{{title}}</span>
            <div :style="{display: !where.more ? 'initial' : 'table-row-group'}">
                <div class="control" v-for="control in whereCfg.controls" :key="control.key" :style="{ width: control.width }" v-if="control.auto ? pCfg[control.optionKey].length > 0 : (control.show ? showFunc(control.show, where) : true)">
                    <div class="label">{{control.title}}</div>
                    <div class="item">
                        <template v-if="control.type === 'akSelectTree'">
                            <akSelectTree :name="name" :selected-items="where[control.key]" :data="pCfg[control.key]" :multiple="control.multiple" :title-key="control.name" :placeholder="control.placeholder" :clearable="control.clearable" :children-key="control.children" :m-key="control.id" @on-selected="control.onSelected"></akSelectTree>
                        </template>
                        <template v-else-if="control.type === 'akSelectTree2'">
                            <div style="width: 60px;position: absolute;" v-if="control.key2">
                                <Select v-model="where[control.key2]" class="ak-tree-select" placeholder="" @on-change="control.key2Change">
                                    <Option :value="1">有效</Option>
                                    <Option :value="2" v-if="!control.key2no">无效</Option>
                                </Select>
                            </div>
                            <div :style="`width: 100%;padding-left: ${control.key2 ? 60 : 0}px;`">
                                <akSelectTree2 :name="name" :key2-value="where[control.key2]" :selected-items="where[control.key]" :data="pCfg[control.key]" :multiple="control.multiple" :title-key="control.name" :placeholder="control.placeholder" :clearable="control.clearable" :children-key="control.children" :m-key="control.id" @on-search="control.onSearch" @on-selected="control.onSelected" :cache="control.cache"></akSelectTree2>
                            </div>
                        </template>
                        <template v-else-if="control.type === 'DatePicker'">
                            <DatePicker v-model="where[control.key]" :is-day-auto="control.isDayAuto" :clearable="control.clearable" :type="control._type" :options="control.options" :format="control.format" :placeholder="control.placeholder" style="width: 100%"></DatePicker>
                        </template>
                        <template v-else-if="control.type === 'autoSelect'">
                            <Select v-model="where[control.key]" :loading="pCfg.loading" :placeholder="control.placeholder" filterable remote clearable :remote-method="control.remoteMethod">
                                <Option v-for="(option, i) in pCfg[control.optionsKey ? control.optionsKey : 'users']" :value="control.valueKey ? option[control.valueKey] : (option.newJobNumber + ' ' + option.userName)" :key="i">{{control.labelKey ? option[control.labelKey] : `${option.userName} (${option.newJobNumber})`}}</Option>
                            </Select>
                        </template>
                        <template v-else-if="control.type === 'InputArr'">
                            <Row>
                                <Col span="10">
                                    <Input v-model="where[control.key][0]" :placeholder="control.placeholder[0]"></Input>
                                </Col>
                                <Col span="4" :style="{lineHeight: '32px', textAlign: 'center'}">-</Col>
                                <Col span="10">
                                    <Input v-model="where[control.key][1]" :placeholder="control.placeholder[1]"></Input>
                                </Col>
                            </Row>
                        </template>
                        <component :class="where[control.key] && where[control.key].constructor === Array && where[control.key].length > 0 ? 'select-ak' : ''" :is="control.type" v-model="where[control.key]" :disabled="control.disabled || false" :filterable="control.filterable" :clearable="control.clearable" :is-opt="control.isOpt" :max-number="control.maxNumber" :multiple="control.multiple" :placeholder="control.placeholder" @on-change="changeFunc(control.change, where[control.key])"  v-else>
                            <template v-if="control.type === 'Select'">
                                <Option v-for="option in [...(control.options || []), ...pCfg[control.optionKey]]" :value="option[control.option_k || 'value']" :key="option[control.option_k || 'value']">{{ option[control.option_v || 'label'] }}</Option>
                            </template>
                        </component>
                    </div>
                </div>
            </div>
            <div v-if="where.more">
                <div class="control" v-for="control in (whereCfg.mores || [])" :key="control.key" :style="{ width: control.width }">
                    <div class="label">{{control.title}}</div>
                    <div class="item">
                        <template v-if="control.type === 'akSelectTree'">
                            <akSelectTree :name="name" :selected-items="where[control.key]" :data="pCfg[control.key]" :multiple="control.multiple" :title-key="control.name" :placeholder="control.placeholder" :clearable="control.clearable" :children-key="control.children" :m-key="control.id" @on-selected="control.onSelected"></akSelectTree>
                        </template>
                        <template v-else-if="control.type === 'DatePicker'">
                            <DatePicker v-model="where[control.key]" :is-day-auto="control.isDayAuto" :clearable="control.clearable" :type="control._type" :options="control.options" :format="control.format" :placeholder="control.placeholder" style="width: 100%"></DatePicker>
                        </template>
                        <template v-else-if="control.type === 'autoSelect'">
                            <Select v-model="where[control.key]" :loading="pCfg.loading" :placeholder="control.placeholder" filterable remote clearable :remote-method="control.remoteMethod">
                                <Option v-for="(option, i) in pCfg[control.optionsKey ? control.optionsKey : 'users']" :value="control.valueKey ? option[control.valueKey] : (option.newJobNumber + ' ' + option.userName)" :key="i">{{control.labelKey ? option[control.labelKey] : `${option.userName} (${option.newJobNumber})`}}</Option>
                            </Select>
                        </template>
                        <template v-else-if="control.type === 'InputArr'">
                            <Row>
                                <Col span="10">
                                    <Input v-model="where[control.key][0]" :placeholder="control.placeholder[0]"></Input>
                                </Col>
                                <Col span="4" :style="{lineHeight: '32px', textAlign: 'center'}">-</Col>
                                <Col span="10">
                                    <Input v-model="where[control.key][1]" :placeholder="control.placeholder[1]"></Input>
                                </Col>
                            </Row>
                        </template>
                        <component :class="where[control.key] && where[control.key].constructor === Array && where[control.key].length > 0 ? 'select-ak' : ''" :is="control.type" v-model="where[control.key]" :disabled="control.disabled || false" :filterable="control.filterable" :clearable="control.clearable" :is-opt="control.isOpt" :max-number="control.maxNumber" :multiple="control.multiple" :placeholder="control.placeholder" @on-change="changeFunc(control.change, where[control.key])"  v-else>
                            <template v-if="control.type === 'Select'">
                                <Option v-for="option in [...(control.options || []), ...pCfg[control.optionKey]]" :value="option[control.option_k || 'value']" :key="option[control.option_k || 'value']">{{ option[control.option_v || 'label'] }}</Option>
                            </template>
                        </component>
                    </div>
                </div>
            </div>
            <div style="float: right;">
                <div class="opt" v-for="(opt, index) in oCfg" :key="index" v-if="!opt.hide">
                    <Button :type="opt.type" :icon="opt.icon" :disabled="pCfg.disabledKey && pCfg.disabledKey === opt.key ? true : opt.disabled" @click.stop="opt.click">{{opt.title}}</Button>
                </div>
                <div class="opt" v-if="!!(whereCfg.mores || []).length">
                    <Button type="text" @click="moresClick()" :icon="where.more ? 'chevron-down' : 'chevron-up'" style="color: #2d8cf0">{{where.more ? '隐藏更多' : '更多筛选'}}</Button>
                </div>
            </div>
        </div>
        <Table :dc="pagging ? 0 : (isMjz ? 20 : 0)" :dc-height="40" stripe :loading="tableCfg.loading" :columns="[...(pCfg.columns || []), ...tableCfg.columns, ...(pCfg.columns1 || [])]" :data="data" size="small" border :height="tableHeight - (title ? 2 : 1)" v-if="spinShow || spin"></Table>
        <div class="page" :style="{paddingLeft: `${(help && help.标题 ? 32 : 0) + (pCfg.download ? 32 : 0)}px`}" v-if="pagging || (help && help.标题)">
            <Poptip trigger="hover" :title="help.标题" placement="top-start" v-if="help.标题">
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
            <Page v-if="pagging" :current="where.current" :total="total" class-name="paging" size="small" :page-size-opts="tableCfg.sizeOpts" :page-size="where.size" show-total show-sizer show-elevator @on-page-size-change="pageSizeChange" @on-change="pageChange"></Page>
        </div>
        <Spin size="large" fix v-if="!spinShow && !title && !spin"></Spin>
    </div>
</template>

<script>
export default {
    data () {
        return {
            spinShow: false,
            isDSQ: true,
            ch: 0
        }
    },
    computed: {
        where () {
            return this.$store.state[this.name].where
        },
        pCfg () {
            return this.$store.state[this.name] ? this.$store.state[this.name].paramCfg : {}
        },
        oCfg () {
            return this.$store.state[this.name].optsCfg
        },
        help () {
            return this.$store.state.helps[this.name] ? this.$store.state.helps[this.name][0] : {}
        },
        data () {
            return this.$store.state[this.name].data
        },
        pagging () {
            return this.$store.state[this.name].isPagging
        },
        total () {
            return this.$store.state[this.name].total
        },
        tableHeight () {
            if (this.$refs.where || this.spin) {
                return this.screenHeight - this.ch - ((this.pagging || this.help.标题) ? 35 : 3)
            } else {
                return 0
            }
        }
    },
    props: {
        spin: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: ''
        },
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
        isMjz: {
            type: Boolean,
            default: false
        },
        screenCount: {
            type: Number,
            default: 1
        },
        isCollapsed: {
            type: Boolean,
            default: false
        },
        optsCfg: {
            type: Array,
            default () {
                return []
            }
        },
        tableCfg: {
            type: Object,
            default () {
                return {
                    columns: [],
                    data: []
                }
            }
        },
        whereCfg: {
            type: Object,
            default () {
                return {
                    controls: []
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
        showFunc (objs, dts) {
            for (let key in objs) {
                if (objs[key].indexOf(dts[key]) !== -1) {
                    return true
                }
            }
            return false
        },
        moresClick () {
            this.where.more = !this.where.more
            this.$nextTick(() => {
                setTimeout(() => {
                    this.ch = this.$refs.where.clientHeight
                })
            })
        },
        changeFunc (cb, value) {
            if (cb) cb(value)
        },
        setValue (key, value) {
            const state = this.$store.state
            if (state[this.name]) {
                state[this.name][key] = typeof value === 'function' ? value(state[this.name]) : value
            }
        },
        // 切换每页条数时触发
        pageSizeChange (size) {
            this.setValue('where', obj => {
                obj['where'].current = 1
                obj['where'].size = size
                return obj['where']
            })
            this.$emit('refresh')
        },
        // 切换页码
        pageChange (current) {
            this.setValue('where', obj => {
                obj['where'].current = current
                return obj['where']
            })
            this.$emit('refresh')
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
                where: this.whereCfg.data,
                titles: {},
                paramCfg: this.paramCfg,
                optsCfg: this.optsCfg,
                data: this.tableCfg.data,
                total: this.tableCfg.total,
                isPagging: this.tableCfg.isPagging
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
            if (this.isDSQ) {
                this.isDSQ = false
                setTimeout(() => {
                    this.ch = this.$refs.where.clientHeight
                    this.isDSQ = true
                }, 1000)
            }
        },
        screenWidth () {
            if (this.isDSQ) {
                this.isDSQ = false
                setTimeout(() => {
                    this.ch = this.$refs.where.clientHeight
                    this.isDSQ = true
                }, 1000)
            }
        },
        screenHeight () {
            if (this.isDSQ) {
                this.isDSQ = false
                setTimeout(() => {
                    this.ch = this.$refs.where.clientHeight
                    this.isDSQ = true
                }, 1000)
            }
        },
        isCollapsed () {
            this.isDSQ = false
            setTimeout(() => {
                this.ch = this.$refs.where.clientHeight
                this.isDSQ = true
            }, 1000)
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
    .header
        min-height 43px
        padding 0 5px 5px
        background #fff
        border-top 1px solid #e9eaec
        border-left 1px solid #e9eaec
        border-right 1px solid #e9eaec
        background #fff
        box-sizing border-box
        display table
        width 100%
        .m-title
            font-size: 14px;
            font-weight: bold;
            padding-left: 7px;
            line-height: 36px;
            position: relative;
            top: 3.5px;
        .opt
            display inline-block
            height 31px
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
    .page
        height 32px
        line-height 34px
        background #fff
        border-bottom 1px solid #e9eaec
        border-left 1px solid #e9eaec
        border-right 1px solid #e9eaec
        background linear-gradient(#eee, #ddd)
        user-select none
        box-sizing border-box
        .ivu-poptip
            position absolute
            left 9px
            font-size 16px
        .paging
            text-align right
            padding-right 4px
</style>
