import Vue from 'vue'
import Vuex from 'vuex'
import fields from './fields'
import helps from './helps'

Vue.use(Vuex)

export default new Vuex.Store({
    actions: {},
    getters: {},
    state: {
        screen: 1,
        skin: 0,
        layout: 0,
        menuValue: 0,
        fields,
        helps,
        auths: {},
        bl: '',
        mx: '',
        audio: {
            icon: 'play',
            icon1: 'android-volume-up',
            max: 0,
            time: 0,
            ao: null,
            interval: null,
            ok: true
        }
    },
    mutations: {}
})
