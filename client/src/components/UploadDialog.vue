<template>
    <el-dialog
        title="Info"
        width="400px"
        :visible.sync="dialogVisible"
        :before-close="handleClose">
        <el-upload
            class="upload-demo"
            drag
            :action="hostUrl + '/api/files/'"
            :headers="authHeader"
            :on-success="onSuccess"
            :on-error="onError"
            :on-progress="onProgress"
            multiple>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">Drop a file，or <em>click to upload</em></div>
            <div class="el-upload__tip" slot="tip">Please upload with authorized file extensions</div>
        </el-upload>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="dialogVisible = false">Confirm</el-button>
        </span>
    </el-dialog>
</template>

<script>
import {mapState} from 'vuex'

export default {
    data() {
        return {
            dialogVisible: false,
            authHeader: this.$store.getters['auth/authHeader']
        };
    },
    computed: {
        ...mapState('configs', {
            hostUrl: state => state.hostUrl
        })
    },
    methods: {
        handleClose(done) {
            done()
        },
        onSuccess(res, file, fileList) {
            console.log(res)
            if (res.code === '0') {
                this.$emit('fileUploaded', res.data)
            }
        },
        onError(err, file, fileList) {
            console.log(err)
            this.$message.error('Upload file error')
        },
        onProgress(event, file, fileList) {

        }
    }
};
</script>