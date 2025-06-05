<template>
    <el-button @click="goToTest1">张三工单号abcd测试</el-button>
    <el-button @click="goToTest2">李四工单2（1234）测试</el-button>
    <el-button @click="goToServiceTest">客服测试</el-button>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
function goToTest1() {
    router.push(
        {
            name: 'user',
            query: {
                userName: encodeURIComponent('张三'),
                userId: "zhangsan",
                ticketId: "ABCD-202506041312541256",
                toUserId: "admin",
                toUserName: "客服"
            },
        }
    );
}
function goToTest2() {
    router.push(
        {
            name: 'user',
            query: {
                userName: '李四',
                userId: "lisi",
                ticketId: "1234",
                toUserId: "admin",
                toUserName: "客服"
            },
        }
    );
}

function goToServiceTest() {
    router.push(
        {
            name: 'service',
            query: {
                userId: "admin",
                userName: "客服"
            },
        }
    );
}
</script>