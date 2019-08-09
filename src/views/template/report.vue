<template>
    <div class="ak-report">
        <akReport name="report" :is-collapsed="isCollapsed" :param-cfg="paramCfg" :tabs-cfg="tabsCfg" :screen-width="screenWidth" :screen-height="screenHeight" :screen-count="screenCount"></akReport>
    </div>
</template>

<script>
export default {
    data () {
        const fields = this.$store.state.fields.report
        return {
            fields,
            stime: 0,
            paramCfg: {
                stime: 0,
                departIdList: [],
                cacheEmpty: () => {
                    this.$destroy()
                }
            },
            tabsCfg: {
                active: 0,
                dts: [
                    [
                        {
                            dataType: 1,
                            departName: 'xxx',
                            callDate: '2018-02-03'
                        }
                    ]
                ],
                dynamics: [
                    []
                ],
                where: [
                    {
                        departIdList: [],
                        current: 1,
                        size: 20
                    }
                ],
                data: [
                    {
                        title: '',
                        isPagging: false,
                        controls: [
                            {
                                title: '部门',
                                key: 'departIdList',
                                type: 'akSelectTree',
                                id: 'depId',
                                name: 'depName',
                                children: 'subDepList',
                                width: '380px',
                                placeholder: '部门 - 多选',
                                multiple: true,
                                onSelected: (selected, titles) => {
                                    this.$store.state.report.titles = titles
                                    this.$store.state.report.where[0].deptId = selected
                                }
                            }
                        ],
                        optsCfg: [
                            {
                                icon: 'android-download',
                                title: '导出Excel',
                                type: 'success',
                                click: () => { }
                            },
                            {
                                icon: 'search',
                                title: '搜索',
                                type: 'info',
                                click: cb => {
                                    const where = this.$store.state.report.where[0]
                                    where.current = 1
                                }
                            }
                        ],
                        tableCfg: {
                            loading: false,
                            rowClassName: (row, index) => {
                                if (row.dataType === 0) {
                                    if (row.callDate) {
                                        return 'info-row-count'
                                    } else {
                                        return 'ivu-table-row-hover'
                                    }
                                }
                                return ''
                            },
                            data: [],
                            columns: [
                                [
                                    {
                                        title: '部门',
                                        minWidth: 140,
                                        render: (h, params) => {
                                            return h('span', params.row.dataType === 0 ? '汇总' : params.row.departName)
                                        },
                                        fixed: 'left'
                                    }
                                ],
                                [
                                    {
                                        title: '日期',
                                        key: 'callDate',
                                        width: 88,
                                        fixed: 'left'
                                    }
                                ]
                            ]
                        }
                    }
                ]
            }
        }
    },
    inject: ['setVisit', 'utils', 'api', 'eF'],
    props: ['screenPath', 'screenHeight', 'screenWidth', 'screenCount', 'isCollapsed'],
    methods: {
        // 查询部门树
        getDepartmentTree (callback) {
            if (this.api.isEnabled) {
                // 查询部门树
                this.api.getDeptByAuth({ type: 3 }).then(d => {
                    if (d.data.IsSuccess) {
                        this.paramCfg.departIdList = d.data.Data
                        if (callback) callback()
                    } else {
                        this.$Notice.error(this.eF('查询部门树', d.data.Info, true))
                    }
                }).catch(e => {
                    this.$Notice.error(this.eF('查询部门树', e.message))
                })
            }
        }
    },
    created () {
        const state = this.$store.state
        if (!state.report) {
            this.setVisit(this, 'start')
            this.getDepartmentTree()
        }
    },
    mounted () {
        this.setVisit(this, 'end')
    }
}
</script>
