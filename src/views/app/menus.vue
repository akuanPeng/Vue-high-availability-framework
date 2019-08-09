<template>
    <div class="ak-menus">
        <ul :class="menuitemClass">
            <li v-for="(item, index) in menuitemData" :key="index" :class="item.ChildMenus ? 'module' : ''">
                <div :class="'item ' + (parent.menuitemSelected[0] === parent.moduleSelected && parent.menuitemSelected[1] === index ? 'selected ' : '') + (parent.menuitemOpen[0] === parent.moduleSelected && parent.menuitemOpen[1] === index ? (parent.isCollapsed ? '' : 'active') : '')" @click.stop="menuitemSelectedFunc([parent.moduleSelected, index], item.ChildMenus ? 'menus' : '')" :title="parent.isCollapsed ? item.Title : ''">
                    <Icon :class="parent.isCollapsed ? '' : 'ak-icon-left'" :type="item.Address"></Icon>
                    <span :class="'label ' + (parent.menuitemOpen[0] === parent.moduleSelected && parent.menuitemOpen[1] === index ? 'down' : '')">
                        <span>{{item.Title}}</span>
                        <Icon type="ios-arrow-right" v-if="item.ChildMenus"></Icon>
                    </span>
                </div>
                <ul :class="(item.ChildMenus.length === 1 ? 'none ' : '') + (parent.skin === 1 ? 'dark-menus ' : '') + (parent.menuitemOpen[0] === parent.moduleSelected && parent.menuitemOpen[1] === index ? 'open' : (parent.isCollapsed ? 'open' : ''))" :style="{background: !parent.isCollapsed ? '#46515c' : '', boxShadow: !parent.isCollapsed ? 'rgb(32, 39, 48) 0px 0px 16px inset' : 'none', height: parent.menuitemOpen[0] === parent.moduleSelected && parent.menuitemOpen[1] === index && item.ChildMenus ? (item.ChildMenus.length * 40 + 'px') : (parent.isCollapsed ? ((item.ChildMenus.length * 40 + 1) + 'px') : '0px')}">
                    <li v-for="(page, i) in item.ChildMenus" :key="i" class="ak-page">
                        <div :class="'item ' + (parent.menuitemSelected[0] === parent.moduleSelected && parent.menuitemSelected[1] === index && parent.menuitemSelected[2] === i ? 'selected' : '')" @click.stop="menuitemSelectedFunc([parent.moduleSelected, index, i])">
                            <span class="label">{{page.Title}}</span>
                        </div>
                    </li>
                </ul>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'akMenus',
    inject: ['parent'],
    computed: {
        menuitemClass () {
            return [
                this.parent.isCollapsed ? 'collapsed-menu' : ''
            ]
        }
    },
    props: ['menuitemData'],
    methods: {
        // 选择菜单
        menuitemSelectedFunc (selected, type) {
            if (type) {
                if (this.parent.isCollapsed) return
                if (this.parent.menuitemOpen[0] === selected[0] && this.parent.menuitemOpen[1] === selected[1]) {
                    this.parent.menuitemOpen = []
                } else this.parent.menuitemOpen = selected
            } else {
                // 选中菜单
                this.parent.menuitemSelected = selected
                // 页签生成确定浏览
                let screens = [...this.parent.screens]
                // 获得当前选择的页签位置
                const d = this.parent.getLocation(selected.join())
                const sed = [...selected]
                if (d[1] !== -1) {
                    this.parent.screenSelected = d[0]
                    this.$set(this.parent.screenTabSelected[this.parent.moduleSelected], this.parent.screenSelected, sed.join())
                    const wz = sed
                    const page = this.parent.modules[wz[0]].ChildMenus[wz[1]].ChildMenus[wz[2]]
                    const state = this.$store.state
                    const obj = state[page.Name]
                    if (obj && obj.paramCfg) {
                        const refreshFunc = obj.paramCfg.refreshFunc
                        if (refreshFunc) refreshFunc()
                    }
                } else {
                    screens[this.parent.screenSelected][screens[this.parent.screenSelected].length] = sed
                    this.$set(this.parent.screenTabSelected[this.parent.moduleSelected], this.parent.screenSelected, sed.join())
                    this.parent.screens = screens
                }
            }
        }
    }
}
</script>

<style lang="stylus" scoped>
.ak-menus
    position absolute
    left 0
    right 0
    top 48px
    bottom 0
    ul
        user-select none
        list-style-type none
        padding 0
        margin 0
        font-size 14px
        li
            position relative
            .item
                position relative
                cursor pointer
                box-sizing border-box
                color #bbb
                padding 0 12px
                height 40px
                line-height 40px
                border-bottom 1px solid #131313
                box-shadow 0 1px 1px rgba(255, 255, 255, 0.1)
                & > .ivu-icon
                    text-shadow 1px 1px 1px #202730
                    &.ak-icon-left
                        position relative
                        left 2px
                .label
                    display inline-block
                    overflow hidden
                    width 150px
                    text-overflow ellipsis
                    white-space nowrap
                    vertical-align bottom
                    transition width 0.2s ease 0.2s
                    position absolute
                    left 40px
                    span
                        display inline-block
                        width 128px
                    .ivu-icon.ivu-icon-ios-arrow-right
                        font-size 16px
                        position relative
                        top 1px
                        text-shadow 1px 1px 1px #202730
                    &.down
                        .ivu-icon.ivu-icon-ios-arrow-right
                            transform rotate(90deg)
                            transition transform 0.2s ease 0.2s
                &:hover
                    color #fff
                    background #287558
                    border-right 3px solid #1fad66
                &.selected
                    color #fff
                &.active
                    color #fff
                    background #287558
            &.module
                ul
                    height 0
                    overflow hidden
                    &.open
                        transition height 0.2s ease 0.2s
                    li
                        .item
                            &::before
                                content ''
                                width 9px
                                height 9px
                                border-radius 9px
                                background #bbb
                                position absolute
                                top 15px
                                left 16px
                                z-index 5
                                box-shadow 1px 1px 4px #202730
                            &::after
                                content ''
                                width 1px
                                height 100%
                                background #9c9c9c
                                box-shadow 1px 1px 2px #202730
                                position absolute
                                top 0
                                left 20px
                                z-index 4
                            &:hover
                                background #546a82
                                border-right 3px solid #80848f
                                &::before
                                    background #fff
                            &.selected
                                color #32ff98
                                &::before
                                    background #32ff98
                        &:first-child .item::after
                            position absolute
                            top 50%
                            left 20px
                            z-index 4
                        &:last-child .item::after
                            position absolute
                            top -50%
                            left 20px
                            z-index 4
                    &.none
                        &:last-child .item::after
                            height 0
            .ak-page
                .item .label
                    left 40px
        &.collapsed-menu
            li .item
                .ivu-icon
                    font-size 24px
                    position relative
                    top 5px
                    left 3px
                    transition top 0.2s ease
                    &.ivu-icon-mic-a, &.ivu-icon-connection-bars, &.ivu-icon-stats-bars
                        left 5px
                .label
                    width 0px
                    transition width 0.2s ease
                    .ivu-icon.ivu-icon-ios-arrow-right
                        display none
                &.active
                    background transparent
                &:hover
                    color #fff
                    background #287558
                    border-right 3px solid #1fad66
             ul
                z-index: 15;
                position: absolute;
                width: 200px;
                background: #313d4a;
                left: 55px;
                top -1px
                width 0
                box-shadow: 2px 0 4px #131313;
            .module
                &:hover
                    ul
                        display block
                        width 200px
                        box-shadow 2px 0 4px #9c9c9c
                        transition width 0.2s ease, box-shadow 0.2s ease
                        &.dark-menus
                            box-shadow 2px 2px 6px #131313 !important
                        &.open
                            border-top 1px solid #131313
                            border-right 1px solid #131313
                            border-bottom 1px solid #131313
                        .label
                            width 150px
                            transition width 0.2s ease
</style>
