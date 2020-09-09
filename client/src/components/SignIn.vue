<template>
    <div>
        <el-row type="flex" justify="center">
            <el-col :span="8">
                <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="160px">
                    <el-form-item label="User name" prop="userName" >
                        <el-input v-model="ruleForm.userName"></el-input>
                    </el-form-item>
                    <el-form-item label="Password" prop="pass">
                        <el-input type="password" v-model="ruleForm.pass" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitForm('ruleForm')">Sign in</el-button>
                        <el-button @click="resetForm('ruleForm')">Reset</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import axios from 'axios'
import {mapState} from 'vuex'
import FormValidator from '../utils/FormValidator'

export default {
    data: function() {
        return {
            ruleForm: {
                pass: '',
                userName: ''
            },
            rules: {
                pass: FormValidator.getPasswordValidators(),
                userName: FormValidator.getUserNameValidators()
            }
        };
    },
    computed: {
        ...mapState('configs', {
            hostUrl: state => state.hostUrl
        })
    },
    methods: {
        submitForm(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.handleConfirm()
                } else {
                    return false;
                }
            });
        },
        resetForm(formName) {
            this.$refs[formName].resetFields();
        },
        handleConfirm() {
            let data = {
                name: this.ruleForm.userName,
                password: this.ruleForm.pass
            }

            axios.post(this.hostUrl + '/auth/login', data)
                .then(res => {
                    if (res.data.code === '0') {
                        let user = res.data.data
                        user.isSignedIn = true
                        this.$store.commit('user/setUser', user)
                        let redirect = this.$router.history.current.query.redirect || ''
                        if (redirect.length > 0) {
                            this.$router.push({path: redirect})
                        } else {
                            this.$router.push({path: '/'})
                        }
                    } else {
                        this.$message.error(res.data.message)
                    }
                })
                .catch(err => {
                    this.$message.error(err)
                })
        }
    }
}
</script>

<style scoped>
</style>