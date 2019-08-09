<template>
    <div class="ak-help">
        <Carousel v-model="value" easing="fade" loop>
            <CarouselItem>
                <!-- 布局 - 1 -->
                <div class="help-1">
                    <!-- 菜单和标题 -->
                    <div :class="`lump-1 ${parent.isCollapsed ? 'collapsed' : ''}`">
                        <div class="lump-line"></div>
                        <div class="arrow-1"></div>
                        <div class="arrow-2"></div>
                        <div class="arrow-3"></div>
                    </div>
                    <!-- 工具箱 -->
                    <div class="lump-2">
                        <div class="arrow-1"></div>
                        <div class="arrow-2"></div>
                    </div>
                    <!-- 关闭 -->
                    <div class="lump-close" @click.self="helpXFunc">
                        关闭
                    </div>
                </div>
            </CarouselItem>
            <CarouselItem>
                <!-- 布局 - 2 -->
                <div class="help-2">
                    <!-- 模块和闭合 -->
                    <div :class="`lump-1 ${parent.isCollapsed ? 'collapsed' : ''}`">
                        <div class="lump-line"></div>
                        <div class="arrow-1"></div>
                        <div class="arrow-2"></div>
                    </div>
                    <!-- 关闭 -->
                    <div class="lump-close" @click.self="helpXFunc">
                        关闭
                    </div>
                </div>
            </CarouselItem>
            <CarouselItem>
                <!-- 布局 - 3 -->
                <div class="help-3">
                    <!-- 收藏夹 -->
                    <div :class="`lump-1 ${parent.isCollapsed ? 'collapsed' : ''}`">
                        <div class="arrow-1"></div>
                    </div>
                    <!-- 关闭 -->
                    <div class="lump-close" @click.self="helpXFunc">
                        关闭
                    </div>
                </div>
            </CarouselItem>
        </Carousel>
    </div>
</template>

<script>
export default {
    data () {
        return {
            value: 0
        }
    },
    inject: ['parent'],
    methods: {
        helpXFunc () {
            this.parent.help = false
        }
    },
    created () { }
}
</script>

<style lang="stylus">
.ak-help
    position absolute
    left 0
    right 0
    bottom 0
    top 0
    background rgba(0, 0, 0, 0.6)
    z-index 3000
    .ivu-carousel
        height 100%
        .ivu-carousel-list
            height 100%
            .ivu-carousel-track
                height 100%
                .ivu-carousel-item
                    height 100% !important
                    .help-3
                        position relative
                        height 100%
                        .lump-close
                            height 40px
                            border 3px solid #5cadff
                            width 80px
                            position absolute
                            text-align center
                            color #5cadff
                            line-height 36px
                            right 28px
                            bottom 25px
                            font-size 17px
                            letter-spacing 3px
                            text-shadow 1px 1px 2px rgba(0, 0, 0, 0.1)
                            box-shadow 2px 2px 4px rgba(0, 0, 0, 0.1)
                            cursor pointer
                        .lump-1
                            position absolute
                            border 3px solid #5cadff
                            top 52px
                            right 5px
                            height 28px
                            left 204px
                            .arrow-1
                                position absolute
                                border-left 2px solid #5cadff
                                border-right 2px solid #5cadff
                                top 24px
                                left 50%
                                margin-left -2px
                                height 140px
                                border-radius 0% 0% 50% 50%
                                box-shadow 2px 2px 4px rgba(0, 0, 0, 0.1)
                            &.collapsed
                                left 58px
                    .help-2
                        position relative
                        height 100%
                        .lump-close
                            height 40px
                            border 3px solid #19be6b
                            width 80px
                            position absolute
                            text-align center
                            color #19be6b
                            line-height 36px
                            right 28px
                            bottom 25px
                            font-size 17px
                            letter-spacing 3px
                            text-shadow 1px 1px 2px rgba(0, 0, 0, 0.1)
                            box-shadow 2px 2px 4px rgba(0, 0, 0, 0.1)
                            cursor pointer
                        .lump-1
                            position absolute
                            border 3px solid #19be6b
                            right 168px
                            height 48px
                            left 200px
                            .arrow-1
                                position absolute
                                border-left 2px solid #19be6b
                                border-right 2px solid #19be6b
                                top 42px
                                left 25px
                                height 100px
                                border-radius 0% 0% 50% 50%
                                box-shadow 2px 2px 4px rgba(0, 0, 0, 0.1)
                            .arrow-2
                                position absolute
                                border-left 2px solid #19be6b
                                border-right 2px solid #19be6b
                                top 42px
                                left 50%
                                margin-left 27px
                                height 200px
                                border-radius 0% 0% 50% 50%
                                box-shadow 2px 2px 4px rgba(0, 0, 0, 0.1)
                            .lump-line
                                position absolute
                                border-left 3px solid #19be6b
                                height 42px
                                left 55px
                            &.collapsed
                                left 54px
                    .help-1
                        position relative
                        height 100%
                        .lump-close
                            height 40px
                            border 3px solid #f90
                            width 80px
                            position absolute
                            text-align center
                            color #f90
                            line-height 36px
                            right 28px
                            bottom 25px
                            font-size 17px
                            letter-spacing 3px
                            text-shadow 1px 1px 2px rgba(0, 0, 0, 0.1)
                            box-shadow 2px 2px 4px rgba(0, 0, 0, 0.1)
                            cursor pointer
                        .lump-2
                            position absolute
                            border 3px solid #ff9900
                            width 168px
                            height 48px
                            right 0
                            .arrow-1
                                position absolute
                                top 45px
                                right 81px
                                border-left 2px solid #ff9900
                                border-right 2px solid #ff9900
                                width 0
                                height 120px
                                box-shadow 2px 2px 4px rgba(0, 0, 0, 0.1)
                            .arrow-2
                                position absolute
                                top 165px
                                border-top 2px solid #ff9900
                                border-bottom 2px solid #ff9900
                                border-radius 50% 0% 0% 50%
                                width 120px
                                right 81px
                                box-shadow 2px 2px 4px rgba(0, 0, 0, 0.1)
                        .lump-1
                            position absolute
                            border 3px solid #ff9900
                            height 100%
                            width 200px
                            transition width 0.2s ease-in-out
                            box-sizing border-box
                            left 0
                            .lump-line
                                position absolute
                                top 45px
                                border-top 3px solid #ff9900
                                width 100%
                            .arrow-1
                                position absolute
                                top 20px
                                border-top 2px solid #ff9900
                                border-bottom 2px solid #ff9900
                                width 320px
                                right -320px
                                box-shadow 2px 2px 4px rgba(0, 0, 0, 0.1)
                            .arrow-2
                                position absolute
                                top 50%
                                margin-top 46px
                                border-top 2px solid #ff9900
                                border-bottom 2px solid #ff9900
                                border-radius 0% 50% 50% 0%
                                width 120px
                                right -120px
                                box-shadow 2px 2px 4px rgba(0, 0, 0, 0.1)
                            .arrow-3
                                position absolute
                                top 20px
                                border-left 2px solid #ff9900
                                border-right 2px solid #ff9900
                                height 120px
                                right -320px
                                border-radius 0% 0 50% 50%
                                box-shadow 2px 2px 4px rgba(0, 0, 0, 0.1)
                            &.collapsed
                                width 54px
    .lump-close:hover
        border 3px solid #fff !important
        color #fff !important
        text-shadow 1px 1px 2px rgba(0, 0, 0, 0.3) !important
        box-shadow 2px 2px 4px rgba(0, 0, 0, 0.3) !important
</style>
