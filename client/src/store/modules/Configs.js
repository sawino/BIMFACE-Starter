
const isProduction = process.env.NODE_ENV === 'production'
const state = () => ({
    isProduction: isProduction,
    hostUrl: isProduction ? '' : 'http://localhost:3000'
})

const mutations = {
    changeHostUrl(state, newUrl) {
        state.hostUrl = newUrl
    }
}
// use in component: this.$store.state.configs);
// commit: this.$store.commit('configs/changeHostUrl', '')
export default {
    namespaced: true,
    state,
    mutations
}