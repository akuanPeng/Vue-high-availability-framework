<template>
    <div class="ak-pageManage">
        <akManage1 name="pageManage" :is-collapsed="isCollapsed" :opts-cfg="optsCfg" :param-cfg="paramCfg" :where-cfg="whereCfg" :table-cfg="tableCfg" :screen-width="screenWidth" :screen-height="screenHeight" :screen-count="screenCount"></akManage1>
    </div>
</template>

<script>
export default {
    data () {
        return {
            data: {
                add: {
                },
                upd: {
                }
            },
            optsCfg: [
                {
                    icon: 'plus',
                    title: '添加',
                    type: 'success',
                    click: () => { }
                },
                {
                    icon: 'search',
                    title: '搜索',
                    type: 'info',
                    click: () => { }
                }
            ],
            stime: 0,
            paramCfg: {
                stime: 0,
                cacheEmpty: () => {
                    this.$destroy()
                }
            },
            whereCfg: {
                data: {
                    current: 1,
                    size: 20
                },
                controls: []
            },
            tableCfg: {
                loading: false,
                isPagging: true,
                columns: [
                    {
                        title: '序号',
                        align: 'center',
                        width: 60,
                        render: (h, params) => {
                            const where = this.$store.state.pageManage.where
                            return h('span', (where.current - 1) * where.size + params.index + 1)
                        },
                        fixed: 'left'
                    },
                    {
                        title: '测试',
                        minWidth: 180,
                        key: 'test'
                    },
                    {
                        title: '操作',
                        width: 160,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'warning',
                                        size: 'small',
                                        icon: 'edit'
                                    },
                                    on: {
                                        click: () => { }
                                    }
                                }, '编辑'),
                                h('span', {
                                    style: {
                                        padding: '0 3px 0 2px'
                                    }
                                }),
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small',
                                        icon: 'trash-a'
                                    },
                                    on: {
                                        click: () => { }
                                    }
                                }, '删除')
                            ])
                        },
                        fixed: 'right'
                    }
                ],
                data: [
                    {
                        test: '测试数据'
                    }
                ],
                sizeOpts: [
                    10,
                    20,
                    40,
                    80
                ],
                total: 1
            }
        }
    },
    inject: ['setVisit', 'utils', 'api', 'eF'],
    props: ['screenPath', 'screenHeight', 'screenWidth', 'screenCount', 'isCollapsed'],
    methods: {},
    created () {
        const state = this.$store.state
        if (!state.pageManage) {
            this.setVisit(this, 'start')
        }
    },
    mounted () {
        this.setVisit(this, 'end')
    }
}
</script>
