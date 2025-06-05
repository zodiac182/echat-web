<template>
    <div class="viewer-overlay" @click="close">
        <img :src="url" class="viewer-image" />
    </div>
</template>

<script setup>
import { defineEmits } from 'vue'


const props = defineProps({
    url: String
})

// 定义事件（推荐显式声明）
const emit = defineEmits(['close'])

function close() {
    emit('close')
}


</script>

<style scoped>
.viewer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.viewer-image {
    max-width: 90vw;
    max-height: 90vh;
}
</style>