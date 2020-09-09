<template>
    <div>
        <el-row type="flex" justify="center">
            <el-col :span="8">
                <el-form :model="ruleForm" width="800px" status-icon :rules="rules" ref="ruleForm" label-width="160px">
                    <el-form-item label="User name" prop="userName">
                        <el-input v-model="ruleForm.userName" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="Email" prop="email">
                        <el-input v-model="ruleForm.email"></el-input>
                    </el-form-item>
                    <el-form-item label="Password" prop="pass">
                        <el-input type="password" v-model="ruleForm.pass" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="New password" prop="newPass">
                        <el-input type="password" v-model="ruleForm.newPass" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="Confirm password" prop="checkNewPass">
                        <el-input type="password" v-model="ruleForm.checkNewPass" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitForm('ruleForm')">Submitt</el-button>
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
            if (value !== this.ruleForm.newPass) {
                callback(new Error('Password mismatch'));
            } else {
                callback();
            }
        };
        return {
            ruleForm: {
                pass: '',
                email: '',
                newPass: '',
                checkNewPass: '',
                userName: ''
            },
            rules: {
                pass: FormValidator.getPasswordValidators(),
                email: FormValidator.getEmailValidators(),
                newPass: FormValidator.getPasswordValidators(),
                checkNewPass: [
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
        handleConfirm() {
            let data = {
                name: this.ruleForm.userName,
                password: this.ruleForm.pass,
                email: this.ruleForm.email,
                newPassword: this.ruleForm.newPass
            }

            let options = this.$store.getters['auth/authOptions']
            axios.put(this.hostUrl + '/api/users', data, options)
                .then(res => {
                    if (res.data.code === '0') {
                        this.$message({
                            type: 'success',
                            message: 'Settings saved successfully'
                        })
                        this.$store.commit('user/setEmail', res.data.data.email)
                        this.$router.push('/')
                    } else {
                        this.$message.error(res.data.message)
                    }
                })
                .catch(err => {
                    this.$message.error(err)
                })
        }
    },
    mounted: function() {
        console.log(this.$store.state.user)
        this.ruleForm.userName = this.$store.state.user.name;
        this.ruleForm.email = this.$store.state.user.email;
    }
}
</script>

<style scoped>
</style>