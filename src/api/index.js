import Vue from 'vue'

const Config = {
    validateStatus: function (status) {
        return status >= 200 && status < 402
    }
}

export default {
    isEnabled: true,
    // 框架级API
    ...{
        // 获得用户
        getUser () {
            return Vue.$http.get(`/Manage/UserInfo/GetUserInfo`, Config)
        },
        // 获得菜单
        getMenus () {
            return Vue.$http.get(`/Manage/UserInfo/GetUserMenus`, Config)
        },
        // 退出登陆
        logOut () {
            return Vue.$http.get(`/Manage/Home/LogOut`, Config)
        }
    }
}
