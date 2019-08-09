<template>
    <div ref="xMind" class="ak-xMind" @mousemove.stop.prevent="mousemove" @mouseup.stop.prevent="mouseup" @click="click" @contextmenu.stop.prevent="contextmenu">
        <!-- 脑图块 -->
        <div class="ak-xMind-container" :style="{marginTop: `${-y}px`, marginLeft: `${-x}px`}">
            <div class="ak-xMind-theme" isupd="true" type="1" :vdnvalue="dts.length ? dts[0].isVdn : ''" :addvdn="!!dts.length" @mousedown.stop.prevent="mousedown" style="padding: 6px 8px 5px">{{titleText}}</div>
            <div class="ak-xMind-childs" v-if="dts.length">
                <Child v-for="(dt, index) in dts" :key="index" :data-correlation="dts.correlation" :data-dt="dt" :data-margin="dts.length" :data-index="index" data-keys="" @down="mousedown" @verify="verify"></Child>
            </div>
        </div>
        <!-- 右键菜单 -->
        <ul class="ak-xMind-menus" :style="{left: `${l}px`, top: `${t}px`}" v-if="isEnabled && ((isVdn && vdnvalue) || (isVdn && addvdn) || (isupd && isVdn) || isupd || isdel)">
            <li @click="add('')" v-if="isVdn && vdnvalue">添加(A)<span>Ctrl+Shift+A</span></li>
            <li @click="add('vdn')" v-if="isVdn && addvdn">添加渠道(V)<span>Ctrl+Shift+V</span></li>
            <div class="hr" v-if="isupd && isVdn"></div>
            <li @click="upd" v-if="isupd">编辑(E)...<span>Ctrl+E</span></li>
            <li @click="del" v-if="isdel">删除(D)...<span>Ctrl+D</span></li>
        </ul>
    </div>
</template>

<script>
import Child from './child'
export default {
    data () {
        return {
            x: 0,
            y: 0,
            x1: 0,
            x2: 0,
            y1: 0,
            y2: 0,
            l: -9999,
            t: -9999,
            mv: false,
            isdel: false,
            isupd: true,
            isVdn: true,
            value: '',
            addvdn: true,
            vdnvalue: true,
            validatekey: '',
            keys: ''
        }
    },
    props: {
        titleText: {
            type: String,
            default: '主题'
        },
        dts: {
            type: Array,
            default () {
                return []
            }
        },
        isEnabled: {
            type: Boolean,
            default: true
        }
    },
    components: {
        Child
    },
    methods: {
        click () {
            this.l = -9999
            this.t = -9999
        },
        add (type) {
            this.$emit('on-add', this.value, type, this.dts.filter(_ => _.id !== (this.value || '').split('_')[0]), '0123456789'.split('').filter(_ => this.validatekey.split('').indexOf(_) === -1))
        },
        upd () {
            this.$emit('on-upd', this.value, this.dts.filter(_ => _.id !== (this.value || '').split('_')[0]), '0123456789'.split('').filter(_ => this.keys.split('').indexOf(_) === -1))
        },
        del () {
            this.$emit('on-del', this.value)
        },
        verify (msg) {
            this.$emit('on-verify', msg)
        },
        mousedown (e) {
            this.x1 = e.x
            this.y1 = e.y
            this.x2 = this.x
            this.y2 = this.y
            this.mv = true
            this.click()
        },
        mousemove (e) {
            if (e.which === 1 && this.mv) {
                this.x = this.x2 - (e.x - this.x1)
                this.y = this.y2 - (e.y - this.y1)
            }
        },
        mouseup () {
            this.mv = false
        },
        contextmenu (e) {
            this.isdel = false
            this.isupd = true
            this.isVdn = true
            this.addvdn = true
            this.vdnvalue = true
            this.value = ''
            this.validatekey = ''
            this.keys = ''
            if (e.target.className.indexOf('ak-xMind-theme') !== -1 || e.target.parentNode.className.indexOf('ak-xMind-theme') !== -1) {
                const xMind = this.$refs.xMind.getBoundingClientRect()
                this.l = e.x - xMind.left
                this.t = e.y - xMind.top
                const targetDom = e.target.className.indexOf('ak-xMind-theme') !== -1 ? e.target : e.target.parentNode
                if (targetDom.getAttribute('isdel')) {
                    this.isdel = true
                }
                if (targetDom.getAttribute('isVdn')) {
                    this.isVdn = false
                }
                if (targetDom.getAttribute('isupd')) {
                    this.isupd = false
                }
                if (targetDom.getAttribute('type') !== '1') {
                    this.isVdn = false
                }
                if (targetDom.getAttribute('addvdn') === 'true') {
                    this.addvdn = false
                }
                if (targetDom.getAttribute('vdnvalue')) {
                    this.vdnvalue = false
                }
                if (targetDom.getAttribute('validatekey')) {
                    this.validatekey = targetDom.getAttribute('validatekey')
                }
                if (targetDom.getAttribute('keys')) {
                    this.keys = targetDom.getAttribute('keys')
                }
                this.value = targetDom.getAttribute('value')
            } else {
                this.click()
            }
        }
    }
}
</script>

<style lang="stylus">
.ak-xMind
    position: absolute;
    top: 1px;
    bottom: 0;
    left: 0;
    right: 0;
    border: 1px solid #e6e6e6;
    box-sizing: border-box;
    background: url(http://127.0.0.1:8080/ide/imgs/lucency.png);
    overflow hidden
    .ak-xMind-menus
        position relative
        background #ffffff
        width 252px
        border 1px solid #bababa
        box-sizing: border-box;
        list-style-type none
        padding 4px 0
        color #000
        .hr
            height: 1px;
            background: #e9e9e9;
            border: 4px solid #fff;
            border-left-width 2px
            border-right-width 2px
            box-sizing: content-box;
        li
            padding 3px 26px 3px
            font-size 12px
            cursor default
            span
                float right
                color #777
            &:hover
                background #ebebeb
                span
                    color #000
        &:before
            position: absolute;
            content: "";
            background: rgba(0,0,0,.24);
            width: 3px;
            right -3px
            top 6px
            bottom -3px
            z-index 1
            box-sizing: border-box;
        &:after
            position: absolute;
            content: "";
            background: rgba(0,0,0,.24);
            height: 3px;
            left 6px
            right 0
            bottom -3px
            z-index 1
    .ak-xMind-container
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        cursor pointer
        user-select none
        display: flex;
        justify-content: flex-start;
        align-items: center;
        .ak-xMind-theme
            display: inline-block;
            border 1px solid #495060
            box-sizing: border-box;
            padding 3px 8px 2px
            font-size 28px
            background #fff
            color #495060
            box-shadow 0 0 6px #808695
            white-space nowrap
            .ivu-icon
                position: absolute;
                line-height: 1.2;
            pre
                margin: 0;
                line-height: 1.3;
            &.error
                border-color #ed3f14 !important
                color #ed3f14 !important
        .ak-xMind-childs
            position relative
            padding-left 80px
            &:before
                position: absolute;
                content: "";
                background: #fff;
                height: 3px;
                width: 40px;
                border-top 1px solid #b6b9c0;
                border-bottom 1px solid #b6b9c0;
                left 0
                top 50%
                margin-top -1px
                z-index 1
            .ak-xMind-child
                position relative
                display: flex;
                font-size: 0
                justify-content: flex-start;
                align-items: center;
                .ak-ext
                    position absolute
                    background #fff
                    height 2px
                    left 0
                    top 16px
                    border: 1px solid rgba(237, 63, 20, .5);
                &:before
                    content: "";
                    background: #fff;
                    border-top: 1px solid #b6b9c0;
                    border-bottom: 1px solid #b6b9c0;
                    border-left: 1px solid #b6b9c0;
                    box-sizing: border-box;
                    height: 3px;
                    width: 40px;
                    display: block;
                    position: absolute;
                    margin-top: -1px;
                    top: 50%;
                    left: -40px;
                    z-index: 1;
                &.ak-xMind-top:after
                    position: absolute;
                    content: "";
                    border-left 1px solid #b6b9c0;
                    border-right 1px solid #b6b9c0;
                    background: #fff;
                    width: 3px;
                    top 50%
                    bottom 0
                    left -40px
                    z-index 0
                &.ak-xMind-middle:after
                    position: absolute;
                    content: "";
                    border-left 1px solid #b6b9c0;
                    border-right 1px solid #b6b9c0;
                    background: #fff;
                    width: 3px;
                    top 0
                    bottom 0
                    left -40px
                    z-index 0
                &.ak-xMind-bottom:after
                    position: absolute;
                    content: "";
                    border-left 1px solid #b6b9c0;
                    border-right 1px solid #b6b9c0;
                    background: #fff;
                    width: 3px;
                    top 0
                    bottom 50%
                    left -40px
                    z-index 0
</style>
