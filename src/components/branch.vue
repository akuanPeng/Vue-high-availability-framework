<template>
    <div class="ak-branch">
        <div class="ak-item n">{{data.province}} - {{data.address}} - <span>{{data.provider}}</span></div>
        <div :class="`ak-line s1 ${data.types.length > 1 ? '' : 'n'}`"></div>
        <div :class="`ak-holder ${data.types.length > 1 ? '' : 'n1'} x`">
            <div v-for="(t, index) in data.types" :key="index" :class="`ak-half ${t.class} x`">
                <div class="ak-item">{{t.label}}</div>
                <div :class="`ak-line s2 ${t.list.length > 1 ? '' : 'n'}`"></div>
                <div :class="`ak-holder ${t.list.length > 1 ? '' : 'n'}`">
                    <div v-for="(l, i) in t.list" :key="i" :class="`ak-half ${l.class}`">
                        <div class="ak-item">{{l.type}} • {{l.label}}：
                            <span>{{l.price}}</span> {{l.unit}}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data () {
        return {
        }
    },
    props: ['data']
}
</script>

<style lang="stylus" scoped>
.ak-branch
    padding 38px 0 40px
    position relative
    display table
    color #9c9c9c
    .ak-item
        display table-cell
        vertical-align middle
        padding 0 18px 0 8px
        height 18px
        position relative
        top -2px
        span
            color #ed3f14
            font-weight bold
        &.n
            top 2px
            span
                color #5cadff
    .ak-line
        display inline-block
        width 1px
        background #ddd
        position relative
        bottom 0px
        &.s1
            height 76px
        &.s2
            height 38px
            bottom 0px
        &.n
            width 0
    .ak-holder
        position relative
        display inline-block
        &:before
            content '一'
            position absolute
            top 50%
            margin-top -10px
            left -13px
            color #ddd
        &.x:before
            margin-top -4px
        &.n:before
            top 0
            margin-top -11px
        &.n1:before
            top 0
            margin-top 1px
    .ak-half
        position relative
        height 18px
        display table
        &.top
            top -9px
        &.bottom
            bottom -11px
            &.x
                bottom -24px
        &.middle
            top -9px
        &:before
            content '一'
            display table-cell
            vertical-align middle
            left -1px
            position relative
            top -2px
            color #ddd
</style>
