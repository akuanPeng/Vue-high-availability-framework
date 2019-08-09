<template>
    <div ref="dr" class="ivu-select-dropdown" :class="className" :style="styles" @scroll="onHandleScroll">
        <slot></slot>
    </div>
</template>
<script>
    import Vue from 'vue';
    const isServer = Vue.prototype.$isServer;
    import { getStyle } from '../../utils/assist';
    const Popper = isServer ? function() {} : require('popper.js/dist/umd/popper.js');  // eslint-disable-line

    export default {
        name: 'Drop',
        props: {
            placement: {
                type: String,
                default: 'bottom-start'
            },
            className: {
                type: String
            },
            isOpt: {
                type: Boolean,
                default: false
            },
            multiple: {
                type: Boolean,
                default: false
            },
            queryProp: {
                type: String,
                default: ''
            },
            handleScroll: {
                type: Function
            },
            page: {
                type: Number,
                default: 1
            }
        },
        data () {
            return {
                popper: null,
                width: '',
                popperStatus: false,
                scrollHeight: 0
            };
        },
        computed: {
            styles () {
                let style = {};
                if (this.width) style.width = `${this.width}px`;
                return this.multiple && this.isOpt ? {
                    ...style,
                    borderTop: '31px solid rgba(0, 0, 0, 0)'
                } : style;
            }
        },
        methods: {
            onHandleScroll (e) {
                if (this.scrollHeight !== e.target.scrollHeight) {
                    if (e.target.scrollTop  > (this.scrollHeight - 500)) {
                        this.scrollHeight = e.target.scrollHeight
                        if (this.handleScroll) this.handleScroll(e, this.queryProp)
                    }
                }
            },
            update () {
                if (isServer) return;
                if (this.popper) {
                    this.$nextTick(() => {
                        this.popper.update();
                        this.popperStatus = true;
                    });
                } else {
                    this.$nextTick(() => {
                        this.popper = new Popper(this.$parent.$refs.reference, this.$el, {
                            placement: this.placement,
                            modifiers: {
                                computeStyle:{
                                    gpuAcceleration: false
                                },
                                preventOverflow :{
                                    boundariesElement: 'window'
                                }
                            },
                            onCreate:()=>{
                                this.resetTransformOrigin();
                                this.$nextTick(this.popper.update());
                            },
                            onUpdate:()=>{
                                this.resetTransformOrigin();
                            }
                        });
                    });
                }
                // set a height for parent is Modal and Select's width is 100%
                if (this.$parent.$options.name === 'iSelect') {
                    this.width = parseInt(getStyle(this.$parent.$el, 'width'));
                }
            },
            destroy () {
                if (this.popper) {
                    setTimeout(() => {
                        if (this.popper && !this.popperStatus) {
                            this.popper.destroy();
                            this.popper = null;
                        }
                        this.popperStatus = false;
                    }, 300);
                }
            },
            resetTransformOrigin() {
                // 不判断，Select 会报错，不知道为什么
                if (!this.popper) return;
                let x_placement = this.popper.popper.getAttribute('x-placement');
                let placementStart = x_placement.split('-')[0];
                let placementEnd = x_placement.split('-')[1];
                const leftOrRight = x_placement === 'left' || x_placement === 'right';
                if(!leftOrRight){
                    this.popper.popper.style.transformOrigin = placementStart==='bottom' || ( placementStart !== 'top' && placementEnd === 'start') ? 'center top' : 'center bottom';
                }
                if (this.multiple && this.isOpt) {
                    setTimeout(() => {
                        this.$parent.$refs.selectOpt.style.top = (5 + parseInt(document.querySelector('.ak-dropdown-all').style.top)) + 'px'
                    }, 200)
                }
            }
        },
        created () {
            this.$on('on-update-popper', this.update);
            this.$on('on-destroy-popper', this.destroy);
        },
        beforeDestroy () {
            if (this.popper) {
                this.popper.destroy();
            }
        },
        watch: {
            page (value) {
                if (value === 1) {
                    this.scrollHeight = 0
                    if (this.$refs.dr) {
                        if (this.$refs.dr.style.display === 'none') {
                            this.$refs.dr.style.display = 'block'
                            this.$refs.dr.scrollTop = 0
                            this.$refs.dr.style.display = 'none'
                        } else {
                            this.$refs.dr.scrollTop = 0
                        }
                    }
                }
            }
        }
    };
</script>
