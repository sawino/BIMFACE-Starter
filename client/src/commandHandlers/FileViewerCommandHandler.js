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
        let text = `ID: ${eventArgs.objectId} Type: ${eventArgs.objectType}`;
        let tag = this.createTag(text, eventArgs.worldPosition, this.fileViewer.viewer)
        this.fileViewer.tagContainer.addItem(tag)
    }

    createTag(text, worldPosition) {
        let config = new Glodon.Bimface.Plugins.Drawable.CustomItemConfig();
        config.content = this.createTagContent(text);
        config.worldPosition = worldPosition;
        config.viewer = this.fileViewer.viewer;
        return new Glodon.Bimface.Plugins.Drawable.CustomItem(config)
    }

    createTagContent(text) {
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
                    innerText: item.config.content.innerText,
                    worldPosition: item.worldPosition
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
                        let tag = this.handlers['AddTag'].createTag(item.innerText, item.worldPosition)
                        this.fileViewer.tagContainer.addItem(tag);
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
export {SelectHandler, AddTagHandler, SaveHandler, LoadHandler, AutoRotateHandler}