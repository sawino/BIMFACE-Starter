import Vue from 'vue'
import Vuex from 'vuex'
import configs from './modules/configs'
import businessData from './modules/BusinessData'
import user from './modules/User'
import auth from './modules/Auth'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        configs,
        user,
        businessData,
        auth
    }
})