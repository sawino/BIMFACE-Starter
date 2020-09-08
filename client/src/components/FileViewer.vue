<template>
    <div class="full-canvas file-view" id="fileViewer">
        <div class="file-view-toolbar" v-if="isViewLoaded">
            <el-row ref="mainToolbarBar">
                <el-tooltip content="Toogle Menu" effect="light" :open-delay="menuOpenDelayValue">
                    <el-button ref="menuSwitchButton" @click="onMenuSwitchButtonClicked" icon="el-icon-menu" v-bind:class='{"dummy-button":!isShowMenu}'></el-button>
                </el-tooltip>
                <el-tooltip content="Save" effect="light" :open-delay="menuOpenDelayValue">
                    <el-button @click="onSaveButtonClicked" icon="el-icon-upload2" v-if="isShowMenu"></el-button>
                </el-tooltip>
            </el-row>
            <el-row ref="clickToolbar" v-show="isShowMenu">
                <el-tooltip content="Select" effect="light" :open-delay="menuOpenDelayValue">
                    <el-button @click="onClickHandlerButtonClicked('Select')" icon="el-icon-top-left"></el-button>
                </el-tooltip>
                <el-tooltip content="Add tag" effect="light" :open-delay="menuOpenDelayValue">
                    <el-button @click="onClickHandlerButtonClicked('AddTag')" icon="el-icon-add-location"></el-button>
                </el-tooltip>
            </el-row>
            <el-row v-show="isShowMenu">
                <el-tooltip content="Toggle rotate" effect="light" :open-delay="menuOpenDelayValue">
                    <el-button @click="onToggleRotateButtonClicked" icon="el-icon-loading"></el-button>
                </el-tooltip>
                <el-tooltip content="Remove Tag" effect="light" :open-delay="menuOpenDelayValue">
                    <el-button @click="onRemoveTagButtonClicked" icon="el-icon-delete-location"></el-button>
                </el-tooltip>
                <el-tooltip content="Toggle Full Screen" effect="light" :open-delay="menuOpenDelayValue">
                    <el-button @click="onToggleFullScreenButtonClicked" icon="el-icon-full-screen"></el-button>
                </el-tooltip>
            </el-row>
        </div>
        <div id="viewContainer" class="full-canvas"></div>
    </div>
</template>

<script>
import {mapState} from 'vuex'
import {
    SelectHandler,
    AddTagHandler,
    SaveHandler,
    LoadHandler,
    RemoveTagHandler,
    AutoRotateHandler,
    FullScreenHandler} from '../commandHandlers/FileViewerCommandHandler'
/* eslint-disable */ 
export default {
    data: function () {
        return {
            commandHandlers: {},
            activeClickHandler: null,
            menuOpenDelayValue: 1500,
            selectedTag: null,
            selectedTag: null,
            isShowMenu: false,
            isViewLoaded: false,
            viewer: null,
            viewToken: '',
            app: null,
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

            this.viewer.addEventListener(Glodon.Bimface.Viewer.Viewer3DEvent.MouseClicked, this.onViewerClicked);
            this.load()
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
            this.commandHandlers['AutoRotate'].run()
        },
        onClickHandlerButtonClicked: function(args) {
            this.commandHandlers[args].activate()
        },
        onViewerClicked: function(args) {
            if (this.activeClickHandler !== null) {
                this.activeClickHandler.run(args)
            }
        },
        onAddTagInvoked: function(args) {
        },
        onRemoveTagButtonClicked: function() {
            this.commandHandlers['RemoveTag'].run()
        },
        onToggleFullScreenButtonClicked: function() {
            let element = document.getElementById('fileViewer')
            this.commandHandlers['FullScreen'].run(element)
        },
        resetData: function() {
            this.tagContainer = null,
            this.customData = {
                currentState: {},
                tags: []
            }
        },
        load: function() {
            this.commandHandlers['Load'].run()
        },
        save: function() {
            this.commandHandlers['Save'].run()
        }
    },
    beforeDestroy: function() {
        // auto save
        this.save()
    },
    mounted: function() {
        new SelectHandler(this).load()
        new AddTagHandler(this).load()
        new SaveHandler(this).load()
        new LoadHandler(this).load()
        new AutoRotateHandler(this).load()
        new RemoveTagHandler(this).load()
        new FullScreenHandler(this).load()
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