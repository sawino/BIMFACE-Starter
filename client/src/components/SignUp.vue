<template>
    <div>
        <el-row type="flex" justify="center">
            <el-col :span="8">
                <el-form :model="ruleForm" width="800px" status-icon :rules="rules" ref="ruleForm" label-width="160px">
                    <el-form-item label="User name" prop="userName">
                        <el-input v-model="ruleForm.userName"></el-input>
                    </el-form-item>
                    <el-form-item label="Email" prop="email">
                        <el-input v-model="ruleForm.email"></el-input>
                    </el-form-item>
                    <el-form-item label="Password" prop="pass">
                        <el-input type="password" v-model="ruleForm.pass" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="Confirm password" prop="checkPass">
                        <el-input type="password" v-model="ruleForm.checkPass" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitForm('ruleForm')">Submitt</el-button>
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
        var validatePass = (rule, value, callback) => {
            if (value !== this.ruleForm.pass) {
                callback(new Error('Password mismatch'));
            } else {
                callback();
            }
        };

        return {
            ruleForm: {
                pass: '',
                email: '',
                checkPass: '',
                userName: ''
            },
            rules: {
                userName: FormValidator.getUserNameValidators(),
                email: FormValidator.getEmailValidators(),
                pass: FormValidator.getPasswordValidators(),
                checkPass: [
                    { validator: validatePass, required: true, trigger: 'blur' }
                ]
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
                    console.log('error submit!!');
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
                password: this.ruleForm.pass,
                email: this.ruleForm.email
            }
            axios.post(this.hostUrl + '/auth/register', data)
                .then(res => {
                    if (res.data.code === '0') {
                        this.$message({
                            message: 'Sign up successfully, redirect to sign in page in 2 seconds',
                            type: 'success'
                        })
                        setTimeout(() => {
                            // this.$refs.ruleForm.disabled = true
                            this.$router.replace('/sign-in')
                        }, 2000)
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