<template>
    <div class="ak-scoring">
        <div class="title">{{isSs ? '质检申诉区' : '质检评分区'}}</div>
        <div class="info">
            <div class="controls" v-if="!isCl">
                <Row>
                    <Col span="6">
                        <div class="label"><span>质检标准</span>:</div>
                        <div class="control">
                            <Select :class="message === '质检标准必选' ? '' : 'no-verify'" :disabled="isSs || isQuery" v-model="dts.crhruleid" size="small" placeholder="质检标准" :filterable="true" :clearable="true" style="width: 178px" @on-change="change">
                                <Option v-for="(item, index) in standard" :value="item.value" :key="index">{{ item.label }}</Option>
                            </Select>
                        </div>
                    </Col>
                    <Col span="6">
                        <div class="label"><span>概要选择</span>:</div>
                        <div class="control">
                            <Cascader class="no-verify" :disabled="isSs || isQuery" v-model="dts.crhresumeid" size="small" :data="gytree" placeholder="概要选择" style="width: 178px;position: relative;top: 5px;"></Cascader>
                        </div>
                    </Col>
                    <Col span="6" v-if="!isSs">
                        <div class="label"><span>质检标记</span>:</div>
                        <div class="control">
                            <Select class="no-verify" :disabled="isSs || isQuery" v-model="dts.crhsign" size="small" placeholder="质检标记" :clearable="true" style="width: 178px">
                                <Option v-for="(item, index) in sign" :value="item.value" :key="index">{{ item.label }}</Option>
                            </Select>
                        </div>
                    </Col>
                    <Col span="6" v-if="!isAdd">
                        <div class="label"><span>服务评价</span>:</div>
                        <div class="control">
                            <Select :class="message === '网络项目, 服务评价必选' ? '' : 'no-verify'" :disabled="isSs || isQuery" @on-change="clearErr" v-model="dts.crhserviceeval" size="small" placeholder="服务评价" style="width: 178px">
                                <Option :value="1">点赞</Option>
                                <Option :value="2">满意</Option>
                                <Option :value="3">不满意</Option>
                            </Select>
                        </div>
                    </Col>
                    <Col span="6" v-if="!isAdd">
                        <div class="label"><span>评价理由</span>:</div>
                        <div class="control">
                            <Input :class="message === '服务评价为点赞和不满意时, 评价理由必填' ? '' : 'no-verify'" :disabled="isSs || isQuery" @on-change="clearErr" v-model="dts.crhevalreason" size="small" placeholder="限100个字符" style="width: 178px"></Input>
                        </div>
                    </Col>
                    <Col span="6">
                        <div class="label"><span>订单编号</span>:</div>
                        <div class="control">
                            <Input class="no-verify" :disabled="isSs || isQuery" v-model="dts.crhorderno" size="small" placeholder="订单编号" style="width: 178px"></Input>
                        </div>
                    </Col>
                    <Col span="12">
                        <div class="label"><span>备注说明</span>:</div>
                        <div class="control">
                            <Input class="no-verify" :disabled="isSs || isQuery" v-model="dts.crhoutlineremark" size="small" placeholder="限500个字符" style="width: 420px"></Input>
                        </div>
                    </Col>
                </Row>
            </div>
            <div class="table">
                <Table size="small" :stripe="true" :border="true" :row-class-name="rowclassname" :columns="columns" :data="data" :height="246"></Table>
            </div>
            <div style="position: relative;top: 2px" v-if="isSs">{{isCl ? '申诉备注' : '质检评价'}}: {{dts.crhjudge}}</div>
            <Upload action="/Manage/QualityInspectionManage/UpLoadFile" :on-success="success" v-if="isSs && !isCl">
                <Button type="ghost" icon="ios-cloud-upload-outline">添加附件</Button>
            </Upload>
            <div v-if="isCl" >
                附件:
                <a v-for="(row, index) in filelist" download="download" :key="index" :href="row.lfiurl">{{row.lfifilename}}</a>
                &nbsp;
            </div>
            <span v-if="isCl">
                <span style="position: relative;top: 2px">处理结果:</span>
                <RadioGroup v-model="ispass" style="position: relative;left: 4px;top: 1px" @on-change="clearErr">
                    <Radio label="通过"></Radio>
                    <Radio label="不通过"></Radio>
                </RadioGroup>
            </span>
            <Input class="no-verify" :disabled="isQuery" v-model="infoR" type="textarea" :placeholder="isSs ? (isCl ? '处理备注' : '申诉备注') : '质检评价'" :rows="5" :autosize="{ minRows: 5, maxRows: 5 }" style="margin-top: 4px"></Input>
        </div>
    </div>
</template>

<script>
export default {
    data () {
        return {
            ps: {},
            verify: {
                pid: '',
                zxcj: ''
            },
            add: {
                pid: 0,
                zxcj: '',
                ywjd: '',
                show: 0
            },
            zxcj: [],
            ywjd: [],
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
                ...((!this.isSs && !this.isQuery) || this.isCl ? [{
                    title: '成长系统',
                    width: 150,
                    render: (h, params) => {
                        const rx = vm.$store.state[this.page].paramCfg.strandlist[params.index]
                        return h('div', [
                            h('span', {
                                style: {
                                    padding: 0,
                                    margin: 0,
                                    'font-family': '"Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",Arial,sans-serif'
                                }
                            }, rx.rbsscene ? `${rx.rbsproductname ? (this.ps[rx.rbsproductname] || {}).label : ''} / ${rx.rbsscene}` : ''),
                            h('Icon', {
                                props: {
                                    type: 'edit',
                                    color: '#19be6b'
                                },
                                style: {
                                    marginLeft: '4px'
                                },
                                on: {
                                    click: () => {
                                        // 弹出成长添加
                                        const ps = this.ps
                                        let rbscaseid = 0
                                        const pid = vm.$store.state[this.page].paramCfg.strandlist[params.index].rbsproductname
                                        const zxcj = vm.$store.state[this.page].paramCfg.strandlist[params.index].rbsscene
                                        if (pid) {
                                            this.zxcj = Object.keys(ps[pid].childs).map(_ => ({
                                                label: ps[pid].childs[_].label,
                                                value: _
                                            }))
                                            if (params.row.assessmentitemname.indexOf('业务解答') !== -1) {
                                                this.ywjd = Object.keys(ps[pid].childs[zxcj].childs).map(_ => ({
                                                    label: ps[pid].childs[zxcj].childs[_].label,
                                                    value: _
                                                }))
                                            }
                                            rbscaseid = vm.$store.state[this.page].paramCfg.strandlist[params.index].rbscaseid
                                        }
                                        this.utils.showModal('confirm', {
                                            title: '添加成长',
                                            cols: [5, 17],
                                            verify_def: {
                                                pid: '',
                                                zxcj: ''
                                            },
                                            verify: this.verify,
                                            switch: true,
                                            data_def: {
                                                pid: vm.$store.state[this.page].paramCfg.strandlist[params.index].rbsproductname || 0,
                                                pname: vm.$store.state[this.page].paramCfg.strandlist[params.index].rbsproductname ? this.ps[vm.$store.state[this.page].paramCfg.strandlist[params.index].rbsproductname].label : '',
                                                zxcj: vm.$store.state[this.page].paramCfg.strandlist[params.index].rbsscene,
                                                ywjd: params.row.assessmentitemname.indexOf('业务解答') !== -1 ? vm.$store.state[this.page].paramCfg.strandlist[params.index].rbsremark : '',
                                                show: params.row.assessmentitemname.indexOf('业务解答') !== -1 && vm.$store.state[this.page].paramCfg.strandlist[params.index].rbsscene ? 1 : 0
                                            },
                                            data: this.add,
                                            name: this,
                                            rows: [
                                                {
                                                    required: true,
                                                    label: '项目',
                                                    key: 'pid',
                                                    type: 'select',
                                                    clearable: true,
                                                    filterable: true,
                                                    options: Object.keys(this.ps).map(_ => ({
                                                        label: this.ps[_].label,
                                                        value: _
                                                    })),
                                                    change: v => {
                                                        this.add.pname = this.ps[v].label
                                                        this.add.zxcj = 0
                                                        this.add.ywjd = 0
                                                        this.ywjd = []
                                                        this.zxcj = Object.keys(ps[v].childs).map(_ => ({
                                                            label: ps[v].childs[_].label,
                                                            value: _
                                                        }))
                                                    },
                                                    verify: [() => !this.add.pid, '项目 - 必选']
                                                },
                                                {
                                                    required: true,
                                                    label: '场景',
                                                    key: 'zxcj',
                                                    type: 'select',
                                                    clearable: true,
                                                    filterable: true,
                                                    optionsKey: 'zxcj',
                                                    change: v => {
                                                        if (v) {
                                                            if (this.add.pid === '16') {
                                                                this.ywjd = Object.keys(ps[this.add.pid].childs[v].childs).map(_ => ({
                                                                    label: ps[this.add.pid].childs[v].childs[_].label,
                                                                    value: _
                                                                }))
                                                                if (this.ywjd[0]) {
                                                                    rbscaseid = ps[this.add.pid].childs[v].childs[this.ywjd[0].value].egcaseid
                                                                }
                                                            } else {
                                                                if (params.row.assessmentitemname.indexOf('业务解答') !== -1) {
                                                                    this.ywjd = Object.keys(ps[this.add.pid].childs[v].childs).map(_ => ({
                                                                        label: ps[this.add.pid].childs[v].childs[_].label,
                                                                        value: _
                                                                    }))
                                                                    this.add.show = 1
                                                                    rbscaseid = 0
                                                                } else {
                                                                    this.add.show = 0
                                                                    this.ywjd = []
                                                                    if (params.row.assessmentitemname === ps[this.add.pid].childs[v].egchannelname) {
                                                                        rbscaseid = ps[this.add.pid].childs[v].egcaseid
                                                                    } else {
                                                                        rbscaseid = 0
                                                                    }
                                                                }
                                                            }
                                                        } else {
                                                            this.add.show = 0
                                                            this.ywjd = []
                                                            rbscaseid = 0
                                                        }
                                                    },
                                                    verify: [() => !this.add.zxcj, '场景 - 必选']
                                                },
                                                {
                                                    label: '内容',
                                                    key: 'ywjd',
                                                    type: 'select',
                                                    clearable: true,
                                                    optionsKey: 'ywjd',
                                                    filterable: true,
                                                    show: {
                                                        show: 1
                                                    },
                                                    change: v => {
                                                        rbscaseid = ps[this.add.pid].childs[this.add.zxcj].childs[v].egcaseid
                                                    }
                                                }
                                            ]
                                        }, cancel => {
                                            if (cancel) cancel()
                                            if (params.row.assessmentitemname.indexOf('业务解答') !== -1) {
                                                if (!this.obj[params.row.assessmentitemid]) {
                                                    this.$set(this.obj, params.row.assessmentitemid, {
                                                        rbscheckresult: 1,
                                                        rbsremark: this.add.ywjd
                                                    })
                                                } else {
                                                    this.obj[params.row.assessmentitemid].rbsremark = this.add.ywjd
                                                }
                                                vm.$store.state[this.page].paramCfg.strandlist[params.index].rbsremark = this.add.ywjd
                                            }
                                            vm.$store.state[this.page].paramCfg.strandlist[params.index].rbsproductname = this.add.pid
                                            vm.$store.state[this.page].paramCfg.strandlist[params.index].rbsscene = this.add.zxcj
                                            vm.$store.state[this.page].paramCfg.strandlist[params.index].rbscaseid = rbscaseid
                                        })
                                    }
                                }
                            })
                        ])
                    }
                }] : []),
                {
                    title: '错误分类',
                    key: 'mistakename',
                    width: 80
                },
                {
                    title: '考核项',
                    width: 80,
                    key: 'assessmentitemname'
                },
                {
                    title: '判定',
                    width: 200,
                    render: (h, params) => {
                        const val = this.obj[params.row.assessmentitemid] ? this.obj[params.row.assessmentitemid].rbscheckresult : 1
                        return h('RadioGroup', {
                            props: {
                                value: {
                                    1: '合格',
                                    2: '不合格',
                                    3: '不涉及'
                                }[val]
                            },
                            on: {
                                'on-change': v => {
                                    this.clearErr()
                                    let mistakename = this.data[params.index].mistakename
                                    vm.$store.state[this.page].paramCfg.strandlist[params.index].rbscheckresult = {
                                        合格: 1,
                                        不合格: 2,
                                        不涉及: 3
                                    }[v]
                                    if (this.isSs && !this.isCl) {
                                        this.obj[params.row.assessmentitemid].rbscheckresult = {
                                            合格: 1,
                                            不合格: 2,
                                            不涉及: 3
                                        }[v]
                                    }
                                    if ((mistakename === '关键错误' || mistakename === '业务关键错误' || mistakename === '最终用户关键错误' || mistakename === '合规关键错误') && v === '不合格') {
                                        this.dts.crhispass = 2
                                    } else {
                                        let x = 0
                                        let y = 0
                                        for (let i = 0; i < vm.$store.state[this.page].paramCfg.strandlist.length; i++) {
                                            const r = vm.$store.state[this.page].paramCfg.strandlist[i]
                                            if (r.mistakename === '非关键错误' && r.rbscheckresult === 2) {
                                                x++
                                            }
                                            if ((r.mistakename === '关键错误' || r.mistakename === '业务关键错误' || r.mistakename === '最终用户关键错误' || r.mistakename === '合规关键错误') && r.rbscheckresult === 2) {
                                                y++
                                            }
                                        }
                                        if (x >= 3 || y >= 1) {
                                            this.dts.crhispass = 2
                                        } else {
                                            this.dts.crhispass = 1
                                        }
                                    }
                                }
                            }
                        }, [
                            h('Radio', {
                                props: {
                                    label: '合格',
                                    disabled: this.isQuery || this.isCl
                                }
                            }),
                            h('Radio', {
                                props: {
                                    label: '不合格',
                                    disabled: this.isQuery || this.isCl
                                }
                            }),
                            h('Radio', {
                                props: {
                                    label: '不涉及',
                                    disabled: this.isQuery || this.isCl
                                }
                            })
                        ])
                    }
                },
                {
                    title: '备注',
                    width: 200,
                    render: (h, params) => {
                        return h('Input', {
                            class: 'no-verify',
                            props: {
                                type: 'textarea',
                                placeholder: '不合格时备注必填',
                                rows: 2,
                                value: this.obj[params.row.assessmentitemid] ? this.obj[params.row.assessmentitemid].rbsremark : '',
                                autosize: {
                                    minRows: 2,
                                    maxRows: 2
                                },
                                disabled: this.isQuery || (this.isSs && !this.isCl) || params.row.assessmentitemname === '业务解答'
                            },
                            on: {
                                'on-change': e => {
                                    vm.$store.state[this.page].paramCfg.strandlist[params.index].rbsremark = e.target.value
                                }
                            },
                            style: {
                                margin: '3px 0'
                            }
                        })
                    }
                },
                {
                    title: '考核标准',
                    key: 'pcexplain',
                    minWidth: 180
                }
            ],
            data: [],
            obj: {}
        }
    },
    props: {
        clearErr: {
            type: Function,
            default () {
                return () => {}
            }
        },
        isAdd: {
            type: Boolean,
            default: false
        },
        isFj: {
            type: Boolean,
            default: false
        },
        isQuery: {
            type: Boolean,
            default: false
        },
        isSs: {
            type: Boolean,
            default: false
        },
        isCl: {
            type: Boolean,
            default: false
        },
        filelist: {
            type: Array,
            default () {
                return []
            }
        },
        standard: {
            type: Array,
            default () {
                return []
            }
        },
        message: {
            type: String,
            default: ''
        },
        page: {
            type: String,
            default: ''
        },
        value: {
            type: Number,
            default: 0
        },
        sign: {
            type: Array,
            default () {
                return []
            }
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
        },
        dts: {
            type: Object,
            default () {
                return {}
            }
        },
        gytree: {
            type: Array,
            default () {
                return []
            }
        },
        isCzrz: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        ispass: {
            get () {
                return {
                    1: '通过',
                    2: '不通过'
                }[this.dts.ispass] || ''
            },
            set (v) {
                this.dts.ispass = {
                    通过: 1,
                    不通过: 2
                }[v]
            }
        },
        crhispass: {
            get () {
                return {
                    1: '通过',
                    2: '不通过'
                }[this.dts.crhispass] || ''
            },
            set (v) {
                this.dts.crhispass = {
                    通过: 1,
                    不通过: 2
                }[v]
            }
        },
        infoR: {
            get () {
                return this.isSs ? this.dts.xxx : this.dts.crhjudge
            },
            set (v) {
                if (this.isSs) {
                    this.dts.xxx = v
                } else {
                    this.dts.crhjudge = v
                }
            }
        }
    },
    methods: {
        rowclassname (row, index) {
            if (this.isCzrz) {
                const pageD = vm.$store.state[this.page]
                if (this.dts.lioperatetype === 2 && pageD.paramCfg.strandlist[index].rbsisappeal) {
                    return 'ivu-table-row-hover3'
                }
                if (this.dts.lioperatetype === 3 && pageD.paramCfg.strandlist[index].rbsisreview) {
                    return 'ivu-table-row-hover3'
                }
            } else {
                const pageD = vm.$store.state[this.page]
                if (this.isCl && pageD.paramCfg.strandlist[index].rbsisappeal) {
                    return 'ivu-table-row-hover3'
                }
                if ((this.isSs && !this.isCl) || this.isFj) {
                    if (pageD.paramCfg.strandlist[index].oldrbscheckresult !== pageD.paramCfg.strandlist[index].rbscheckresult) {
                        return 'ivu-table-row-hover3'
                    }
                }
            }
            return ''
        },
        success (response, file, fileList) {
            this.dts.filelist.push({
                lfifilename: file.name,
                lfipath: response.Data.path,
                lfiurl: response.Data.url
            })
        },
        change (id) {
            this.clearErr()
            const pageD = vm.$store.state[this.page]
            this.data = []
            this.utils.httpMethod(this, {
                isQuery: true,
                apiName: 'selectItemByRuleId',
                apiInfo: '根据质检标准ID查询考核项',
                data: {
                    id
                }
            }, d => {
                this.data = d.data.Data
                this.dts.crhispass = id ? (this.dts.crhispass || 1) : 0
                if (!this.isAdd) {
                    for (let i = 0; i < pageD.paramCfg.strandlist.length; i++) {
                        this.$set(this.obj, pageD.paramCfg.strandlist[i].rbscheckid, pageD.paramCfg.strandlist[i])
                    }
                    pageD.paramCfg.strandlist = d.data.Data.map(_ => {
                        return {
                            oldid: this.obj[_.assessmentitemid] ? (this.obj[_.assessmentitemid].id || this.obj[_.assessmentitemid].oldid) : 0,
                            assessmentitemid: _.assessmentitemid,
                            mistakename: _.mistakename,
                            rbsruleinfoid: this.dts.crhruleid,
                            rbscheckid: _.assessmentitemid,
                            rbscheckresult: this.obj[_.assessmentitemid] ? this.obj[_.assessmentitemid].rbscheckresult : 1,
                            rbsremark: this.obj[_.assessmentitemid] ? this.obj[_.assessmentitemid].rbsremark : '',
                            rbsisvalid: 1,
                            rbscaseid: this.obj[_.assessmentitemid] ? this.obj[_.assessmentitemid].rbscaseid : 0,
                            rbsisappeal: this.obj[_.assessmentitemid] ? this.obj[_.assessmentitemid].rbsisappeal : 0,
                            rbsisreview: this.obj[_.assessmentitemid] ? this.obj[_.assessmentitemid].rbsisreview : 0,
                            oldrbscheckresult: this.obj[_.assessmentitemid] ? this.obj[_.assessmentitemid].rbscheckresult : 1,
                            rbsproductname: this.obj[_.assessmentitemid] ? this.obj[_.assessmentitemid].rbsproductname : '',
                            rbsscene: this.obj[_.assessmentitemid] ? this.obj[_.assessmentitemid].rbsscene : ''
                        }
                    })
                } else {
                    pageD.paramCfg.strandlist = d.data.Data.map(_ => {
                        return {
                            oldid: 0,
                            assessmentitemid: _.assessmentitemid,
                            mistakename: _.mistakename,
                            rbsruleinfoid: this.dts.crhruleid,
                            rbscheckid: _.assessmentitemid,
                            rbscheckresult: 1,
                            rbsremark: '',
                            rbsisvalid: 1,
                            rbscaseid: _.rbscaseid,
                            rbsisappeal: _.rbsisappeal,
                            rbsisreview: _.rbsisreview,
                            oldrbscheckresult: 1,
                            rbsproductname: _.rbsproductname,
                            rbsscene: _.rbsscene
                        }
                    })
                }
            })
        },
        // 查询员工成长
        getGrowthList () {
            this.utils.httpMethod(this, {
                isQuery: true,
                apiName: 'getGrowthList',
                apiInfo: '查询员工成长',
                data: {}
            }, cz => {
                const ps = {}
                for (let i = 0; i < cz.data.Data.length; i++) {
                    if (ps[cz.data.Data[i].egprojectid]) {
                        if (ps[cz.data.Data[i].egprojectid].childs[cz.data.Data[i].egscene]) {
                            if (!ps[cz.data.Data[i].egprojectid].childs[cz.data.Data[i].egscene].childs[cz.data.Data[i].egcontent]) {
                                ps[cz.data.Data[i].egprojectid].childs[cz.data.Data[i].egscene].childs[cz.data.Data[i].egcontent] = {
                                    label: cz.data.Data[i].egcontent,
                                    egcaseid: cz.data.Data[i].egcaseid
                                }
                            }
                        } else {
                            ps[cz.data.Data[i].egprojectid].childs[cz.data.Data[i].egscene] = {
                                label: cz.data.Data[i].egscene,
                                childs: {},
                                egcaseid: cz.data.Data[i].egcaseid,
                                egchannelname: cz.data.Data[i].egchannelname
                            }
                        }
                    } else {
                        ps[cz.data.Data[i].egprojectid] = {
                            label: cz.data.Data[i].egprojectname,
                            childs: {}
                        }
                    }
                }
                this.$set(this, 'ps', ps)
            })
        }
    },
    watch: {
        'dts.crhruleid' (value) {
            if (value) {
                this.change(value)
            }
        }
    },
    mounted () {
        if (!this.isAdd) {
            this.change(this.value)
        }
        this.getGrowthList()
    }
}
</script>

<style lang="stylus">
.ak-scoring
    position relative
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
        position relative
        padding 14px 6px 8px 6px
        .label
            float left
            position relative
            top 1px
            margin-left 4px
            span
                font-weight bold
                margin-right 3px
        .control
            float left
            margin-left 4px
</style>
