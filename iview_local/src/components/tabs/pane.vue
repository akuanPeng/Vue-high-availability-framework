<template>
    <div :class="prefixCls" v-show="show"><slot></slot></div>
</template>
<script>
    const prefixCls = 'ivu-tabs-tabpane';

    export default {
        name: 'TabPane',
        props: {
            name: {
                type: String
            },
            label: {
                type: [String, Function],
                default: ''
            },
            icon: {
                type: String
            },
            disabled: {
                type: Boolean,
                default: false
            },
            closable: {
                type: Boolean,
                default: null
            },
            cls: {
                type: String,
                default: ''
            },
            title: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                prefixCls: prefixCls,
                show: true,
                currentName: this.name
            };
        },
        methods: {
            updateNav () {
                this.$parent.updateNav();
            }
        },
        watch: {
            name (val) {
                this.currentName = val;
                this.updateNav();
            },
            label () {
                this.updateNav();
            },
            icon () {
                this.updateNav();
            },
            disabled () {
                this.updateNav();
            },
            cls () {
                this.updateNav();
            },
            title () {
                this.updateNav();
            }
        },
        mounted () {
            this.updateNav();
        },
        destroyed () {
            this.updateNav();
        }
    };
</script>
