<template>
  <div id="app">
    <el-container width="1200px">
        <el-header>
            <bf-header></bf-header>
        </el-header>
        <el-main>
            <router-view/>
        </el-main>
        <el-footer>
            <bf-footer></bf-footer>
        </el-footer>
    </el-container>
  </div>
</template>

<script>
import header from '@/components/Header'
import footer from '@/components/Footer'

export default {
    name: 'App',
    components: {
        'bf-header': header,
        'bf-footer': footer
    },
    mounted: function() {
    },
    beforeDestroy: function() {
    }
}
</script>

<style>
html, body, #app, .el-container{
    padding: 0px;
    margin: 0px;
    height: 100%;
}

#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* text-align: center; */
    color: #2c3e50;
}

.el-header, .el-footer {
    color: #333;
    text-align: center;
    background-color:whitesmoke;
}

.el-aside {
    /* background-color: #D3DCE6; */
    color: #333;
}

.el-main {
    /* background-color: #E9EEF3; */
    color: #333;
    padding: 5px;
}

.menu-font-color {
    color:#333;
}
</style>
