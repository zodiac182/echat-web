<template>
    <el-container style="height: 100vh; width:100%;">
        <!-- 左侧工单列表 -->
        <el-aside style="height: 100vh;  border: 1px solid var(--el-border-color); border-radius: 5px;">
            <el-scrollbar height="100%">
                <el-menu @select="handleSelect" class="ticket-menu" active-text-color="#ffd04b"
                    background-color=var(--el-menu-bg-color) text-color="#dddddd" default-active=''>
                    <el-menu-item v-for="(ticket, index) in tickets" :key="ticket.ticketId" :index="String(index)"
                        style="background-color: #333333;">
                        <div class="menu-item-content">
                            <div class="title">
                                <div>
                                    {{ truncateText(ticket.title, 10) }}
                                    <el-badge class="unread-badge" :show-zero=false :max="99"
                                        :value="ticket.unreadMsgCount">
                                    </el-badge>
                                </div>
                                <div>
                                    <span>{{ ticket.createBy }}</span>
                                    <el-tooltip :content="ticket.onlineStatus ? '在线' : '离线'" placement="top">
                                        <el-icon>
                                            <UserFilled :color="ticket.onlineStatus ? '#00FF00' : '#A9A9A9'" />
                                        </el-icon>
                                    </el-tooltip>

                                </div>
                            </div>
                            <div class="subtitle">
                                <!-- <div>
                                    内容：{{ truncateText(ticket.description, 10) }}
                                </div> -->
                                <div>工单号：
                                    {{ ticket.ticketId }}
                                </div>
                            </div>

                        </div>

                    </el-menu-item>
                </el-menu>

            </el-scrollbar>
        </el-aside>
        <!-- 右侧聊天窗口 -->
        <el-main style=" padding:0;">
            <ChatWindow ref="chatWindow" v-if="ticketId" :userId="userId" :userName="userName" :toUserId="toUserId"
                :toUserName="toUserName" :ticketId="ticketId" />
        </el-main>
    </el-container>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue'
import ChatWindow from '@/components/ChatWindow.vue'
import { getMgrWebSocketUrl } from '@/utils/api'
import { useRoute } from 'vue-router'
import { UserFilled } from '@element-plus/icons-vue'

const route = useRoute()
const chatWindow = ref(null)

const tickets = ref([])

const userId = ref(route.query.userId)
const userName = ref(route.query.userName)

const toUserId = ref('')
const toUserName = ref('')
const ticketId = ref('')
// const selectedTicket = ref()

const mgrWS = ref(null)
const isConnected = ref(false)

// 截取函数
const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

async function handleSelect(index) {
    const selectedTicket = tickets.value[index]

    if (selectedTicket.ticketId === ticketId.value) {
        console.log("当前工单已选中")
        return
    }

    // 更新绑定的数据
    toUserId.value = selectedTicket.createrId
    toUserName.value = selectedTicket.createBy
    ticketId.value = selectedTicket.ticketId

    tickets.value[index].unreadMsgCount = 0
    // 等数据传递给 ChatWindow
    await nextTick()

    // 等待旧的 WebSocket 断开
    await chatWindow.value.reset()

    // 再连接新的 WebSocket
    chatWindow.value.connectChat()
}

onMounted(() => {
    // getTickets()
    connectMgrWebSocket()
})

function connectMgrWebSocket() {
    // 连接 WebSocket
    // 监听消息并解析
    // 将消息push到消息列表中
    // 建立连接之后首先获取历史消息
    console.log('新建MGR websocket', userId.value)
    if (!userId.value) return

    mgrWS.value = new WebSocket(`${getMgrWebSocketUrl()}?userId=${userId.value}`)

    mgrWS.value.onopen = () => {
        isConnected.value = true
        console.log('MGR WebSocket 已连接', userId.value)
    }

    mgrWS.value.onmessage = (event) => {
        const content = event.data
        parseMessage(content)

    }

    mgrWS.value.onclose = () => {
        isConnected.value = false
        console.log('MGR WebSocket 已关闭', userId.value)
    }

    mgrWS.value.onerror = () => {
        console.log('MGR WebSocket 发生错误')
    }
}

function parseMessage(raw) {
    let data;
    try {
        data = JSON.parse(raw); // 关键步骤：解析 JSON 字符串成对象
    } catch (e) {
        console.error('解析失败:', e);
        return [null, null];
    }
    tickets.value = data
}


// websocket ping
setInterval(() => {
    if (mgrWS.value && mgrWS.value.readyState === WebSocket.OPEN) {
        // 发送ping消息
        mgrWS.value.send('ping');
    }
}, 30000);

</script>

<style scoped>
.menu-item-content {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
    width: 100%;
}

.title {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
}

.subtitle {
    font-size: 0.8rem;
    margin-left: 10px;
    margin-top: 5px;
    color: #ffffff90;
}

.ticket-menu {
    border-right: 1px;
    height: 100vh;
    /* --el-menu-text-color: #fff;
    --el-menu-active-color: #ffd04b;
    --el-menu-bg-color: #545c64; */
}


.unread-badge {
    margin-left: 5px;
    /* --el-badge-bg-color: red; */

}

.el-menu-item {
    border-bottom: 1px solid #ffffff20;
    margin-bottom: 1px;
    /* margin-top: 5px; */
    /* 可选，增加一点间距 */
}

.el-menu-item.is-active {
    background-color: #545c64 !important;
}
</style>
background-color: red;