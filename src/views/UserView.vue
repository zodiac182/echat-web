<template>
    <div style="height:100vh; width:100vw;">
        <ChatWindow ref="chatWindow" :userId="myId" :userName="myName" :ticketId="ticketId" :toUserId="toUserId"
            :toUserName="toUserName"></ChatWindow>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ChatWindow from '@/components/ChatWindow.vue'

const chatWindow = ref(null)

const route = useRoute()

const myId = route.query.userId
const myName = route.query.userName
const toUserId = route.query.toUserId
const toUserName = route.query.toUserName
const ticketId = route.query.ticketId

onMounted(() => {
    chatWindow.value.connectChat()
})
</script>
