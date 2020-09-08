/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-undef */
import BaseCommandHandler from './BaseCommandHandler'
import axios from 'axios'

class FileViewerCommandHandler extends BaseCommandHandler {
    constructor(name, fileViewer) {
        super(name)
        this.fileViewer = fileViewer
        this.handlers = this.fileViewer.commandHandlers
    }

    load() {
        this.handlers[this.name] = this
    }

    unload() {
        delete this.handlers[this.name]
    }
}

class ModelClickHandler extends FileViewerCommandHandler {
    activate() {
        this.fileViewer.activeClickHandler = this
        this.fileViewer.isShowMenu = false
    }

    run(eventArgs) {
        this.runCore(eventArgs)
    }

    runCore(eventArgs) {

    }
}

class SelectHandler extends ModelClickHandler {
    constructor(fileViewer) {
        super('Select', fileViewer)
    }
}

class AddTagHandler extends ModelClickHandler {
    constructor(fileViewer) {
        super('AddTag', fileViewer)
    }

    runCore(eventArgs) {
        this.fileViewer.isDirty = true;
        let text = `Object ID: ${eventArgs.objectId}`;
        this.addTag(text, eventArgs.worldPosition, this.fileViewer.viewer, eventArgs.objectId)
    }

    addTag(text, worldPosition, viewer, objectId) {
        var config = new Glodon.Bimface.Plugins.Drawable.LeadLabelConfig();
        config.offset = {x: 27, y: -47};
        config.text = text;
        config.objectId = objectId;
        config.worldPosition = worldPosition;
        config.draggable = true;
        config.viewer = viewer;

        let tag = new Glodon.Bimface.Plugins.Drawable.LeadLabel(config);
        tag.onClick((item) => {
            this.fileViewer.selectedTag = item
        })
        this.fileViewer.tagContainer.addItem(tag)
    }
}

class RemoveTagHandler extends FileViewerCommandHandler {
    constructor(fileViewer) {
        super('RemoveTag', fileViewer)
    }

    run() {
        if (this.fileViewer.selectedTag !== null) {
            this.fileViewer.tagContainer.removeItemById(this.fileViewer.selectedTag.getId())
            this.fileViewer.selectedTag = null
        } else {
            this.fileViewer.$message('Select a tag before removing')
        }
    }
}

class SaveHandler extends FileViewerCommandHandler {
    constructor(fileViewer) {
        super('Save', fileViewer)
    }

    run () {
        return new Promise((resolve, reject) => {
            if (!this.fileViewer.isDirty) {
                resolve()
                return
            }

            // save state
            this.fileViewer.customData.currentState = this.fileViewer.viewer.getCurrentState()
            // save tag
            this.fileViewer.customData.tags = []
            let allTags = this.fileViewer.tagContainer.getAllItems()

            allTags.forEach(item => {
                this.fileViewer.customData.tags.push({
                    text: item.getText(),
                    worldPosition: item.worldPosition,
                    objectId: item.getObjectId()
                })
            })

            let data = {
                name: '', // we can custom the name
                fileId: this.fileViewer.fileId,
                content: this.fileViewer.customData
            }
            let options = this.fileViewer.$store.getters['auth/authOptions']
            axios.put(this.fileViewer.hostUrl + '/api/fileCustomData', data, options)
                .then(res => {
                    if (res.data.code === '0') {
                        this.fileViewer.isDirty = false
                        this.fileViewer.$message({
                            message: 'Save successfully',
                            type: 'success'
                        })
                        resolve()
                    } else {
                        this.fileViewer.$message.error('Save failed')
                        reject({})
                    }
                })
                .catch(err => {
                    console.log(err)
                    this.fileViewer.$message.error(err)
                    reject()
                })
        })
    }
}

class LoadHandler extends FileViewerCommandHandler {
    constructor(fileViewer) {
        super('Load', fileViewer)
    }

    run () {
        let options = this.fileViewer.$store.getters['auth/authOptions']
        options = Object.assign(options,
            {
                params: {
                    fileId: this.fileViewer.fileId
                }
            })

        axios.get(this.fileViewer.hostUrl + '/api/fileCustomData', options)
            .then(res => {
                if (res.data.code === '0' && res.data.data.length > 0) {
                    let data = res.data.data[0]
                    this.fileViewer.customData = JSON.parse(data.content)
                    this.fileViewer.customData.tags.forEach(item => {
                        this.handlers['AddTag'].addTag(item.text, item.worldPosition, this.fileViewer.viewer, item.objectId)
                    })

                    this.fileViewer.viewer.setState(this.fileViewer.customData.currentState, (args) => {
                        this.fileViewer.viewer.render()
                    })
                }
            })
            .catch(err => {
                this.$message.error(err)
            })
    }
}

class AutoRotateHandler extends FileViewerCommandHandler {
    constructor(fileViewer) {
        super('AutoRotate', fileViewer)
        this.isStartAutoRotate = false
    }

    run() {
        this.isStartAutoRotate = !this.isStartAutoRotate
        if (this.isStartAutoRotate) {
            this.fileViewer.viewer.startAutoRotate(5)
        } else {
            this.fileViewer.viewer.startAutoRotate(0)
        }
    }
}

class FullScreenHandler extends FileViewerCommandHandler {
    constructor(fileViewer) {
        super('FullScreen', fileViewer)
    }

    run(domElement) {
        if (domElement === null || domElement === undefined) {
            return
        }

        if (this.isFullScreen()) {
            this.exitFullScreen()
        } else {
            this.enterFullScreen(domElement)
        }
    }

    enterFullScreen(ele) {
        if (ele.requestFullscreen) {
            ele.requestFullscreen();
        } else if (ele.mozRequestFullScreen) {
            ele.mozRequestFullScreen();
        } else if (ele.webkitRequestFullscreen) {
            ele.webkitRequestFullscreen();
        } else if (ele.msRequestFullscreen) {
            ele.msRequestFullscreen();
        }
    }

    exitFullScreen() {
        if (document.exitFullScreen) {
            document.exitFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    isFullScreen() {
        return !!(
            document.fullscreen ||
            document.mozFullScreen ||
            document.webkitIsFullScreen ||
            document.webkitFullScreen ||
            document.msFullScreen);
    }
}
export {
    SelectHandler,
    AddTagHandler,
    SaveHandler,
    LoadHandler,
    AutoRotateHandler,
    RemoveTagHandler,
    FullScreenHandler
}