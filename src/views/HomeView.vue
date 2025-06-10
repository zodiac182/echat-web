<template>
    <el-button @click="goToTest2">李四工单测试</el-button>
    <el-button @click="goToServiceTest">客服测试</el-button>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
function goToTest2() {
    router.push(
        {
            name: 'user',
            query: {
                userName: '李四',
                userId: "18181818181",
                ticketId: "171",
                toUserId: "haowen",
                toUserName: "田浩文"
            },
        }
    );
}

function goToServiceTest() {
    router.push(
        {
            name: 'service',
            query: {
                userId: "haowen",
                userName: "田浩文"
            },
        }
    );
}
</script>