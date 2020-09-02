
const getters = {
    authOptions: (state, getters, rootState) => {
        let options = { headers: {} }
        options.headers = Object.assign(options.headers, getters.authHeader)
        return options
    },
    authHeader: (state, getters, rootState) => {
        return {
            'Authorization': 'Bearer ' + rootState.user.token
        }
    }
}

export default {
    namespaced: true,
    getters
}