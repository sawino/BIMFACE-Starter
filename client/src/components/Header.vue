<template>
    <div>
        <router-link :to="{path:'/'}">
            <el-image :src="logoSource" class='head-logo'></el-image>
        </router-link>
        <el-menu style="float:left" class="menu" :router="true" :default-active="activeIndex" mode="horizontal" @select="handleSelect">
            <el-menu-item index="/">Home</el-menu-item>
            <el-submenu index="">
              <template slot="title">Data Management</template>
              <el-menu-item index="/file-management">File Management </el-menu-item>
            </el-submenu>
        </el-menu>
        <el-dropdown class="right-menu" v-show="isSignedIn" @command="handleCommand">
            <span class="el-dropdown-link menu-font-color">
                {{name}}<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="updateSettings">Settings</el-dropdown-item>
                <el-dropdown-item command="logOut" divided>Log out</el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
        <router-link class="right-menu menu-font-color" :to="{path:'/sign-up'}" v-show="!isSignedIn">
            Sign Up
        </router-link>
        <router-link class="right-menu menu-font-color" :to="{path:'/sign-in'}" v-show="!isSignedIn">
            Sign in
        </router-link>
    </div>
</template>
<script>
import {mapState} from 'vuex'

export default {
    data() {
        return {
            logoSource: './static/images/bimface-logo.png',
            activeIndex: '1'
        };
    },
    computed: {
        ...mapState('user', {
            isSignedIn: state => state.isSignedIn,
            name: state => state.name
        })
    },
    methods: {
        handleSelect(key, keyPath) {
        },
        handleCommand(command) {
            if (command === 'logOut') {
                this.logOut()
            } else if (command === 'updateSettings') {
                this.$router.push('/user-info-settings')
            }
        },
        signIn() {
            console.log(this.isSignedIn);
            this.$refs.signInDialog.isVisible = true;
        },
        signUp() {

        },
        logOut() {
            let user = {
                name: '',
                token: '',
                isSignedIn: false,
                email: ''
            }

            this.$store.commit('user/setUser', user)
            this.$store.commit('businessData/setFileInfoList', [])
            this.$router.replace('/')
        }
    },
    components: {
    }
}
</script>

<style scoped>
.el-dropdown {
    vertical-align: middle;
}

.el-dropdown-link {
    cursor: pointer;
}

.el-icon-arrow-down {
    font-size: 12px;
}

.right-menu {
    float: right;
    line-height: 60px;
    margin-left: 10px;
}

.head-logo {
    margin-top: 10px;
    float:left;
    line-height: 60px;
    cursor: pointer;
}

.menu {
    background-color: whitesmoke;
}
</style>
