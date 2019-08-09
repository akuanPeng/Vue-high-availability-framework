<template>
    <div class="ak-report" v-if="name">
        <div class="tabs" v-if="tabsDataLen > 1">
            <div v-for="(tab, index) in tabsCfg.data" :key="index" :class="`tab ${index === active ? 'active' : ''}`" @click.stop="tabClick(index)">
                <Icon type="pricetag"></Icon>
                {{tab.title}}
            </div>
        </div>
        <div ref="where" class="header">
            <div :style="{display: !where[active].more ? 'initial' : 'table-row-group'}">
                <div v-for="control in tabsCfg.data[active].controls" :class="`control ${control.show ? (where[active][control.show.key] === control.show.value ? '' : 'hide') : ''}`" :key="control.key + active" :style="{ width: control.width }" v-if="control">
                    <div class="label">
                        <span v-if="control.required">*</span>
                        {{control.title}}
                    </div>
                    <div class="item">
                        <template v-if="control.type === 'akSelectTree'">
                            <akSelectTree :name="name" :selected-items="where[active][control.key]" :data="pCfg[control.key]" :multiple="control.multiple" :title-key="control.name" :placeholder="control.placeholder" :clearable="control.clearable" :children-key="control.children" :m-key="control.id" @on-selected="control.onSelected"></akSelectTree>
                        </template>
                        <template v-else-if="control.type === 'akSelectTree2'">
                            <div style="width: 60px;position: absolute;" v-if="control.key2">
                                <Select v-model="where[active][control.key2]" class="ak-tree-select" placeholder="" @on-change="control.key2Change">
                                    <Option :value="1">有效</Option>
                                    <Option :value="2" v-if="!control.key2no">无效</Option>
                                </Select>
                            </div>
                            <div :style="`width: 100%;padding-left: ${control.key2 ? 60 : 0}px;`">
                                <akSelectTree2 :name="name" :key2-value="where[active][control.key2]" :selected-items="where[active][control.key]" :data="pCfg[control.key]" :multiple="control.multiple" :title-key="control.name" :placeholder="control.placeholder" :clearable="control.clearable" :children-key="control.children" :m-key="control.id" @on-search="control.onSearch" @on-selected="control.onSelected" :cache="control.cache"></akSelectTree2>
                            </div>
                        </template>
                        <template v-else-if="control.type === 'Checkbox'">
                            <CheckboxGroup v-model="where[active][control.key]" style="padding-left: 10px;" @on-change="changeFunc(control.change, where[active][control.key])">
                                <Checkbox v-for="(option, i) in [...(control.options || []), ...pCfg[control.optionKey]]" :label="option.label" :key="option.value" :style="i ? 'margin-left: 14px;' : ''"></Checkbox>
                            </CheckboxGroup>
                        </template>
                        <template v-else-if="control.type === 'Radio'">
                            <RadioGroup v-model="where[active][control.key]" style="line-height: 30px;padding-left: 10px;" @on-change="changeFunc(control.change, where[active][control.key])">
                                <Radio v-for="(option, i) in [...(control.options || []), ...pCfg[control.optionKey]]" :label="option.label" :key="option.value" :style="i ? 'margin-left: 14px;' : ''"></Radio>
                            </RadioGroup>
                        </template>
                        <template v-else-if="control.type === 'DatePicker'">
                            <DatePicker v-model="where[active][control.key]" :is-day-auto="control.isDayAuto" :clearable="control.clearable" :type="control._type" :options="control.options" :format="control.format" :placeholder="control.placeholder" style="width: 100%"></DatePicker>
                        </template>
                        <template v-else-if="control.type === 'autoSelect'">
                            <Select v-model="where[active][control.key]" :loading="pCfg.loading" :placeholder="control.placeholder" filterable remote clearable :remote-method="control.remoteMethod">
                                <Option v-for="(option, i) in pCfg.users" :value="option.newJobNumber + ' ' + option.userName" :key="i">{{`${option.userName} (${option.newJobNumber})`}}</Option>
                            </Select>
                        </template>
                        <template v-else-if="control.type === 'autoSelect2'">
                            <Select v-model="where[active][control.key]" class="select-ak" :loading="pCfg.loading" :is-opt="control.isOpt" :page="pCfg[control.page]" :max-number="control.maxNumber" :placeholder="control.placeholder" filterable remote clearable :remote-method="control.remoteMethod" :handle-scroll="control.handleScroll" :multiple="control.multiple">
                                <Option v-for="(option, i) in pCfg[control.dataKey || 'users']" :value="option.newJobNumber + ' ' + option.userName" :key="i">{{`${option.userName} (${option.newJobNumber})`}}</Option>
                            </Select>
                        </template>
                        <span :class="(control.value && JSON.stringify(where[active][control.key]) === JSON.stringify(control.value)) ? 'ivu-form-item-error' : control.optClick ? 'ak-btn' : ''"  @click="changeFunc(control.optClick, where[active][control.key])" v-else>
                            <component :class="where[active][control.key] && where[active][control.key].constructor === Array && where[active][control.key].length > 0 ? 'select-ak' : ''" :is="control.type" :is-opt="control.isOpt" :max-number="control.maxNumber" v-model="where[active][control.key]" :disabled="control.disabled || false" :filterable="control.filterable" :clearable="control.clearable" :multiple="control.multiple" :placeholder="control.placeholder" @on-change="changeFunc(control.change, where[active][control.key])">
                                <template v-if="control.type === 'Select'">
                                    <Option v-for="option in [...(control.options || []), ...pCfg[control.optionKey]]" :value="option[control.option_k || 'value']" :key="option[control.option_k || 'value']" v-if="control.filterKey ? ((where[active][control.filterKey] || []).length > 0 ? (where[active][control.filterKey] || []).indexOf(option.type) !== -1 : true) : true">{{ option[control.option_v || 'label'] }}</Option>
                                </template>
                            </component>
                        </span>
                    </div>
                </div>
            </div>
            <div v-if="where[active].more">
                <div class="control" v-for="control in (tabsCfg.data[active].mores || [])" :key="control.key + active" :style="{ width: control.width }" v-if="control">
                    <div class="label">
                        <span v-if="control.required">*</span>
                        {{control.title}}
                    </div>
                    <div class="item">
                        <template v-if="control.type === 'akSelectTree'">
                            <akSelectTree :name="name" :selected-items="where[active][control.key]" :data="pCfg[control.key]" :multiple="control.multiple" :title-key="control.name" :placeholder="control.placeholder" :clearable="control.clearable" :children-key="control.children" :m-key="control.id" @on-selected="control.onSelected"></akSelectTree>
                        </template>
                        <template v-else-if="control.type === 'akSelectTree2'">
                            <div style="width: 60px;position: absolute;" v-if="control.key2">
                                <Select v-model="where[active][control.key2]" class="ak-tree-select" placeholder="" @on-change="control.key2Change">
                                    <Option :value="1">有效</Option>
                                    <Option :value="2" v-if="!control.key2no">无效</Option>
                                </Select>
                            </div>
                            <div :style="`width: 100%;padding-left: ${control.key2 ? 60 : 0}px;`">
                                <akSelectTree2 :name="name" :key2-value="where[active][control.key2]" :selected-items="where[active][control.key]" :data="pCfg[control.key]" :multiple="control.multiple" :title-key="control.name" :placeholder="control.placeholder" :clearable="control.clearable" :children-key="control.children" :m-key="control.id" @on-search="control.onSearch" @on-selected="control.onSelected" :cache="control.cache"></akSelectTree2>
                            </div>
                        </template>
                        <template v-else-if="control.type === 'DatePicker'">
                            <DatePicker v-model="where[active][control.key]" :is-day-auto="control.isDayAuto" :clearable="control.clearable" :type="control._type" :options="control.options" :format="control.format" :placeholder="control.placeholder" style="width: 100%"></DatePicker>
                        </template>
                        <template v-else-if="control.type === 'autoSelect'">
                            <Select v-model="where[active][control.key]" :loading="pCfg.loading" :placeholder="control.placeholder" filterable remote clearable :remote-method="control.remoteMethod">
                                <Option v-for="(option, i) in pCfg.users" :value="option.newJobNumber + ' ' + option.userName" :key="i">{{`${option.userName} (${option.newJobNumber})`}}</Option>
                            </Select>
                        </template>
                        <template v-else-if="control.type === 'autoSelect2'">
                            <Select v-model="where[active][control.key]" class="select-ak" :loading="pCfg.loading" :is-opt="control.isOpt" :page="pCfg[control.page]" :max-number="control.maxNumber" :placeholder="control.placeholder" filterable remote clearable :remote-method="control.remoteMethod" :handle-scroll="control.handleScroll" :multiple="control.multiple">
                                <Option v-for="(option, i) in pCfg[control.dataKey || 'users']" :value="option.newJobNumber + ' ' + option.userName" :key="i">{{`${option.userName} (${option.newJobNumber})`}}</Option>
                            </Select>
                        </template>
                        <span :class="(control.value && JSON.stringify(where[active][control.key]) === JSON.stringify(control.value)) ? 'ivu-form-item-error' : ''" v-else>
                            <component :class="where[active][control.key] && where[active][control.key].constructor === Array && where[active][control.key].length > 0 ? 'select-ak' : ''" :is="control.type" :is-opt="control.isOpt" :max-number="control.maxNumber" v-model="where[active][control.key]" :disabled="control.disabled || false" :filterable="control.filterable" :clearable="control.clearable" :multiple="control.multiple" :placeholder="control.placeholder" @on-change="changeFunc(control.change, where[active][control.key])">
                                <template v-if="control.type === 'Select'">
                                    <Option v-for="option in [...(control.options || []), ...pCfg[control.optionKey]]" :value="option[control.option_k || 'value']" :key="option[control.option_k || 'value']" v-if="control.filterKey ? ((where[active][control.filterKey] || []).length > 0 ? (where[active][control.filterKey] || []).indexOf(option.type) !== -1 : true) : true">{{ option[control.option_v || 'label'] }}</Option>
                                </template>
                            </component>
                        </span>
                    </div>
                </div>
            </div>
            <div style="float: right;">
                <div class="opt" v-for="(opt, index) in tabsCfg.data[active].optsCfg" :key="index">
                    <Button :type="opt.type" :icon="opt.icon" :disabled="opt.disabled" @click.stop="clickFunc(opt.click)">{{opt.title}}</Button>
                </div>
                <div class="opt" v-if="!!(tabsCfg.data[active].mores || []).length">
                    <Button type="text" @click="moresClick(active)" :icon="where[active].more ? 'chevron-down' : 'chevron-up'" style="color: #2d8cf0">{{where[active].more ? '隐藏更多' : '更多筛选'}}</Button>
                </div>
            </div>
        </div>
        <Table :dc="pagging ? 0 : (isMjz ? 20 : 0)" :dc-height="40" :stripe="pagging" :loading="tabsCfg.data[active].tableCfg.loading" :row-class-name="tabsCfg.data[active].tableCfg.rowClassName" :columns="[...columns, ...tabsCfg.data[active].tableCfg.columns[0], ...dynamics[active], ...tabsCfg.data[active].tableCfg.columns[1]]" :data="dts[active]" size="small" border :height="tableHeight - (this.pagging || this.help.标题 ? 32 : 0)"></Table>
        <div class="page" v-if="pagging || help.标题">
            <Poptip trigger="hover" :title="help.标题" placement="top-start" v-if="help.标题">
                <Icon type="help" :style="{ position: 'relative', left: '4px', color: '#5cadff', top: '1px' }"></Icon>
                <div slot="content">
                    <pre v-html="help.内容"></pre>
                </div>
            </Poptip>
            <Page v-if="pagging" :current="where[active].current" :total="totals[active] === undefined ? total : totals[active]" class-name="paging" size="small" :page-size-opts="tabsCfg.data[active].tableCfg.sizeOpts" :page-size="where[active].size" show-total show-sizer show-elevator @on-page-size-change="pageSizeChange" @on-change="pageChange"></Page>
        </div>
    </div>
</template>

<script>
export default {
    data () {
        return {
            spinShow: false,
            ch: 0
        }
    },
    computed: {
        tabsDataLen () {
            return this.tabsCfg.data.length
        },
        columnsLen () {
            return this.columns.length
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
        pCfg () {
            return this.$store.state[this.name].paramCfg
        },
        pagging () {
            return this.$store.state[this.name].isPagging
        },
        totals () {
            return this.$store.state[this.name].totals || []
        },
        help () {
            return this.$store.state.helps[this.name][this.active] || {}
        },
        dynamics () {
            return this.$store.state[this.name].dynamics
        },
        tableHeight () {
            return this.screenHeight - (this.tabsDataLen > 1 ? 30 : 0) - this.ch - 3
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
        isMjz: {
            type: Boolean,
            default: false
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
        moresClick (active) {
            this.where[active].more = !this.where[active].more
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
        // tab切换
        tabClick (index) {
            this.setValue('active', index)
            // 控制分页显示
            this.setValue('isPagging', this.tabsCfg.data[index].isPagging)
            this.$emit('tabClick', index)
            this.$nextTick(() => {
                setTimeout(() => {
                    this.ch = this.$refs.where.clientHeight
                })
            })
        },
        // 切换每页条数时触发
        pageSizeChange (size) {
            this.setValue('where', obj => {
                obj['where'][obj.active].current = 1
                obj['where'][obj.active].size = size
                return obj['where']
            })
            this.$emit('refresh' + this.active, () => {})
        },
        // 切换页码
        pageChange (current) {
            this.setValue('where', obj => {
                obj['where'][obj.active].current = current
                return obj['where']
            })
            this.$emit('refresh' + this.active, () => {})
        },
        // 状态切换
        openAll () {
            this.setValue('columns', this.columnsLen ? [] : [
                {
                    type: 'selection',
                    width: 60,
                    align: 'center'
                }
            ])
        },
        clickFunc (cbFunc) {
            if (cbFunc) {
                cbFunc(() => {})
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.ch = this.$refs.where.clientHeight
                    })
                })
            }
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
                dts: this.tabsCfg.dts,
                titles: {},
                dynamics: this.tabsCfg.dynamics,
                totals: this.tabsCfg.total,
                paramCfg: this.paramCfg,
                total: this.tabsCfg.data[this.tabsCfg.active].tableCfg.total,
                isPagging: this.tabsCfg.data[this.tabsCfg.active].isPagging
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
            this.spinShow = false
            setTimeout(() => {
                this.ch = this.$refs.where.clientHeight
                this.spinShow = true
            }, 1000)
        }
    },
    mounted () {
        this.ch = this.$refs.where.clientHeight
        this.spinShow = true
    }
}
</script>

<style lang="stylus" scoped>
.ak-report
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
            &.hide
                display none
            .label
                position absolute
                left 0
                width 60px
                line-height 32px
                text-align right
                span
                    color #ed3f14
            .item
                position absolute
                height 100%
                top 0
                left 70px
                right 0
                background-color: #fafafa;
                &:hover
                    z-index 4
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
        padding-left 32px
        .paging
            text-align right
            padding-right 4px
        .ivu-poptip
            position absolute
            left 9px
            font-size 16px
.dark .ak-report .header .item
    background-color: #131313;
</style>
