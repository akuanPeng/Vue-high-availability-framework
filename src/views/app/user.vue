<template>
    <div class="ak-user">
        <Icon type="person"></Icon>
        <span class="title">欢迎您，
            <span>{{parent.user.userName}}</span>
        </span>
        <div class="ak-btn-group">
            <div class="opts">
                <div class="item" @click.stop="helpFunc">
                    <Icon type="help"></Icon>
                    <div>帮助</div>
                </div>
                <div class="item" @click.stop="settingsFunc">
                    <Icon type="settings"></Icon>
                    <div>设置</div>
                </div>
                <div class="item" @click.stop="exitFunc">
                    <Icon type="forward"></Icon>
                    <div>退出</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import utils from '../../utils'
export default {
    name: 'akUser',
    data () {
        return {
            verify: {
                uimobile: ''
            },
            user: {
                id: 0,
                uiname: '',
                uinewjobnumber: '',
                uiemail: '',
                uimobile: ''
            }
        }
    },
    inject: ['parent', 'api'],
    props: ['userData'],
    methods: {
        exitFunc () {
            window.location.href = '/Manage/Home/LogOut'
        },
        helpFunc () {
            this.parent.help = true
        },
        userFunc () {
            // 获取信息
            this.api.getUserInfoTimely().then(d => {
                if (d.data.IsSuccess) {
                    // 弹出添加
                    utils.showModal('confirm', {
                        title: '用户信息',
                        width: '340px',
                        cols: [5, 17],
                        verify_def: {
                            uimobile: ''
                        },
                        verify: this.verify,
                        switch: true,
                        okText: '保存',
                        data_def: {
                            id: d.data.Data.id,
                            uiname: d.data.Data.uiname,
                            uinewjobnumber: d.data.Data.uinewjobnumber,
                            uiemail: d.data.Data.uiemail,
                            uimobile: d.data.Data.uimobile
                        },
                        data: this.user,
                        rows: [
                            {
                                label: '姓名',
                                key: 'uiname',
                                type: 'text',
                                disabled: true
                            },
                            {
                                label: '工号',
                                key: 'uinewjobnumber',
                                type: 'text',
                                disabled: true
                            },
                            {
                                label: '邮箱',
                                key: 'uiemail',
                                type: 'text',
                                disabled: true
                            },
                            {
                                required: true,
                                label: '电话',
                                key: 'uimobile',
                                type: 'text',
                                verify: [/^.+$/, '电话 - 必填']
                            }
                        ]
                    }, cancel => {
                        utils.httpMethod(this, {
                            apiName: 'editUserInfo',
                            apiInfo: '更新用户信息',
                            data: { ...this.user }
                        }, (d, callback) => {
                            if (cancel) cancel()
                            callback()
                        })
                    })
                } else {
                    this.$Notice.error(this.eF('获取信息', d.data.Info, true))
                }
            })
        },
        settingsFunc () {
            // 配置界面
            this.$Modal.confirm({
                title: '系统配置',
                render: h => {
                    return h('div', { class: 'ak-form' }, [
                            h('div', {
                                class: 'item',
                                style: { paddingLeft: '70px' }
                            }, [
                                h('div', {
                                    class: 'ak-append',
                                    style: { width: '70px' }
                                }, '分屏'),
                                h('Select', {
                                    props: {
                                        value: this.$store.state.screen
                                    },
                                    on: {
                                        'on-change': v => (this.$store.state.screen = v)
                                    }
                                }, [1, 2, 3, 4].map(value => h('Option', {
                                    props: { value }
                                }, '系统 - 分 ' + value + ' 屏')))
                            ]),
                            h('div', {
                                class: 'item',
                                style: { paddingLeft: '70px' }
                            }, [
                                h('div', {
                                    class: 'ak-append',
                                    style: { width: '70px' }
                                }, '主题'),
                                h('Select', {
                                    props: {
                                        value: this.$store.state.skin
                                    },
                                    on: {
                                        'on-change': v => {
                                            this.parent.skin = v
                                            this.$store.state.skin = v
                                        }
                                    }
                                }, [
                                    h('Option', {
                                        props: {
                                            value: 0
                                        }
                                    }, '默认'),
                                    h('Option', {
                                        props: {
                                            value: 1
                                        }
                                    }, '黑色')
                                ])
                            ]),
                            h('div', {
                                class: 'item',
                                style: { paddingLeft: '70px' }
                            }, [
                                h('div', {
                                    class: 'ak-append',
                                    style: { width: '70px' }
                                }, '菜单'),
                                h('Select', {
                                    props: {
                                        value: this.$store.state.menuValue
                                    },
                                    on: {
                                        'on-change': v => (this.$store.state.menuValue = v)
                                    }
                                }, [
                                    h('Option', {
                                        props: {
                                            value: 0
                                        }
                                    }, '自适应'),
                                    h('Option', {
                                        props: {
                                            value: 1
                                        }
                                    }, '显示为 - 非闭合菜单'),
                                    h('Option', {
                                        props: {
                                            value: 2
                                        }
                                    }, '显示为 - 闭合小菜单')
                                ])
                            ])
                        ])
                },
                onOk: () => {
                    const count = this.$store.state.screen
                    let screens = [...this.parent.screens]
                    let screenTabSelected = [...this.parent.screenTabSelected]
                    let screenSelected = this.parent.screenSelected
                    if (screens.length === 1) {
                        switch (count) {
                            case 2:
                                screens[screens.length] = []
                                break
                            case 3:
                                screens[screens.length] = []
                                screens[screens.length] = []
                                break
                            case 4:
                                screens[screens.length] = []
                                screens[screens.length] = []
                                screens[screens.length] = []
                                break
                        }
                    } else if (screens.length === 2) {
                        switch (count) {
                            case 1:
                                screens = [
                                    [...screens[0], ...screens[1]]
                                ]
                                if (screenTabSelected[this.parent.moduleSelected][0]) {
                                    screenTabSelected[this.parent.moduleSelected][1] = ''
                                } else {
                                    if (screenTabSelected[this.parent.moduleSelected][1]) {
                                        screenTabSelected[this.parent.moduleSelected][0] = screenTabSelected[this.parent.moduleSelected][1]
                                        screenTabSelected[this.parent.moduleSelected][1] = ''
                                    }
                                }
                                screenSelected = 0
                                break
                            case 3:
                                screens[screens.length] = []
                                break
                            case 4:
                                screens[screens.length] = []
                                screens[screens.length] = []
                                break
                        }
                    } else if (screens.length === 3) {
                        switch (count) {
                            case 1:
                                screens = [
                                    [...screens[0], ...screens[1], ...screens[2]]
                                ]
                                if (screenTabSelected[this.parent.moduleSelected][0]) {
                                    screenTabSelected[this.parent.moduleSelected][1] = ''
                                    screenTabSelected[this.parent.moduleSelected][2] = ''
                                } else {
                                    if (screenTabSelected[this.parent.moduleSelected][1]) {
                                        screenTabSelected[this.parent.moduleSelected][0] = screenTabSelected[this.parent.moduleSelected][1]
                                        screenTabSelected[this.parent.moduleSelected][1] = ''
                                        screenTabSelected[this.parent.moduleSelected][2] = ''
                                    } else {
                                        if (screenTabSelected[this.parent.moduleSelected][2]) {
                                            screenTabSelected[this.parent.moduleSelected][0] = screenTabSelected[this.parent.moduleSelected][2]
                                            screenTabSelected[this.parent.moduleSelected][1] = ''
                                            screenTabSelected[this.parent.moduleSelected][2] = ''
                                        }
                                    }
                                }
                                screenSelected = 0
                                break
                            case 2:
                                screens = [
                                    [...screens[0]],
                                    [...screens[1], ...screens[2]]
                                ]
                                if (screenTabSelected[this.parent.moduleSelected][1]) {
                                    screenTabSelected[this.parent.moduleSelected][2] = ''
                                } else {
                                    if (screenTabSelected[this.parent.moduleSelected][2]) {
                                        screenTabSelected[this.parent.moduleSelected][1] = screenTabSelected[this.parent.moduleSelected][2]
                                        screenTabSelected[this.parent.moduleSelected][2] = ''
                                    }
                                }
                                screenSelected = screenSelected === 0 ? screenSelected : 1
                                break
                            case 4:
                                screens[screens.length] = []
                                break
                        }
                    } else if (screens.length === 4) {
                        switch (count) {
                            case 1:
                                screens = [
                                    [...screens[0], ...screens[1], ...screens[2], ...screens[3]]
                                ]
                                if (screenTabSelected[this.parent.moduleSelected][0]) {
                                    screenTabSelected[this.parent.moduleSelected][1] = ''
                                    screenTabSelected[this.parent.moduleSelected][2] = ''
                                    screenTabSelected[this.parent.moduleSelected][3] = ''
                                } else {
                                    if (screenTabSelected[this.parent.moduleSelected][1]) {
                                        screenTabSelected[this.parent.moduleSelected][0] = screenTabSelected[this.parent.moduleSelected][1]
                                        screenTabSelected[this.parent.moduleSelected][1] = ''
                                        screenTabSelected[this.parent.moduleSelected][2] = ''
                                        screenTabSelected[this.parent.moduleSelected][3] = ''
                                    } else {
                                        if (screenTabSelected[this.parent.moduleSelected][2]) {
                                            screenTabSelected[this.parent.moduleSelected][0] = screenTabSelected[this.parent.moduleSelected][2]
                                            screenTabSelected[this.parent.moduleSelected][1] = ''
                                            screenTabSelected[this.parent.moduleSelected][2] = ''
                                            screenTabSelected[this.parent.moduleSelected][3] = ''
                                        } else {
                                            if (screenTabSelected[this.parent.moduleSelected][3]) {
                                                screenTabSelected[this.parent.moduleSelected][0] = screenTabSelected[this.parent.moduleSelected][3]
                                                screenTabSelected[this.parent.moduleSelected][1] = ''
                                                screenTabSelected[this.parent.moduleSelected][2] = ''
                                                screenTabSelected[this.parent.moduleSelected][3] = ''
                                            }
                                        }
                                    }
                                }
                                screenSelected = 0
                                break
                            case 2:
                                screens = [
                                    [...screens[0]],
                                    [...screens[1], ...screens[2], ...screens[3]]
                                ]
                                if (screenTabSelected[this.parent.moduleSelected][1]) {
                                    screenTabSelected[this.parent.moduleSelected][2] = ''
                                    screenTabSelected[this.parent.moduleSelected][3] = ''
                                } else {
                                    if (screenTabSelected[this.parent.moduleSelected][2]) {
                                        screenTabSelected[this.parent.moduleSelected][1] = screenTabSelected[this.parent.moduleSelected][2]
                                        screenTabSelected[this.parent.moduleSelected][2] = ''
                                        screenTabSelected[this.parent.moduleSelected][3] = ''
                                    } else {
                                        if (screenTabSelected[this.parent.moduleSelected][3]) {
                                            screenTabSelected[this.parent.moduleSelected][1] = screenTabSelected[this.parent.moduleSelected][3]
                                            screenTabSelected[this.parent.moduleSelected][2] = ''
                                            screenTabSelected[this.parent.moduleSelected][3] = ''
                                        }
                                    }
                                }
                                screenSelected = screenSelected === 0 ? screenSelected : 1
                                break
                            case 3:
                                screens = [
                                    [...screens[0]],
                                    [...screens[1]],
                                    [...screens[2], ...screens[3]]
                                ]
                                if (screenTabSelected[this.parent.moduleSelected][2]) {
                                    screenTabSelected[this.parent.moduleSelected][3] = ''
                                } else {
                                    if (screenTabSelected[this.parent.moduleSelected][3]) {
                                        screenTabSelected[this.parent.moduleSelected][2] = screenTabSelected[this.parent.moduleSelected][3]
                                        screenTabSelected[this.parent.moduleSelected][3] = ''
                                    }
                                }
                                screenSelected = screenSelected === 0 || screenSelected === 1 ? screenSelected : 2
                                break
                        }
                    }
                    this.parent.screenSelected = screenSelected
                    this.$set(this.parent, 'screens', screens)
                    this.$set(this.parent, 'screenTabSelected', screenTabSelected)
                    localStorage.screen = screens.length
                    localStorage.menuValue = this.$store.state.menuValue
                    localStorage.skin = this.$store.state.skin
                    this.parent.skin = this.$store.state.skin
                    this.parent.isCollapsed = {
                        0: document.documentElement.clientWidth <= 1366,
                        1: false,
                        2: true
                    }[this.$store.state.menuValue]
                }
            })
        }
    }
}
</script>

<style lang="stylus" scoped>
.ak-user
    position absolute
    top 0
    right 0
    height 48px
    line-height 48px
    width 168px
    background #202730
    padding 0 8px 0 16px
    color #fff
    border-right 1px solid #202730
    border-left 1px solid #202730
    user-select none
    cursor pointer
    font-size 15px
    box-shadow 0px 2px 4px #9c9c9c
    .ivu-icon
        font-size 17px
        position relative
        top 1px
    .title
        margin-left 8px
        font-size 14px
        span
            color #fff
    .ak-btn-group
        display none
        position absolute
        left 0
        right 0
        top 10px
        height 26px
        font-size 12px
        letter-spacing 1px
        padding-left 4px
        .opts
            height 100%
            width 193px
            padding-top 2px
            .item
                width 54px
                height 100%
                float left
                text-align center
                box-sizing border-box
                border-right 1px solid #546a82
                transition border-right 1s ease
                line-height 20px
                color #fff
                div, .ivu-icon
                    position relative
                    top 0
                &:hover
                    color #32ff98
                    transition opacity 0.5s ease
                    div, .ivu-icon
                        text-shadow 1px 1px 1px #313d4a
    &:hover
        background #313d4a
        padding 0 8px 0 8px
        border-right 6px solid #313d4a
        transition background 0.5s ease, padding 0.5s ease
        .ivu-icon.ivu-icon-person, span
            display none
        .ak-btn-group
            display inline-block
            .item
                .ivu-icon-person
                    display inline-block
                div, .ivu-icon
                    top -4px
                    line-height 14px
                &:last-child
                    border-right none
.dark .ak-user
    border-color #131313
    border-left 1px solid #424d59
    height 47px
    background #252b34 !important
    box-shadow 0 0 6px #000 inset !important
</style>
