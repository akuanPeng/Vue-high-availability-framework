<template>
    <div class="ak-table">
        <div class="header" v-if="whereCfg.controls.length || title || optsCfg.length">
            <span v-if="title" style="font-size: 15px;position: relative;top: 10px;left: 5px;font-weight: bold;">来电号码: <span style="color: red">{{title}}</span></span>
            <div class="control" v-for="control in whereCfg.controls" :key="control.key" :style="{ width: control.width }" v-else>
                <div class="label">{{control.title}}</div>
                <div class="item">
                    <template v-if="control.type === 'akSelectTree'">
                        <akSelectTree :name="name" :selected-items="whereCfg.data[control.key]" :data="pCfg[control.key]" :multiple="control.multiple" :title-key="control.name" :placeholder="control.placeholder" :clearable="control.clearable" :children-key="control.children" :m-key="control.id" @on-selected="control.onSelected"></akSelectTree>
                    </template>
                    <template v-else-if="control.type === 'DatePicker'">
                        <DatePicker v-model="whereCfg.data[control.key]" :clearable="control.clearable" :type="control._type" :options="control.options" :format="control.format" :placeholder="control.placeholder" style="width: 100%"></DatePicker>
                    </template>
                    <component :is="control.type" v-model="whereCfg.data[control.key]" :disabled="control.disabled || false" :filterable="control.filterable" :clearable="control.clearable" :multiple="control.multiple" :placeholder="control.placeholder" v-else>
                        <template v-if="control.type === 'Select'">
                            <Option v-for="(option, i) in [...(control.options || []), ...paramCfg[control.optionKey]]" :value="option[control.option_k || 'value']" :key="i">{{ option[control.option_v || 'label'] }}</Option>
                        </template>
                    </component>
                </div>
            </div>
            <div class="opt" v-for="(opt, index) in optsCfg" :key="index" v-if="!opt.hide">
                <Button :type="opt.type" :icon="opt.icon" :disabled="opt.disabled" @click.stop="opt.click">{{opt.title}}</Button>
            </div>
        </div>
        <Table stripe :loading="tableCfg.loading" :columns="[...(paramCfg.columns || []), ...tableCfg.columns]" :data="tableCfg.data" size="small" border :height="tableHeight"></Table>
        <div class="page" v-if="tableCfg.sizeOpts">
            <Page :current="whereCfg.data.current" :total="tableCfg.total" class-name="paging" size="small" :page-size-opts="tableCfg.sizeOpts" :page-size="whereCfg.data.size" show-total show-sizer show-elevator @on-page-size-change="pageSizeChange" @on-change="pageChange"></Page>
        </div>
    </div>
</template>

<script>
export default {
    data () {
        return {
            tableHeight: 249
        }
    },
    props: {
        title: {
            type: String,
            default: ''
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
        // 切换每页条数时触发
        pageSizeChange (size) {
            this.whereCfg.data.current = 1
            this.whereCfg.data.size = size
            this.$emit('refresh')
        },
        // 切换页码
        pageChange (current) {
            this.whereCfg.data.current = current
            this.$emit('refresh')
        }
    },
    created () {
    }
}
</script>

<style lang="stylus" scoped>
.ak-table
    position relative
    height 100%
    width 100%
    background #fff
    .header
        min-height 43px
        padding 0 5px 5px
        border-top 1px solid #e9eaec
        border-left 1px solid #e9eaec
        border-right 1px solid #e9eaec
        background #fff
        box-sizing border-box
        display table
        width 100%
        .opt
            display inline-block
            height 32px
            float left
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
        border-bottom 1px solid #dddee1
        border-left 1px solid #dddee1
        border-right 1px solid #dddee1
        background #fcfcfc
        user-select none
        box-sizing border-box
        padding-left 32px
        .ivu-poptip
            position absolute
            left 9px
            font-size 16px
        .paging
            text-align right
            padding-right 4px
</style>
