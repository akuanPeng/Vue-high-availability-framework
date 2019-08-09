<template>
    <ul class="ak-modules">
        <li v-for="(mod, index) in modulesData" :class="index === parent.moduleSelected ? 'active' : ''" :key="index" @click.stop="moduleSelectedFunc(index, $event)">
            <Icon :type="mod.Address"></Icon>
            <span v-show="tabLen(index)">{{tabLen(index)}}</span>
            <div>{{mod.Title}}</div>
        </li>
    </ul>
</template>

<script>
export default {
    name: 'akModules',
    inject: ['parent'],
    props: ['modulesData'],
    methods: {
        tabLen (index) {
            return this.parent.screens.map(a => a.filter(a => a[0] === index).length).reduce((prev, curr) => (prev + curr))
        },
        moduleSelectedFunc (index, e) {
            if (this.parent.moduleSelected === index) return
            this.parent.isScreenShow = false
            this.parent.moduleSelected = index
            if (index !== 0) {
                // 计算出第一个模块页面
                const sTS = this.parent.screenTabSelected[index]
                let sBL = ''
                for (let i = 0; i < sTS.length; i++) {
                    if (sTS[i] !== -1 && sTS[i] !== '') {
                        sBL = sTS[i]
                    }
                }
                if (sBL) {
                    this.parent.menuitemSelected = sBL.split(',').map(_ => parseInt(_))
                    this.parent.menuitemOpen = [this.parent.menuitemSelected[0], this.parent.menuitemSelected[1]]
                } else {
                    this.parent.menuitemOpen = [index, 0]
                    this.parent.menuitemSelected = [index, 0, 0]
                    this.parent.screenTabSelected[index][0] = `${index},0,0`
                    if (this.parent.screens[0]) {
                        this.parent.screens[0].push([index, 0, 0])
                    } else {
                        this.parent.screens[0] = [
                            [index, 0, 0]
                        ]
                    }
                }
            }
            const $icon = e.target.tagName === 'LI' ? e.target.children[0] : (e.target.tagName === 'DIV' ? e.target.parentNode.children[0] : e.target)
            const cls = $icon.getAttribute('class')
            $icon.className = 'ivu-icon ivu-icon-load-a spin-icon-load-a'
            this.$nextTick(_ => {
                this.$nextTick(_ => {
                    this.parent.isScreenShow = true
                    setTimeout(() => {
                        $icon.setAttribute('class', cls)
                    })
                })
            })
        }
    }
}
</script>

<style lang="stylus" scoped>
.ak-modules
    position absolute
    padding 0
    margin 0
    user-select none
    list-style-type none
    top 0
    left 60px
    li
        position relative
        float left
        width 78px
        text-align center
        font-size 12px
        cursor pointer
        border-right 1px solid #f5f7f9
        .ivu-icon
            font-size 18px
            position relative
            top -6px
        div
            position absolute
            display inline-block
            left 0
            bottom 3px
            height 24px
            line-height 28px
            right 0
        span
            position: absolute;
            transform: scale(.75);
            top: -7px;
            margin-left: 4px;
            font-style: italic;
            text-decoration: underline;
        &.active
            color #19be6b
            transition color 0.5s ease
        &:hover
            color #fff
            background #313d4a
            transition background 0.5s ease, color 0.5s ease, border-color 0.5s ease
            box-shadow 0px 2px 4px #9c9c9c
            border-color #313d4a
            &.active
                color #32ff98
        &:last-child
            border-right 0
</style>
