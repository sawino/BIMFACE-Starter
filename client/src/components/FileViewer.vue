<template>
    <div class="full-canvas file-view">
        <div class="file-view-toolbar" v-if="isViewLoaded">
            <el-row ref="mainToolbarBar">
                <el-tooltip content="Toogle Menu" effect="light">
                    <el-button ref="menuSwitchButton" @click="onMenuSwitchButtonClicked" icon="el-icon-menu" v-bind:class='{"dummy-button":!isShowMenu}'></el-button>
                </el-tooltip>
                <el-tooltip content="Save" effect="light">
                    <el-button @click="onSaveButtonClicked" icon="el-icon-upload2" v-if="isShowMenu"></el-button>
                </el-tooltip>
            </el-row>
            <el-row ref="subToolbar" v-show="isShowMenu">
                <el-tooltip content="Toggle rotate" effect="light">
                    <el-button @click="onToggleRotateButtonClicked" icon="el-icon-loading"></el-button>
                </el-tooltip>
                <el-tooltip content="Toggle add tag" effect="light">
                    <el-button @click="onToggleAddTagButtonClicked" icon="el-icon-location-outline"></el-button>
                </el-tooltip>
            </el-row>
        </div>
        <div id="viewContainer" class="full-canvas"></div>
    </div>
</template>

<script>
import axios from 'axios'
import {mapState} from 'vuex'
/* eslint-disable */ 
export default {
    data: function () {
        return {
            isShowMenu: false,
            isViewLoaded: false,
            viewer: null,
            viewToken: '',
            app: null,
            isStartAutoRotate: false,
            isAddTag: false,
            isDirty: false,
            tagContainer: null,
            fileId: '',
            customData: {
                currentState: {},
                tags: []
            }
        }
    },
    computed: {
        ...mapState('configs', {
            hostUrl: state => state.hostUrl
        })
    },
    methods: {
        showModel: function (viewToken, fileId) {
            var loaderConfig = new BimfaceSDKLoaderConfig();
            loaderConfig.viewToken = viewToken;
            this.fileId = fileId
            this.viewToken = viewToken;
            BimfaceSDKLoader.load(loaderConfig, this.onMetaLoaded, this.onMetaLoadFailed);
        },
        onMetaLoaded: function(viewMetaData) {
            var viewContainer = document.getElementById('viewContainer');
            // we handle 3d models for now
            if (viewMetaData.viewType == '3DView') {
                var webAppConfig = new Glodon.Bimface.Application.WebApplication3DConfig();
                webAppConfig.domElement = viewContainer;    
                this.app = new Glodon.Bimface.Application.WebApplication3D(webAppConfig);    
                this.app.addView(this.viewToken);
                this.viewer = this.app.getViewer();
                this.viewer.addEventListener(Glodon.Bimface.Viewer.Viewer3DEvent.ViewAdded, this.onViewLoaded);
            } else {
                // leave others to show only
                var viewContainer = document.getElementById('viewContainer');
                new Glodon.Bimface.Application.WebApplicationDemo(viewMetaData, viewContainer);
            }
        },
        onViewLoaded: function(args) {
            this.isViewLoaded = true;
            this.isDirty = true;
            this.resetData()
            var drawableContainerConfig = new Glodon.Bimface.Plugins.Drawable.DrawableContainerConfig();
            drawableContainerConfig.viewer = this.viewer;
            this.tagContainer = new Glodon.Bimface.Plugins.Drawable.DrawableContainer(drawableContainerConfig);

            let options = this.$store.getters['auth/authOptions']
            options = Object.assign(options,
                {
                    params: {
                        fileId: this.fileId
                    }   
                })

            axios.get(this.hostUrl + '/api/fileCustomData', options)
                .then(res => {
                    if (res.data.code === '0' && res.data.data.length > 0) {
                        let data = res.data.data[0]
                        this.customData = JSON.parse(data.content)
                        this.load()
                    }
                })
                .catch(err => {
                    this.$message.error(err)
                })
        },
        createTag: function(text, worldPosition, viewer) {
            let config = new Glodon.Bimface.Plugins.Drawable.CustomItemConfig();
            config.content = this.createTagContent(text);
            config.worldPosition = worldPosition;
            config.viewer = viewer;
            return new Glodon.Bimface.Plugins.Drawable.CustomItem(config)
        },
        createTagContent: function(text) {
            var content = document.createElement('div');
            content.innerText = text;
            // tag size
            content.style.width = '200px';
            content.style.height = '28px';
            // tag style
            content.style.border = 'solid';
            content.style.borderColor = '#000000';
            content.style.borderWidth = '2px';
            content.style.borderRadius = '5%';
            content.style.background = '#AAAA99';
            // tag content style
            content.style.color = '#FFFFFF';
            content.style.textAlign = 'left';
            content.style.lineHeight = '24px';
            return content;
        },
        onMetaLoadFailed: function(error) {
            console.log(error)
        },
        onMenuSwitchButtonClicked: function () {
            this.isShowMenu = !this.isShowMenu
        },
        onSaveButtonClicked: function() {
            this.save()
        },
        onToggleRotateButtonClicked: function() {
            this.isStartAutoRotate = !this.isStartAutoRotate
            if (this.isStartAutoRotate) {
                this.viewer.startAutoRotate(5)
            } else {
                this.viewer.startAutoRotate(0)
            }
        },
        onToggleAddTagButtonClicked: function() {
            this.isAddTag = !this.isAddTag
            if (this.isAddTag) {
                this.viewer.addEventListener(Glodon.Bimface.Viewer.Viewer3DEvent.MouseClicked, this.onAddTagInvoked);
            } else {
                this.viewer.removeEventListener(Glodon.Bimface.Viewer.Viewer3DEvent.MouseClicked, this.onAddTagInvoked);
            }
        },
        onAddTagInvoked: function(args) {
            this.isDirty = true;
            let text = `ID: ${args.objectId} Type: ${args.objectType}`;
            let tag = this.createTag(text, args.worldPosition, this.viewer)
            this.tagContainer.addItem(tag)
        },
        resetData: function() {
            this.tagContainer = null,
            this.customData = {
                currentState: {},
                tags: []
            }
        },
        load: function() {
            this.customData.tags.forEach(item => {
                let tag = this.createTag(item.innerText, item.worldPosition, this.viewer)
                this.tagContainer.addItem(tag);
            })
            
            this.viewer.setState(this.customData.currentState, (args) => {
                this.viewer.render()
            })
        },
        save: function() {
            return new Promise((resolve, reject) => {
                if (!this.isDirty) {
                    resolve()
                    return
                }

                // save state
                this.customData.currentState = this.viewer.getCurrentState()
                // save tag
                this.customData.tags = []
                let allTags = this.tagContainer.getAllItems()
                allTags.forEach(item => {
                    this.customData.tags.push({
                        innerText: item.config.content.innerText,
                        worldPosition: item.worldPosition
                    })
                })

                let data = {
                    name: '', // we can custom the name
                    fileId: this.fileId,
                    content: this.customData
                }
                let options = this.$store.getters['auth/authOptions']
                axios.put(this.hostUrl + '/api/fileCustomData', data, options)
                    .then(res => {
                        if (res.data.code === '0') {
                            this.isDirty = false
                            this.$message({
                                message: "Save successfully",
                                type: "success"
                            })
                            resolve()
                        } else {
                            this.$message.error("Save failed")
                            reject()
                        }
                    })
                    .catch(err => {
                        console.log(err)
                        this.$message.error(err)
                        reject()
                    })
            })

        }
    },
    beforeDestroy: function() {
        // auto save
        this.save()
    }
}

</script>

<style scoped>

* {
    margin: 0;
    padding: 0;
}

.full-canvas {
    height: 100%;
    width: 100%;
}

.file-view-toolbar {
    position: relative;
    /* top: 20px; */
    z-index: 999;
    height: 0px;
    top: 8px;
    left: 35%;
}

.file-view {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
    position: relative;
}

#viewContainer {
    flex: 2
}

.el-button {
    height: 50px;
    width: 50px;
    margin: 2px 0;
    color: #EEEEEE;
    font-size: 12px;
    background-color: #000;
    opacity: 0.7;
    border-radius: 0;
}

.dummy-button {
    opacity: 0.1;
}
</style>