<template>
    <div class="ak-resources">
        <div class="title">{{type === 2 ? '在线' : '录音'}}信息区<a ref="xLT" target="_blank"> - {{type === 2 ? `放大聊天区` : `查看录音`}}</a></div>
        <div class="left">
            <iframe ref="iframe1" class="xxxd" target='_blank' frameborder="0" width="580px" height="155px" v-show="type === 2"></iframe>
            <iframe ref="iframe" frameborder="0" target='_blank' width="518px" height="180px" v-show="type === 1"></iframe>
        </div>
        <div :class="`right ${type === 2 ? 'rightX' : ''}`" :style="isSearch ? {padding: '11px 12px'} : {}">
            <div class="row" v-if="isSearch">
                <Input v-model="numbering" size="small" placeholder="编号查询" style="width: 320px;position: absolute;top: 10px;">
                    <Select v-model="type" placeholder="" size="small" slot="prepend" style="width: 60px">
                        <Option :value="1">录音</Option>
                        <Option :value="2">在线</Option>
                    </Select>
                    <Button slot="append" icon="ios-search" @click="search"></Button>
                </Input>
            </div>
            <div class="row" v-if="uuID"><span>{{{1: '录音', 2: '聊天'}[type]}}编号</span>: {{uuID}}<div v-if="csrtrueName" style="display: inline-block;"><span style="margin-left: 15px;">客户名称:</span>: {{csrtrueName}}</div></div>
            <div class="row" v-if="calledNum"><span>客户号码</span>:
                <a>{{type === 1 ? (callDirection === 'in' ? callerNum : calledNum) : calledNum}}</a>
                <Icon type="ios-copy" v-if="calledNum" style="font-size: 14px;color: #2d8cf0;position: relative;top: 1px;cursor: pointer;" @click="copy"></Icon>
                <span v-if="isCopy" style="color: #19be6b;padding: 0 4px;">* 复制成功</span>
                <div v-if="memberId" style="display: inline-block;"><span style="margin-left: 15px;">会员编号:</span>: {{memberId}}</div>
            </div>
            <div class="row" v-if="startTime"><span>{{{1: '录音', 2: '在线'}[type]}}时间</span>: {{startTime ? utils.formatDate(new Date(startTime * 1000), 'yyyy-MM-dd hh:mm:ss') : ''}}<div style="display: inline-block;" v-if="relateInfo"><span style="margin-left: 15px;">产品订单:</span>: {{relateInfo}}</div></div>
            <div class="row" v-if="callLength"><span>{{{1: '录音', 2: '在线'}[type]}}时长</span>: {{callLength ? (Math.ceil(callLength / 1000) + ' s') : ''}}</div>
            <div class="row" v-if="agentNo"><span>涉及客服</span>: {{`${agentName} (${agentNo})`}}<div style="display: inline-block;" v-if="extension"><span style="margin-left: 15px;">分机号</span>: {{extension}}</div></div>
            <div class="row" v-if="departName"><span>部门组别</span>: {{departName}}</div>
        </div>
    </div>
</template>

<script>
export default {
    data () {
        return {
            isCopy: false,
            type: 1,
            numbering: '',
            uuID: '',
            calledNum: '',
            callerNum: '',
            extension: '',
            agentName: '',
            startTime: 0,
            csrtrueName: '',
            callLength: 0,
            agentNo: '',
            departName: '',
            callDirection: '',
            relateInfo: '',
            memberId: 0
        }
    },
    props: {
        isSearch: {
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
        },
        value: {
            type: String,
            default () {
                return ''
            }
        },
        t: {
            type: Number,
            default: 0
        }
    },
    methods: {
        search () {
            if (this.numbering) {
                if (this.type === 1) {
                    this.api.searchESRadioRecord({
                        callerNum: '',
                        calledNum: '',
                        agentNo: '',
                        extension: '',
                        hatCallID: this.numbering,
                        departIdList: [],
                        size: 20,
                        times: [new Date('1990-01-01 00:00:00'), new Date('2990-01-01 00:00:00')],
                        current: 1
                    }).then(d => {
                        if (d.data.IsSuccess && d.data.Data && d.data.Data.List && d.data.Data.List[0]) {
                            this.uuID = d.data.Data.List[0].hatCallID
                            this.calledNum = d.data.Data.List[0].calledNum
                            this.callerNum = d.data.Data.List[0].callerNum
                            this.startTime = d.data.Data.List[0].startTime
                            this.callLength = d.data.Data.List[0].callLength
                            this.agentNo = d.data.Data.List[0].jobnumber
                            this.departName = d.data.Data.List[0].departName
                            this.agentName = d.data.Data.List[0].agentName
                            this.csrtrueName = d.data.Data.List[0].xxx
                            this.callDirection = d.data.Data.List[0].callDirection
                            this.extension = d.data.Data.List[0].extension
                            this.$emit('on-change', d.data.Data.List[0], this.type, this.numbering)
                            this.api.recordUrl({
                                HatCallId: d.data.Data.List[0].hatCallID
                            }).then(d => {
                                if (d.data.IsSuccess) {
                                    this.$nextTick(() => {
                                        if (this.$refs.iframe) this.$refs.iframe.src = d.data.aaData + `&IsHideDownLoad=1&_t=${Date.now()}`
                                        if (this.$refs.xLT) this.$refs.xLT.href = d.data.aaData + `&IsHideDownLoad=1&_t=${Date.now()}`
                                    })
                                }
                            })
                        }
                    })
                } else {
                    this.api.getLiveChatListPage({
                        SessionId: this.numbering,
                        StartTime: '2000-01-01 00:00:00',
                        EndTime: '2050-01-01 23:59:59'
                    }).then(d => {
                        if (d.data.IsSuccess && d.data.Data && d.data.Data.List && d.data.Data.List[0]) {
                            d.data.Data = d.data.Data.List
                            let jobnumber = d.data.Data[0].supporterId.replace(/^-/, 'V')
                            if (jobnumber.length < 5) {
                                jobnumber = jobnumber.padStart(5, '0')
                            }
                            const dts1 = {
                                uuID: d.data.Data[0].sessionId,
                                hatCallID: d.data.Data[0].sessionId,
                                callerNum: d.data.Data[0].mobile,
                                calledNum: d.data.Data[0].mobile,
                                startTime: (new Date(d.data.Data[0].sessionStartTime)).valueOf() / 1000,
                                callLength: d.data.Data[0].sessionLength * 1000,
                                callDirection: 1,
                                agentNo: jobnumber,
                                jobnumber: jobnumber,
                                departId: 0,
                                departName: '',
                                agentName: d.data.Data[0].supporterName,
                                sencondProductId: 0,
                                csrtrueName: d.data.Data[0].memberName,
                                relateInfo: d.data.Data[0].relateInfo,
                                memberId: d.data.Data[0].memberId
                            }
                            // 根据工号查部门
                            this.utils.httpMethod(this, {
                                isQuery: true,
                                apiName: 'selectDepartByJobnumber',
                                apiInfo: '根据工号查部门',
                                data: {
                                    jobnumber: dts1.jobnumber
                                }
                            }, p => {
                                if (p.data.Data) {
                                    dts1.departId = p.data.Data.id
                                    dts1.departName = p.data.Data.dmname
                                    // 查询项目
                                    this.utils.httpMethod(this, {
                                        isQuery: true,
                                        apiName: 'selectDepartAndProductByJobnumber',
                                        apiInfo: '根据工号查项目',
                                        data: {
                                            jobnumber: dts1.jobnumber
                                        }
                                    }, x => {
                                        // 需要项目id
                                        if (x.data.Data && x.data.Data.length) {
                                            dts1.sencondProductId = x.data.Data[0].dprproductid
                                        }
                                        this.uuID = dts1.uuID
                                        this.calledNum = dts1.calledNum
                                        this.startTime = dts1.startTime
                                        this.callLength = dts1.callLength
                                        this.agentNo = dts1.jobnumber
                                        this.agentName = dts1.agentName
                                        this.departName = dts1.departName
                                        this.csrtrueName = dts1.csrtrueName
                                        this.relateInfo = dts1.relateInfo
                                        this.memberId = dts1.memberId
                                        this.$emit('on-change', dts1, this.type, this.numbering)
                                        this.$nextTick(() => {
                                            if (this.$refs.iframe1) this.$refs.iframe1.src = `http://127.0.0.1:8080/callcenter/qcmanage/Radio/LiveChatDetails?SessionID=${this.numbering}&_t=${Date.now()}`
                                            if (this.$refs.xLT) this.$refs.xLT.href = `http://127.0.0.1:8080/callcenter/qcmanage/Radio/LiveChatDetails?SessionID=${this.numbering}&_t=${Date.now()}`
                                        })
                                    })
                                }
                            })
                        }
                    })
                }
            }
        },
        copy () {
            if (!this.isCopy) {
                this.isCopy = true
                const number = this.type === 1 ? (this.callDirection === 'in' ? this.callerNum : this.calledNum) : this.calledNum
                this.utils.copyData(number)
                setTimeout(() => {
                    this.isCopy = false
                }, 1000)
            }
        }
    },
    mounted () {
        if (this.value) {
            this.type = this.t
            this.numbering = this.value
            this.search()
        }
    }
}
</script>

<style lang="stylus">
.ak-resources
    position relative
    height 170px
    border 1px solid #ddd
    margin-top 10px
    .zxltjil
        position: absolute;
        top: 12px;
        left: 4px;
        right: 4px;
        bottom: 4px;
        border: 1px solid #efefef;
        background-color: #fcfcfc;
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
    .left
        position absolute
        left 0
        right 55%
        top 0
        bottom 0
        iframe
            position absolute
            left 50%
            margin-left -218px
            top 50%
            margin-top -76px
            &.xxxd
                margin-top -73px
                overflow-y hidden
    .right
        position absolute
        left 45%
        right 0
        top 0
        bottom 0
        padding 20px 12px
        &.rightX
            left 60%
        button
            box-shadow none
            &:hover
                color blue
        .row
            height 22px
            line-height 22px
            span
                font-weight bold
                margin-right 3px
</style>
