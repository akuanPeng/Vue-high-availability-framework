<template>
    <div :class="`ak-xMind-child ${childClass}`" :style="{padding: dataDt.childs.length === 0 ? '16px 0' : 0}">
        <div :class="`ak-xMind-theme ${(dataDt.type !== 1 && dataDt.childs.length) || (dataDt.type === 1 && dataDt.childs.length === 0) ? 'error' : ''}`" :value="dataDt.id" :keys="dataKeys" :validatekey="dataDt.validatekey" :type="dataDt.type" :isVdn="dataDt.isVdn" :isDel="(dataCorrelation || []).indexOf(dataDt.id) === -1 ? dataDt.isDel : false" @mousedown.stop.prevent="mousedown" :style="dataDt.style ? {fontSize: `${dataDt.style.font.size}px`, fontStyle: dataDt.style.font.style, fontWeight: dataDt.style.font.weight, borderRadius: `${dataDt.style.border.radius}px`, borderWidth: `${dataDt.style.border.width}px`, background: dataDt.style.background, color: dataDt.style.color, borderColor: dataDt.style.border.color, borderStyle: dataDt.style.border.style} : {}">
            <Icon :type="dataDt.icon" v-if="dataDt.icon" :style="dataDt.style ? {fontStyle: dataDt.style.font.style, fontWeight: dataDt.style.font.weight} : {}"></Icon>
            <pre :style="{paddingLeft: `${dataDt.style.font.size * 1.3}px`}">{{dataDt.title}}</pre>
        </div>
        <div class="ak-xMind-childs" v-if="dataDt.childs.length">
            <ChildNode v-for="(dt, index) in dataDt.childs" :key="index" :data-dt="dt" :data-margin="dataDt.childs.length" :data-keys="dataDt.validatekey" :data-index="index" @down="mousedown" @verify="verify"></ChildNode>
        </div>
        <div class="ak-ext" v-if="dataDt.extmenuid" :style="{top: `${extFx ? 16 : (h + 16)}px`, width: `${d}px`, transform: `rotate(${extFx ? (j - 180) : (180 - j)}deg)`, transformOrigin: 'center left'}"></div>
    </div>
</template>

<script>
import ChildNode from './child'
export default {
    name: 'ChildNode',
    data () {
        return {
            d: 0,
            j: 0,
            h: 0
        }
    },
    props: {
        dataDt: {
            type: Object
        },
        dataMargin: {
            type: Number
        },
        dataIndex: {
            type: Number
        },
        dataCorrelation: {
            type: Array
        },
        dataKeys: {
            type: String
        }
    },
    components: {
        ChildNode
    },
    computed: {
        extFx () {
            return parseInt(this.dataDt.id.split('_')[0]) > parseInt(this.dataDt.extmenuid || 0)
        },
        childClass () {
            let cls = ''
            if (this.dataMargin > 1) {
                if (this.dataIndex === 0) {
                    cls = 'ak-xMind-top'
                } else
                if (this.dataIndex === (this.dataMargin - 1)) {
                    cls = 'ak-xMind-bottom'
                } else {
                    cls = 'ak-xMind-middle'
                }
            }
            return cls
        }
    },
    updated () {
        if (this.dataDt.type === 1 && this.dataDt.childs.length === 0) {
            this.$emit('verify', 'IVR导航 - ' + `菜单ID: ${this.dataDt.id} - 为菜单类型, 但没有子菜单`)
        }
        if (this.dataDt.type !== 1 && this.dataDt.childs.length > 0) {
            this.$emit('verify', 'IVR导航 - ' + `菜单ID: ${this.dataDt.id} - 非菜单类型, 存在子菜单`)
        }
        // 角度长度求值
        if (this.dataDt.extmenuid) {
            this.extData()
        }
    },
    methods: {
        mousedown (e) {
            this.$emit('down', e)
        },
        verify (msg) {
            this.$emit('verify', msg)
        },
        // 计算角度和长度
        extData () {
            const obj0 = document.querySelector(`.ak-xMind-theme[value="${this.dataDt.id}"]`).getBoundingClientRect()
            const obj1 = document.querySelector(`.ak-xMind-theme[value="${this.dataDt.extmenuid}"]`).getBoundingClientRect()
            const x0 = obj0.x
            const y0 = this.extFx ? obj0.y : (obj0.y + obj0.height)
            const x1 = this.extFx ? (obj1.x + obj1.width) : (obj1.x + obj1.width)
            const y1 = this.extFx ? (obj1.y + obj1.height) : obj1.y
            const x = Math.abs(x1 - x0)
            const y = Math.abs(y1 - y0)
            this.d = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
            this.h = obj0.height
            this.j = Math.round(Math.asin(y / this.d) / Math.PI * 180)
        }
    },
    mounted () {
        if (this.dataDt.type === 1 && this.dataDt.childs.length === 0) {
            this.$emit('verify', 'IVR导航 - ' + `菜单ID: ${this.dataDt.id} - 为菜单类型, 但没有子菜单`)
        }
        if (this.dataDt.type !== 1 && this.dataDt.childs.length > 0) {
            this.$emit('verify', 'IVR导航 - ' + `菜单ID: ${this.dataDt.id} - 非菜单类型, 存在子菜单`)
        }
        // 角度长度求值
        if (this.dataDt.extmenuid) {
            this.extData()
        }
    }
}
</script>
