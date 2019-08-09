<template>
    <div :class="`ak-tree ${this.treeSelected.depId !== undefined ? 'active' : ''}`" v-if="name">
        <div class="content" :style="{ height: tableHeight + 'px' }">
            <Tree :data="treeData" children-key="subDepList" :render="renderContent" @on-toggle-expand="expandTreeFunc" empty-text="正在加载中..."></Tree>
        </div>
        <div class="list" v-if="treeSelected.depId !== undefined && treeSelected.depId !== 0">
            <div class="header">
                <span :title="treeSelected.depName || ''">{{treeSelected.depName || ''}}</span>
                <Icon type="plus" size="19" @click.stop="addMember"></Icon>
            </div>
            <div class="member">
                <ul>
                    <li v-for="(member, index) in treeMembers" :key="index" :class="`${member.isVirtual ? 'virtual-jobnumber' : ''} ${member.isVirtualRelation ? 'virtual-person' : ''}`">
                        <Icon type="person" size="16" :class="member.gender === 0 ? 'woman' : (member.gender === 1 ? 'man' : '')"></Icon>
                        <span class="span-click" @click.stop="showMemberInfo(member)">
                            <span :title="member.userName" class="span-name">{{member.userName}}</span> ({{member.newJobNumber}})
                        </span>
                        <Icon type="ios-minus-outline" size="18" @click.stop="delMember(member)"></Icon>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data () {
        return {
            tableHeight: 0
        }
    },
    computed: {
        treeSelected () {
            return this.$store.state[this.name].selected
        },
        treeData () {
            return this.$store.state[this.name].data
        },
        treeExpands () {
            return this.$store.state[this.name].expands
        },
        treeMembers () {
            return this.$store.state[this.name].members
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
        data: {
            type: Array,
            default () {
                return []
            }
        },
        selected: {
            type: Object,
            default () {
                return {}
            }
        },
        expands: {
            type: Array,
            default () {
                return []
            }
        },
        members: {
            type: Array,
            default () {
                return []
            }
        },
        cacheEmpty: Function,
        paramCfg: {
            type: Object,
            default () {
                return {}
            }
        }
    },
    methods: {
        addMember () {
            this.$emit('on-add-member', this.treeSelected)
        },
        setValue (key, value) {
            const state = this.$store.state
            if (state[this.name]) {
                state[this.name][key] = value
            }
        },
        expandTreeFunc (data) {
            const expands = [...this.treeExpands]
            if (data.expand) {
                expands[expands.length] = data.depId
            } else {
                expands.splice(expands.indexOf(data.depId), 1)
            }
            this.setValue('expands', expands)
        },
        // 计算表格高度
        tHF () {
            this.tableHeight = this.screenHeight - 4
        },
        // 树节点渲染规则
        renderContent (h, { root, node, data }) {
            if (this.treeExpands.indexOf(data.depId) !== -1) data.expand = true
            return h('span', {
                class: 'row-tree',
                style: {
                    position: 'relative',
                    top: '1px'
                }
            }, [
                h('span', {
                    class: `ivu-tree-title ${this.treeSelected.depId === data.depId ? 'ivu-tree-title-selected' : ''} ${data.isVirtual ? 'virtual-department' : ''}`,
                    on: {
                        click: e => {
                            if (data.depId !== this.treeSelected.depId) {
                                this.setValue('selected', data)
                                this.$emit('on-selected-tree', data)
                            } else {
                                this.setValue('selected', {})
                            }
                            e.preventDefault()
                        }
                    }
                }, data.depName + ''),
                ...(data.depId !== 0 && !data.isVirtual ? [
                    h('Icon', {
                        class: 'tree-cursor',
                        props: {
                            type: 'plus-circled'
                        },
                        on: {
                            click: () => {
                                this.$emit('on-add-department', data)
                            }
                        }
                    })
                ] : []),
                ...(data.isVirtual ? [
                    h('Icon', {
                        class: 'tree-cursor',
                        props: {
                            type: 'minus-circled'
                        },
                        on: {
                            click: () => {
                                this.$emit('on-del-virtual-dept', data, () => {
                                    if (data.depId === this.treeSelected.depId) this.setValue('selected', {})
                                })
                            }
                        }
                    })
                ] : [])
            ])
        },
        // 查看成员信息
        showMemberInfo (data) {
            this.$emit('on-show-member', data)
        },
        // 删除成员
        delMember (data) {
            this.$emit('on-del-member', data)
        }
    },
    created () {
        // 是否存在页面状态，否注册页面状态数据
        const state = this.$store.state
        if (this.name && !state[this.name]) {
            this.$set(state, this.name, {
                selected: this.selected,
                data: this.data,
                expands: this.expands,
                members: this.members,
                paramCfg: {
                    stime: this.paramCfg.stime,
                    cacheEmpty: this.cacheEmpty
                }
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
        data (value) {
            this.setValue('data', value)
        },
        members (value) {
            this.setValue('members', value)
        },
        screenHeight (v) {
            this.tHF()
        },
        screenWidth () {
            this.tHF()
        },
        screenCount () {
            this.tHF()
        },
        isCollapsed () {
            this.$nextTick(() => setTimeout(() => this.tHF(), 150))
        }
    },
    mounted () {
        this.$nextTick(() => this.tHF())
    }
}
</script>

<style lang="stylus" scoped>
.ak-tree
    position relative
    height 100%
    width 100%
    border 1px solid #dddee1
    background #fff
    &.active
        padding-right 380px
    .content
        width 100%
        padding 0 8px
        overflow auto
    .list
        width 380px
        position absolute
        top 0
        right 0
        bottom 0
        border-left 1px solid #f2f2f2
        box-sizing border-box
        .header
            height 34px
            border-bottom 1px solid #f2f2f2
            padding 8px
            background #fafafa
            box-sizing border-box
            span
                font-size 14px
                font-weight bold
                letter-spacing 1px
                position relative
                top -1px
                color #47cb89
                overflow hidden
                display inline-block
                width 138px
                white-space nowrap
                text-overflow ellipsis
            .ivu-icon
                float right
                cursor pointer
                position relative
                color #9c9c9c
                top -1px
                margin-left 8px
                &:hover
                    color #202730
        .member
            position absolute
            left 0
            right 0
            top 34px
            bottom 0
            overflow auto
            li
                padding 7px 8px 6px
                border-bottom 1px solid #f2f2f2
                box-sizing border-box
                cursor pointer
                .ivu-icon-person
                    margin-right 2px
                    margin-left 1px
                    &.woman
                        color #ed3f14
                    &.man
                        color #5cadff
                .ivu-icon-ios-minus-outline
                    float right
                    cursor pointer
                    color #d2d2d2
                    &:hover
                        color #202730
                .span-name
                    overflow hidden
                    display inline-block
                    max-width 70px
                    white-space nowrap
                    text-overflow ellipsis
                    height 14px
                .span-click:hover
                    color #2d8cf0
                &.virtual-jobnumber
                    color #9c9c9c
                &.virtual-person
                    color #19be6b
</style>
