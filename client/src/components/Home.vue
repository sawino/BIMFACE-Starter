<template>
    <div>
        <div>
            <el-carousel height="600px">
                <el-carousel-item>
                    <el-image class="carousel-image" :src="carouselImageSourceList[0]"></el-image>
                    <h2>we'll be with you</h2>
                </el-carousel-item>
                <el-carousel-item>
                    <el-image class="carousel-image" :src="carouselImageSourceList[1]"></el-image>
                    <h2>to enjoy your view</h2>
                </el-carousel-item>
            </el-carousel>
        </div>
        <h1>
            Go to File Management, Upload and Translate a model file, then enjoy.
        </h1>
    </div>
</template>

<script>
export default {
    data: function () {
        return {
            carouselImageSourceList: [
                './static/images/carousel-walking.jpeg',
                './static/images/carousel-street.jpeg'
            ]
        }
    }
}
</script>

<style scoped>
* {
    text-align: center;
}

 .el-carousel__item h2 {
    position: relative;
    top: -120px;
    color: whitesmoke;
}

.el-image {
    height: 600px;
}
</style>