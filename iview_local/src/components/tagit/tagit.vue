<template>
    <div :class="classes"></div>
</template>
<script>
    const prefixCls = 'ivu-tagit';
    export default {
        name: 'Tag',
        props: {
        },
        data () {
            return {
            };
        },
        computed: {
            classes () {
                return [
                    `${prefixCls}`
                ];
            }
        },
        methods: {
        }
    };
</script>