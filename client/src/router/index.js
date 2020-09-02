import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import FileManagement from '@/components/FileManagement'
import SignUp from '@/components/SignUp'
import SignIn from '@/components/SignIn'
import UserInfoSettings from '@/components/UserInfoSettings'

Vue.use(Router)

const router = new Router({
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/file-management',
            name: 'fileManagement',
            component: FileManagement,
            meta: {
                requireAuth: true
            }
        },
        {
            path: '/sign-up',
            name: 'signUp',
            component: SignUp
        },
        {
            path: '/sign-in',
            name: 'signIn',
            component: SignIn
        },
        {
            path: '/user-info-settings',
            name: 'userInfoSettings',
            component: UserInfoSettings
        }
    ]
})

export default router