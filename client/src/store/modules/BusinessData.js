const state = () => ({
    fileInfoList: [],
    user: {}
})

const mutations = {
    setFileInfoList(state, newFileInfoList) {
        state.fileInfoList = newFileInfoList
    },
    addFileInfo(state, newFileInfo) {
        state.fileInfoList.push(newFileInfo)
    }
}

export default {
    namespaced: true,
    state,
    mutations
}