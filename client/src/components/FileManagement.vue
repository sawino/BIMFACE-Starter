<template>
    <el-container>
        <el-aside class="flex-container">
            <div class="file-management-bar" height="40px">
                <el-tooltip content="Upload file" effect="light">
                    <el-button size="mini" icon="el-icon-plus" @click="showUploadDialog"></el-button>
                </el-tooltip>
                <el-tooltip content="Delete file" effect="light">
                    <el-button size="mini" icon="el-icon-minus" @click="deleteCheckedItem"></el-button>
                </el-tooltip>
                <el-tooltip content="Translate file" effect="light">
                    <el-button size="mini" icon="el-icon-s-promotion" @click="translateCheckedFiles"></el-button>
                </el-tooltip>
                <upload-dialog ref="uploadDialog" @fileUploaded="onFileUploaded"></upload-dialog>
            </div>
            <el-scrollbar style="height:100%;" :vertical="true" :horizontal="false">
                <el-tree
                    ref="fileTree"
                    :props="defaultProps"
                    :data="treeData"
                    :default-expanded-keys="[translatedNodeKey, untranslatedNodeKey]"
                    node-key="fileId"
                    :disable="isSignedIn === false"
                    @node-click="nodeClicked"
                    show-checkbox>
                </el-tree>
            </el-scrollbar>
        </el-aside>
        <el-main v-if="noViewToken == false">
            <file-viewer ref='fileViewer' v-if='hasReset == true'></file-viewer>
        </el-main>
        <el-main v-show="noViewToken">
            <h1 class="no-view-token-hint">The selected item is not translated</h1>
            <h1 class="no-view-token-hint">Translate files <span class="el-icon-s-promotion"></span> before viewing</h1>
        </el-main>
    </el-container>
</template>
<script>
import axios from 'axios';
import FileViewer from '@/components/FileViewer'
import {mapState} from 'vuex'
import UploadDialog from '@/components/UploadDialog'

export default {
    data: function() {
        return {
            checkTranslateStatusTimer: '',
            translatingFileInfoList: [],
            noViewToken: true,
            translatedNodeKey: 'TranslatedFiles',
            untranslatedNodeKey: 'UntranslatedFiles',
            hasReset: 'true',
            defaultProps: {
                label: 'name'
            },
            treeData: []
        }
    },
    computed: {
        ...mapState('configs', {
            hostUrl: state => state.hostUrl
        }),
        ...mapState('businessData', {
            fileInfoList: state => state.fileInfoList
        }),
        ...mapState('user', {
            isSignedIn: state => state.isSignedIn
        })
    },
    methods: {
        init: function () {
            let translatedFileInfoList = []
            let untranslatedFileInfoList = []
            this.fileInfoList.forEach((item) => {
                if (item.isTranslated) {
                    translatedFileInfoList.push(item)
                } else {
                    untranslatedFileInfoList.push(item)
                }
            })

            this.$refs.fileTree.updateKeyChildren(this.translatedNodeKey, translatedFileInfoList);
            this.$refs.fileTree.updateKeyChildren(this.untranslatedNodeKey, untranslatedFileInfoList);
        },
        viewFile: function (item) {
            this.noViewToken = false
            this.hasReset = false
            this.$nextTick(() => {
                this.hasReset = true
                let options = this.$store.getters['auth/authOptions'];
                options = Object.assign(options,
                    {
                        params: {
                            fileId: item.fileId
                        }
                    })
                axios.get(this.hostUrl + '/api/token/viewToken', options)
                    .then((res) => {
                        if (res.data.code === '0') {
                            this.noViewToken = false;
                            this.$refs.fileViewer.showModel(res.data.data, item.fileId);
                        } else {
                            this.noViewToken = true
                        }
                    })
            })
        },
        onFileUploaded: function(data) {
            console.log(data)
            this.$store.commit('businessData/addFileInfo', data)
            this.$refs.fileTree.append(data, 'UntranslatedFiles')
        },
        showUploadDialog: function() {
            this.isShowUploadDialog = true;
            this.$refs.uploadDialog.dialogVisible = true;
        },
        nodeClicked: function(dataObj, dataNode, dataComponent) {
            if (dataNode.level < 2) {
                return
            }
            this.viewFile(dataObj)
        },
        deleteCheckedItem: function() {
            let checkedNodes = this.$refs.fileTree.getCheckedNodes(true, false);
            if (checkedNodes.length === 0) {
                return
            }

            this.$confirm('The selected files will be removed, continue?', 'Warning', {
                confirmButtonText: 'Confirm',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(() => {
                for (let item of checkedNodes) {
                    if (this.isRootNode(item.fileId)) {
                        continue
                    }

                    let options = this.$store.getters['auth/authOptions']
                    options = Object.assign(options,
                        {
                            params: {
                                fileId: item.fileId
                            }
                        })

                    axios.delete(this.hostUrl + '/api/files', options)
                        .then(res => {
                            if (res.data.code === '0') {
                                let node = this.$refs.fileTree.getNode(res.data.data.fileId)
                                if (node !== null) {
                                    this.$refs.fileTree.remove(node)
                                    this.$message({
                                        message: `File removed`,
                                        type: 'success'
                                    })
                                }
                            }
                        })
                        .catch(err => {
                            this.$message.error(`Failed to delete ${err.fileId}`)
                        })
                }
            }).catch(() => {
            })
        },
        translateCheckedFiles: function() {
            let checkedNodes = this.$refs.fileTree.getCheckedNodes(true, false)
            if (checkedNodes.length === 0) {
                this.$message('Please check the items first')
                return
            }

            this.$confirm('The selected files will be translated, continue?', 'Warning', {
                confirmButtonText: 'Confirm',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(() => {
                for (let item of checkedNodes) {
                    if (this.isRootNode(item.fileId) || item.isTranslated === true) {
                        continue
                    }

                    let data = {
                        name: item.name,
                        fileId: item.fileId
                    }

                    let options = this.$store.getters['auth/authOptions']
                    axios.post(this.hostUrl + '/api/translate', data, options)
                        .then(res => {
                            if (res.data.code === '0') {
                                let fileInfo = res.data.data
                                fileInfo.isCompleted = false
                                this.translatingFileInfoList.push(fileInfo);
                            }
                        })
                        .catch(err => {
                            console.log(err)
                        })
                }
            }).catch(() => {
            })
        },
        isRootNode(key) {
            if (key === this.translatedNodeKey || key === this.untranslatedNodeKey) {
                return true
            }

            return false
        },
        checkTranslateStatus: function() {
            for (let fileInfo of this.translatingFileInfoList) {
                if (fileInfo.isCompleted === false) {
                    let options = this.$store.getters['auth/authOptions']
                    options = Object.assign(options,
                        {
                            params: {
                                fileId: fileInfo.fileId
                            }
                        })
                    axios.get(this.hostUrl + '/api/translate', options).then(res => {
                        console.log(res.data)
                        if (res.data.code === '0' && res.data.data.isTranslated === true) {
                            fileInfo.isCompleted = true
                            this.$message({
                                message: `Successfully translated ${fileInfo.name}`,
                                type: 'success'
                            })
                            this.$refs.fileTree.remove(res.data.data.fileId)
                            this.$refs.fileTree.append(fileInfo, this.translatedNodeKey)
                        }
                    }).catch(err => {
                        console.log('ee' + err)
                    })
                }
            }

            this.translatingFileInfoList = this.translatingFileInfoList.filter((item) => {
                return item.isCompleted === false
            })
        }
    },
    mounted: function() {
        if (this.$store.state.user.isSignedIn === false) {
            return
        }

        this.$refs.fileTree.data.push(
            {
                fileId: this.translatedNodeKey,
                name: 'Translated Files'
            })

        this.$refs.fileTree.data.push(
            {
                fileId: this.untranslatedNodeKey,
                name: 'Untranslated Files'
            })

        this.checkTranslateStatusTimer = setInterval(this.checkTranslateStatus, 15 * 1000)
        axios.get(this.hostUrl + '/api/files', this.$store.getters['auth/authOptions'])
            .then((fileRes) => {
                if (fileRes.data.code === '0') {
                    this.$store.commit('businessData/setFileInfoList', fileRes.data.data)
                    this.init()
                }
            })
            .catch((fileRes) => {
                console.log('err', fileRes);
            })
    },
    created: function() {
    },
    beforeDestroy: function() {
        clearInterval(this.checkTranslateStatusTimer)
        this.checkTranslateStatusTimer = ''
    },
    components: {
        'file-viewer': FileViewer,
        'upload-dialog': UploadDialog
    }
}

</script>

<style scoped>
* {
   text-align: left;
}

h1 {
    font-weight: normal;
    text-align: center;
}

.el-tree {
    display: inline-block;
    white-space: nowrap;
    overflow-x: scroll;
}

.flex-container {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
    position: relative;
}

.el-main {
    padding: 0px 0px 0px 5px;
}

.el-scrollbar .el-scrollbar__wrap .el-scrollbar__view{
   white-space: nowrap;
   overflow-x: scroll;
   overflow-y: scroll;
}

.file-management-bar {
    padding: 8px 2px;
    background-color: #f3f7f7;
    /* background-color: #ecf7f5; */
}

.no-view-token-hint {
    position: relative;
    top: 35%;
}
</style>