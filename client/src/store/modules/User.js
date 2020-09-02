
const state = () => ({
    name: '',
    token: '',
    email: '',
    isSignedIn: false
})

const mutations = {
    setName(state, name) {
        state.name = name
    },
    setToken(state, token) {
        state.token = token
    },
    setIsSignedIn(state, isSignedIn) {
        state.isSignedIn = isSignedIn
    },
    setEmail(state, email) {
        state.email = email
    },
    setUser(state, user) {
        state.name = user.name
        state.token = user.token
        state.email = user.email
        state.isSignedIn = user.isSignedIn
    }
}

export default {
    namespaced: true,
    state,
    mutations
}