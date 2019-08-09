<template>
    <div class="ak-result">
        <div class="title">{{ isSs ? '申诉状态区' : '结果展示区'}}</div>
        <div class="info">
            <div><span>质检结果</span>: <span class="green">{{{0: '无', 1: '已通过', 2: '不通过'}[isCl ? row.zjispass : dts.crhispass] || ''}}</span></div>
            <div v-if="isSs"><span>申诉人</span>: {{dts.ssr}}({{dts.ssc}})</div>
            <div v-else><span>质检员</span>: {{row.qcjobname || user.userName}}({{row.csrqcjobnum || user.newJobNumber}})</div>
            <div v-if="isSs"><span>申诉时间</span>: {{dts.sst}}</div>
            <div v-else><span>复检员</span>: {{ (row.recheckjobnumber || (isFj ? user.newJobNumber : '')) ? `${row.recheckjobname || (isFj ? user.userName : '')}(${row.recheckjobnumber || (isFj ? user.newJobNumber : '')})` : '无'}}</div>
            <div v-if="isSs"><span>申诉状态</span>: {{row.ssorderstatus === 2 ? '申诉中-客服' : '申诉中-质检员'}}</div>
            <div class="right" v-if="!isSs" @click="ssFunc"><a>查看申诉单</a></div>
            <div class="right" v-if="!isSs" @click="fjFunc"><a>查看复检单</a></div>
        </div>
    </div>
</template>

<script>
export default {
    data () {
        return {
            user: window.user
        }
    },
    props: {
        dts: {
            type: Object,
            default () {
                return {}
            }
        },
        isSs: {
            type: Boolean,
            default: false
        },
        isCl: {
            type: Boolean,
            default: false
        },
        row: {
            type: Object,
            default () {
                return {}
            }
        },
        isFj: {
            type: Boolean,
            default: false
        },
        api: {
            type: Object,
            default () {
                return {}
            }
        },
        utils: {
            type: Object,
            default () {
                return {}
            }
        }
    },
    methods: {
        ssFunc () {
            this.utils.httpMethod(this, {
                isQuery: true,
                apiName: 'searchOrder',
                apiInfo: '查询质检记录',
                data: {
                    crhsrid: this.row.id,
                    crhordertype: 2
                }
            }, d => {
                this.utils.showModal('info', {
                    title: '申诉记录',
                    width: '800',
                    cols: [0, 24],
                    verify_def: {},
                    verify: {},
                    switch: true,
                    data_def: {},
                    data: {},
                    rows: [
                        {
                            type: 'ribbon',
                            render: h => {
                                return h('div', {
                                    style: {
                                        height: '580px',
                                        overflowY: 'scroll',
                                        position: 'relative',
                                        paddingRight: '4px'
                                    }
                                }, d.data.Data.map((_, index) => {
                                    const dtstr = {
                                        1: '未申诉',
                                        2: '申诉中-客服',
                                        3: '已通过-客服',
                                        4: '已驳回-客服',
                                        5: '已取消-客服',
                                        6: '申诉中-质检员',
                                        7: '已通过-质检员',
                                        8: '已驳回-质检员',
                                        9: '已取消-质检员'
                                    }[_.crhorderstatus].split('-')
                                    return h('div', {
                                        style: {
                                            position: 'relative',
                                            border: '1px solid #ddd',
                                            marginTop: index ? '20px' : '5px'
                                        }
                                    }, [
                                        h('div', {
                                            style: {
                                                position: 'absolute',
                                                top: '-9px',
                                                fontSize: '14px',
                                                left: '20px',
                                                background: '#fff',
                                                zIndex: '1',
                                                padding: '0 8px',
                                                color: '#c90',
                                                height: '20px',
                                                lineHeight: '18px'
                                            }
                                        }, `${dtstr[0] !== '申诉中' ? '处理' : '申诉'}记录`),
                                        h('div', {
                                            style: {
                                                marginTop: '8px'
                                            }
                                        }, [
                                            h('span', {
                                                style: {
                                                    marginLeft: '12px'
                                                }
                                            }, `${dtstr[0] !== '申诉中' ? '处理' : '申诉'}人：`),
                                            h('span', `${_.crhcreatorname}(${_.crhcreatorjobnumber})`),
                                            h('span', {
                                                style: {
                                                    marginLeft: '24px'
                                                }
                                            }, `${dtstr[0] !== '申诉中' ? '处理' : '申诉'}类型：`),
                                            h('span', {
                                                props: {
                                                    span: 3
                                                }
                                            }, dtstr[1] + '申诉'),
                                            h('span', {
                                                style: {
                                                    marginLeft: '24px'
                                                }
                                            }, `${dtstr[0] !== '申诉中' ? '处理' : '申诉'}时间：`),
                                            h('span', _.crhcreatetime.replace(/\.0$/, '')),
                                            h('span', {
                                                style: {
                                                    marginLeft: '24px'
                                                }
                                            }, `${dtstr[0] !== '申诉中' ? '处理' : '申诉'}状态：`),
                                            h('span', {
                                                1: '未申诉',
                                                2: '申诉中-客服',
                                                3: '已通过-客服',
                                                4: '已驳回-客服',
                                                5: '已取消-客服',
                                                6: '申诉中-质检员',
                                                7: '已通过-质检员',
                                                8: '已驳回-质检员',
                                                9: '已取消-质检员'
                                            }[_.crhorderstatus]),
                                            h('a', {
                                                style: {
                                                    float: 'right',
                                                    marginRight: '12px'
                                                },
                                                on: {
                                                    click: () => {
                                                        this.utils.showModal('info', {
                                                            title: '下载附件',
                                                            cols: [0, 24],
                                                            width: '320px',
                                                            verify_def: {},
                                                            verify: {},
                                                            data_def: {},
                                                            data: {},
                                                            okText: '关闭',
                                                            rows: [
                                                                {
                                                                    type: 'ribbon',
                                                                    render: h => {
                                                                        return h('div', _.filelist.map((r, index) => {
                                                                            return h('div', [
                                                                                h('a', {
                                                                                    attrs: {
                                                                                        download: true,
                                                                                        href: r.lfiurl,
                                                                                        key: index
                                                                                    }
                                                                                }, r.lfifilename)
                                                                            ])
                                                                        }))
                                                                    }
                                                                }
                                                            ]
                                                        }, () => {})
                                                    }
                                                }
                                            }, '下载附件')
                                        ]),
                                        h('Table', {
                                            class: 'borderHide',
                                            style: {
                                                borderLeft: 0,
                                                borderRight: 0,
                                                borderBottom: 0
                                            },
                                            props: {
                                                size: 'small',
                                                stripe: true,
                                                border: true,
                                                columns: [
                                                    {
                                                        title: '序号',
                                                        align: 'center',
                                                        width: 60,
                                                        render: (h, params) => {
                                                            return h('span', params.index + 1)
                                                        },
                                                        fixed: 'left'
                                                    },
                                                    {
                                                        title: '错误分类',
                                                        key: 'mistake',
                                                        width: 100
                                                    },
                                                    {
                                                        title: '考核项',
                                                        width: 100,
                                                        key: 'pcconfigname'
                                                    },
                                                    {
                                                        title: '判定',
                                                        width: 80,
                                                        render: (h, params) => {
                                                            return h('span', {
                                                                1: '合格',
                                                                2: '不合格',
                                                                3: '不涉及'
                                                            }[params.row.rbscheckresult])
                                                        }
                                                    },
                                                    {
                                                        title: '备注',
                                                        width: 150,
                                                        key: 'rbsremark'
                                                    },
                                                    {
                                                        title: '考核标准',
                                                        key: 'pcexplain',
                                                        minWidth: 180
                                                    }
                                                ],
                                                data: (_.strandlist || []).filter(_ => _.rbsisappeal),
                                                height: 184
                                            }
                                        })
                                    ])
                                }))
                            }
                        }
                    ],
                    okText: '关闭'
                }, cancel => {
                    if (cancel) cancel()
                })
            })
        },
        fjFunc () {
            this.utils.httpMethod(this, {
                isQuery: true,
                apiName: 'searchOrder',
                apiInfo: '查询复检记录',
                data: {
                    crhsrid: this.row.id,
                    crhordertype: 3
                }
            }, d => {
                this.utils.showModal('info', {
                    title: '复检记录',
                    width: '800',
                    cols: [0, 24],
                    verify_def: {},
                    verify: {},
                    switch: true,
                    data_def: {},
                    data: {},
                    rows: [
                        {
                            type: 'ribbon',
                            render: h => {
                                return h('div', {
                                    style: {
                                        height: '580px',
                                        overflowY: 'scroll',
                                        position: 'relative',
                                        paddingRight: '4px'
                                    }
                                }, d.data.Data.map((_, index) => {
                                    return h('div', {
                                        style: {
                                            position: 'relative',
                                            border: '1px solid #ddd',
                                            marginTop: index ? '20px' : '5px'
                                        }
                                    }, [
                                        h('div', {
                                            style: {
                                                position: 'absolute',
                                                top: '-9px',
                                                fontSize: '14px',
                                                left: '20px',
                                                background: '#fff',
                                                zIndex: '1',
                                                padding: '0 8px',
                                                color: '#c90',
                                                height: '20px',
                                                lineHeight: '18px'
                                            }
                                        }, `复检记录`),
                                        h('div', {
                                            style: {
                                                marginTop: '8px',
                                                position: 'relative',
                                                top: '4px'
                                            }
                                        }, [
                                            h('span', {
                                                style: {
                                                    marginLeft: '12px'
                                                }
                                            }, `复检人：`),
                                            h('span', `${_.crhcreatorname}(${_.crhcreatorjobnumber})`),
                                            h('span', {
                                                style: {
                                                    marginLeft: '24px'
                                                }
                                            }, `复检时间：`),
                                            h('span', _.crhcreatetime.replace(/\.0$/, ''))
                                        ]),
                                        h('div', [
                                            h('span', {
                                                style: {
                                                    marginLeft: '12px'
                                                }
                                            }, `复检结果：`),
                                            h('span', {
                                                style: {
                                                    color: _.crhispass === 1 ? '#19be6b' : '#ed4014'
                                                }
                                            }, _.crhispass === 1 ? '通过' : '不通过')
                                        ]),
                                        h('Table', {
                                            class: 'borderHide',
                                            style: {
                                                borderLeft: 0,
                                                borderRight: 0,
                                                borderBottom: 0
                                            },
                                            props: {
                                                size: 'small',
                                                stripe: true,
                                                border: true,
                                                columns: [
                                                    {
                                                        title: '序号',
                                                        align: 'center',
                                                        width: 60,
                                                        render: (h, params) => {
                                                            return h('span', params.index + 1)
                                                        },
                                                        fixed: 'left'
                                                    },
                                                    {
                                                        title: '错误分类',
                                                        key: 'mistake',
                                                        width: 100
                                                    },
                                                    {
                                                        title: '考核项',
                                                        width: 100,
                                                        key: 'pcconfigname'
                                                    },
                                                    {
                                                        title: '判定',
                                                        width: 80,
                                                        render: (h, params) => {
                                                            return h('span', {
                                                                1: '合格',
                                                                2: '不合格',
                                                                3: '不涉及'
                                                            }[params.row.rbscheckresult])
                                                        }
                                                    },
                                                    {
                                                        title: '备注',
                                                        width: 150,
                                                        key: 'rbsremark'
                                                    },
                                                    {
                                                        title: '考核标准',
                                                        key: 'pcexplain',
                                                        minWidth: 180
                                                    }
                                                ],
                                                data: (_.strandlist || []).filter(_ => _.rbsisreview),
                                                height: 136
                                            }
                                        })
                                    ])
                                }))
                            }
                        }
                    ],
                    okText: '关闭'
                }, cancel => {
                    if (cancel) cancel()
                })
            })
        }
    }
}
</script>

<style lang="stylus">
.ak-result
    position relative
    height 48px
    border 1px solid #ddd
    margin-top 10px
    .title
        position: absolute;
        top: -9px;
        font-size: 14px;
        left: 20px;
        background: #fff;
        z-index: 1;
        padding: 0 8px;
        color #c90
        height: 20px;
        line-height: 18px;
    .info
        position absolute
        left 0
        right 0
        top 0
        bottom 0
        padding 0 2px
        line-height 52px
        .right
            float right
            padding 0 10px
        div
            display inline-block
            padding 0 8px
            float: left;
            span
                font-weight bold
                margin-right 3px
                &.green
                    color #009900
</style>
