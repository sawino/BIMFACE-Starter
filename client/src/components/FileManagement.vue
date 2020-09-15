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
                <el-input style="width:110px;margin: 0 10px;" size="mini" placeholder="Search..." v-model="filterText"></el-input>
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
                    :filter-node-method="filterNode"
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
            noViewToken: true,
            filterText: '',
            translatedNodeKey: 'TranslatedFiles',
            untranslatedNodeKey: 'UntranslatedFiles',
            translatingNodeKey: 'TranslatingFiles',
            failedNodeKey: 'FailedFiles',
            hasReset: 'true',
            defaultProps: {
                label: 'name'
            },
            treeData: []
        }
    },
    watch: {
        filterText(val) {
            this.$refs.fileTree.filter(val)
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
            let translatingFileInfoList = []
            let failedFileInfoList = []

            this.fileInfoList.forEach((item) => {
                switch (item.status) {
                case 'translated':
                    translatedFileInfoList.push(item)
                    break
                case 'uploaded':
                    untranslatedFileInfoList.push(item)
                    break
                case 'translating':
                    translatingFileInfoList.push(item)
                    break
                case 'failed':
                    failedFileInfoList.push(item)
                    break
                default:
                    untranslatedFileInfoList.push(item)
                }
            })

            this.$refs.fileTree.updateKeyChildren(this.translatedNodeKey, translatedFileInfoList);
            this.$refs.fileTree.updateKeyChildren(this.untranslatedNodeKey, untranslatedFileInfoList);
            this.$refs.fileTree.updateKeyChildren(this.translatingNodeKey, translatingFileInfoList);
            this.$refs.fileTree.updateKeyChildren(this.failedNodeKey, failedFileInfoList)
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
        filterNode(value, data) {
            if (!value || this.isRootNode(data.fileId)) return true;
            return data.name.indexOf(value) !== -1;
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
                    if (this.isRootNode(item.fileId) || item.status === 'translated' || item.status === 'translating') {
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
                                this.$refs.fileTree.remove(fileInfo.fileId)
                                this.$refs.fileTree.append(fileInfo, this.translatingNodeKey)
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
            if (key === this.translatedNodeKey ||
                key === this.untranslatedNodeKey ||
                key === this.translatingNodeKey ||
                key === this.failedNodeKey) {
                return true
            }

            return false
        },
        checkTranslateStatus: function() {
            let translatingFilesParentNode = this.$refs.fileTree.getNode(this.translatingNodeKey)
            let translatingFilesNodes = translatingFilesParentNode.childNodes
            for (let fileNode of translatingFilesNodes) {
                let fileInfo = fileNode.data
                let options = this.$store.getters['auth/authOptions']
                options = Object.assign(options,
                    {
                        params: {
                            fileId: fileInfo.fileId
                        }
                    })
                axios.get(this.hostUrl + '/api/translate', options).then(res => {
                    if (res.data.code === '0') {
                        fileInfo.status = res.data.data.status
                        if (fileInfo.status === 'translated') {
                            this.$message({
                                message: `Successfully translated ${fileInfo.name}`,
                                type: 'success'
                            })
                            this.$refs.fileTree.remove(res.data.data.fileId)
                            this.$refs.fileTree.append(fileInfo, this.translatedNodeKey)
                        } else if (fileInfo.status === 'failed') {
                            this.$message.error(`Failed to translate ${fileInfo.name}`)
                            this.$refs.fileTree.remove(res.data.data.fileId)
                            this.$refs.fileTree.append(fileInfo, this.failedNodeKey)
                        }
                    }
                }).catch(err => {
                    console.log('ee' + err)
                })
            }
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

        this.$refs.fileTree.data.push(
            {
                fileId: this.translatingNodeKey,
                name: 'Translating Files'
            })

        this.$refs.fileTree.data.push(
            {
                fileId: this.failedNodeKey,
                name: 'Failed Files'
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