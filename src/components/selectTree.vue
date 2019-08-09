<template>
    <div :class="classes" onselectstart="return false">
        <button type="button" class="tree-select-single" @click="open = !open" v-if="(multiple && selecteds.length < 1) || (!multiple && selecteds.length <= 1)">
            <span v-if="selecteds.length === 0">{{placeholder}}</span>
            <span v-if="selecteds.length === 1" class="active" :title="(titles[selecteds[0]] || { title: '加载中...' }).title">{{(titles[selecteds[0]] || { title: '加载中...' }).title}}</span>
        </button>
        <div class="tree-select-multiple" @click="open = !open" v-else>
            <Tag closable color="default" v-for="(item, index) in selecteds" :name="index" :key="index" @on-close="onclose">{{(titles[item] || { title: '加载中...' }).title}}</Tag>
        </div>
        <Icon type="arrow-down-b" class="tree-selec-allow" @click="open = !open"></Icon>
        <Icon type="ios-close" class="tree-selec-close" v-if="clearable" @click="onclear"></Icon>
        <div class="tree-select-dropdown">
            <Tree :data="data" :render="renderContent" :children-key="childrenKey" :id-key="mKey"></Tree>
        </div>
        <div v-if="disabled === true" style="background: rgba(0, 0, 0, .05);position: absolute;left: 0;right: 0;top: 0;bottom: 0;cursor: not-allowed;"></div>
    </div>
</template>
<script>

export default {
    data () {
        return {
            open: false,
            selecteds: this.selectedItems,
            titles: this.cache
        }
    },
    props: {
        name: {
            type: String,
            default: ''
        },
        placeholder: { type: String, default: '部门 - 单选' },
        data: { type: Array },
        emptyText: { type: String, default: '没有匹配的数据' },
        titleKey: String,
        childrenKey: String,
        multiple: { type: Boolean, default: false },
        mKey: String,
        cache: {
            type: Object,
            default () {
                return {}
            }
        },
        clearable: { type: Boolean, default: false },
        disabled: {
            type: Boolean,
            default: false
        },
        selectedItems: {
            type: Array,
            default () {
                return []
            }
        }
    },
    computed: {
        classes () {
            return [
                { 'tree-select': true },
                { 'tree-select-value': this.selecteds.length > 0 },
                { 'tree-select-open': this.open },
                { 'tree-select-disabled': this.disabled }
            ]
        }
    },
    methods: {
        // 判断所有平级节点状态
        judgeState (nodes, id) {
            for (let i = 0, ilen = nodes.length; i < ilen; i++) {
                const value = nodes[i][this.mKey || 'id']
                if (id !== value && this.selecteds.indexOf(value) === -1) {
                    return id
                }
            }
            // 取父级节点
            const parent = this.titles[id].parent
            if (parent.length) {
                const key = parent[parent.length - 1]
                return this.judgeState(this.titles[key].nodes, key)
            } else {
                return id
            }
        },
        // 递归清理选中
        emptyState (parent, nodes, id) {
            // 是否有父级
            if (parent.length) {
                // 获得父节点ID
                const pId = parent[parent.length - 1]
                // 获取父节点对象
                const n = this.titles[pId]
                // 判断父节点是否被选中
                if (this.selecteds.indexOf(pId) !== -1 || n.parent.filter(_ => this.selecteds.indexOf(_) !== -1).length > 0) {
                    // 清理父自身
                    const wz = this.selecteds.indexOf(pId)
                    if (wz !== -1) this.selecteds.splice(wz, 1)
                    // 清理父级下所有子选择
                    this.clearNodeSelected(pId, parent.length - 1)
                    // 选择非它的项
                    for (let i = 0; i < nodes.length; i++) {
                        const idn = nodes[i][this.mKey || 'id']
                        if (idn !== id) this.selecteds.push(idn)
                    }
                    this.emptyState(n.parent, n.nodes, pId)
                }
            }
        },
        // 清理所有子集选择
        clearNodeSelected (id, len) {
            const ids = [...this.selecteds]
            for (let i = 0, ilen = ids.length; i < ilen; i++) {
                const parent = len === undefined ? this.titles[ids[i]].parent : this.titles[ids[i]].parent.slice(0, len)
                const index = (parent || []).indexOf(id)
                const wz = this.selecteds.indexOf(ids[i])
                if (index !== -1) this.selecteds.splice(wz, 1)
            }
        },
        // 树渲染方法
        renderContent (h, { root, node, data, parent, nodes }) {
            const id = data[this.mKey || 'id']
            const title = data[this.titleKey || 'title']
            this.$set(this.titles, id, { title, parent, nodes })
            return h('span', {
                style: {
                    display: 'inline-block'
                }
            }, [
                ...(this.multiple ? [
                    h('Checkbox', {
                        props: {
                            value: this.selecteds.indexOf(id) !== -1 || parent.filter(_ => this.selecteds.indexOf(_) !== -1).length > 0
                        },
                        style: {
                            marginRight: '3px'
                        },
                        on: {
                            'on-change': v => {
                                if (v) {
                                    // 判断同级和父级节点是否都被选中
                                    const value = this.judgeState(nodes, id)
                                    // 清理所有子集选择
                                    this.clearNodeSelected(value)
                                    // 设置选中
                                    this.selecteds.push(value)
                                } else {
                                    this.emptyState(parent, nodes, id)
                                    const wz = this.selecteds.indexOf(id)
                                    if (wz !== -1) this.selecteds.splice(wz, 1)
                                }
                                this.$emit('on-selected', this.selecteds, this.titles)
                            }
                        }
                    })
                ] : []),
                h('span', {
                    class: `ivu-tree-title ${this.selecteds.indexOf(id) !== -1 && !this.multiple ? 'ivu-tree-title-selected' : ''}`,
                    on: {
                        // 选中
                        click: e => {
                            if (!this.multiple) {
                                this.selecteds = [id]
                                this.open = false
                                this.$emit('on-selected', this.selecteds, this.titles)
                            } else {
                                if (data[this.childrenKey]) {
                                    e.target.parentNode.parentNode.children[0].click()
                                    this.$emit('on-selected', this.selecteds, this.titles)
                                }
                            }
                        }
                    }
                }, title)
            ])
        },
        onclose (event, index) {
            this.selecteds.splice(index, 1)
            this.$emit('on-selected', this.selecteds)
        },
        onclear () {
            this.selecteds = []
            this.$emit('on-selected', this.selecteds)
        },
        func (e) {
            let el = this.$el
            if (!el.contains(e.target) && el !== e.target) {
                this.open = false
            } else {
                return false
            }
        }
    },
    mounted () {
        document.addEventListener('click', this.func, true)
        if (this.$store) {
            const titles = this.$store.state[this.name].titles
            this.titles = titles
        }
    },
    watch: {
        selectedItems (v) {
            if (!v.length) {
                this.selecteds = []
            }
        }
    },
    beforeDestroy () {
        document.removeEventListener('click', this.func, true)
        if (this.$store) {
            this.titles = {}
        }
    }
}
</script>
<style lang="stylus" scoped>
.tree-select
    width 100%
    height auto
    line-height 1.42857
    color #555
    border 1px solid #e9eaec
    background-color #fff
    display inline-block
    outline 0 !important
    box-shadow none !important
    position relative
    vertical-align middle
    transition border 0.2s ease-in-out, background 0.2s ease-in-out, box-shadow 0.2s ease-in-out
    > .tree-select-single
        display inline-block
        height 30px
        line-height 30px
        padding 1px 24px 0 8px
        font-size 12px
        outline 0
        border none
        box-sizing border-box
        color #495060
        background-color transparent
        position relative
        cursor pointer
        width 100%
        text-align left
        span
            color #bbbec4
            &.active
                color #495060
    &.tree-select-disabled > .tree-select-single span.active
        color #ccc
    > .tree-select-multiple
        max-width 100%
        line-height 24px
        padding 2px 29px 2px 4px
        vertical-align middle
        cursor pointer
        max-height 29px
        overflow hidden
        &:hover
            max-height inherit
            overflow auto
    > .tree-select-dropdown
        width inherit
        max-height 0
        overflow auto
        margin 5px 0
        padding 0 5px
        background-color #fff
        box-sizing border-box
        border-radius 0
        box-shadow 0 1px 6px rgba(0, 0, 0, 0.2)
        position absolute
        z-index 900
    > .tree-selec-allow
        position absolute
        top 50%
        right 8px
        line-height 1
        margin-top -7px
        font-size 14px
        color #80848f
        transition all 0.2s ease-in-out
    > .tree-selec-close
        position absolute
        top 50%
        right 8px
        line-height 1
        margin-top -7px
        font-size 14px
        color #80848f
        transition all 0.2s ease-in-out
        display none
    &.tree-select-open
        > .tree-selec-allow
            transform rotate(180deg)
            display inline-block
        > .tree-select-dropdown
            max-height 400px
    &.tree-select-value:not(.tree-select-disabled):hover
        border-color #57a3f3
        > .tree-selec-close
            display block
            cursor pointer
        > .tree-selec-allow
            display none
</style>
