<template>
    <div class="container">
        <div class="status-container">
            <!-- 状态栏 -->
            <div>
                与 {{ toUserName }}
                <!-- <span v-if="isConnected" style="color: green; font-size:0.8rem;"> [在线]</span>
                <span v-else style="color: red; font-size:0.8rem;">[离线]</span> -->
                聊天中
            </div>
            <div>
                <!-- <el-tooltip content="隐藏聊天窗口" placement="top">
                    <el-button :icon="Minus" style="margin-left:10px" @click="null" size="small" />
                </el-tooltip> -->
                <!-- <el-tooltip content="关闭对话" placement="top">
                    <el-button type="danger" :icon="Close" @click="closeChat" size="small" circle />
                </el-tooltip>

                <el-tooltip content="点击上线" placement="top">
                    <el-button :type="isConnected ? 'success' : 'danger'" style="margin-left:10px"
                        @click="refreshStatus">
                        <span v-if="isConnected" style="color: white;">在线</span>
                        <span v-else style="color: white;">离线</span>
                        <el-icon class="icon-refresh">
                            <Refresh />
                        </el-icon>
                    </el-button>
                </el-tooltip> -->
                <el-dropdown size="small" split-button :type="isConnected ? 'success' : 'danger'"
                    @command="handleStatusCommand">
                    <span v-if="isConnected">在线</span>
                    <span v-else>离线</span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item v-if="!isConnected" command="online">上线</el-dropdown-item>
                            <el-dropdown-item v-if="isConnected" command="offline">下线</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>

        </div>
        <div class="chat-container">
            <!-- 聊天窗口 -->
            <!-- 聊天消息列表 -->
            <el-scrollbar class="scroll-content" ref="scrollRef">
                <div v-for="(msg, index) in messages" :key="index">
                    <div v-if="msg.messageType === 'system'" class="system-message">
                        <!-- 系统消息 -->
                        {{ msg.content }}
                    </div>
                    <div v-else-if="msg.messageType === 'user'" class="chat-block-container">
                        <!-- chat message -->
                        <div :class="msg.fromUserId === myId ? 'chat-self-container' : 'chat-peer-container'">
                            <div class="chat-username">
                                {{ msg.fromUserName }}
                                <span class="chat-time">{{ msg.time }}</span>
                            </div>
                            <div class="chat-message-container">
                                <span v-if="msg.fromUserId === myId" class="message-status">
                                    {{ msg.readStatus ? '已读' : '未读' }}
                                </span>
                                <div v-if="msg.contentType === 'image'" class="message-image"
                                    @click="handleImageClick(getImageUrl(msg.content))">
                                    <!-- 渲染图片消息 -->
                                    <img :src="getImageUrl(msg.content)" @load="scrollToBottom"
                                        style="max-width: 200px; border-radius: 4px;" />
                                </div>
                                <div v-else class="chat-message">{{ msg.content }}</div>

                            </div>
                        </div>
                    </div>
                </div>
            </el-scrollbar>
            <div class="chat-input">
                <!-- 聊天输入框 -->
                <el-input v-model="newMessage" type="textarea" autosize placeholder="输入消息" @keyup.enter="sendMessage"
                    style="margin-right: 10px" />
                <el-tooltip content="上传图片" placement="top" v-if="newMessage.length === 0">
                    <!-- 上传图片 -->
                    <el-upload class="upload-demo" :action="getImgUploadUrl()" name="file" :data="{ ticketId: ticketId }"
                        :show-file-list="false" :on-success="handleUploadSuccess" :before-upload="beforeUpload"
                        :disabled="!isConnected">
                        <el-button type="success" :icon=Plus size="small" circle>
                        </el-button>
                    </el-upload>
                </el-tooltip>
                <el-button v-else type="success" @click="sendMessage" :disabled="!isConnected">发送</el-button>
            </div>
        </div>

        <div>
            <ImageViewer v-if="isViewerOpen" :url="currentImageUrl" @close="isViewerOpen = false" />
        </div>

    </div>
</template>

<script setup>
import { ref, onBeforeUnmount, nextTick, onMounted } from 'vue'
import { ChatLineRound, Refresh, CloseBold, SemiSelect, Minus, Close, Message } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CirclePlus, Plus, CirclePlusFilled } from '@element-plus/icons-vue'
import { getWebSocketUrl, getImgUploadUrl, getImageUrl } from '@/utils/api'
import dayjs from 'dayjs'
import ImageViewer from '@/components/ImageViewer.vue'

const myId = ref('')
const myName = ref('')
const toUserId = ref('')
const toUserName = ref('')
const ticketId = ref('')
const newMessage = ref('')
const messages = ref([])
const chatWebSocket = ref(null)
const isConnected = ref(false)
const scrollRef = ref(null)

const isViewerOpen = ref(false)
const currentImageUrl = ref('')

const props = defineProps({
    userId: String,
    userName: String,
    toUserId: String,
    toUserName: String,
    ticketId: String,
})
const emits = defineEmits(['close '])

defineExpose({ connectChat, reset })

onBeforeUnmount(() => {
    closeChatSocket();
})

function connectChat() {
    if (isConnected.value) {
        console.log('已连接', myId.value, ticketId.value)
        return
    }
    myId.value = props.userId
    myName.value = props.userName
    toUserId.value = props.toUserId
    toUserName.value = props.toUserName
    ticketId.value = props.ticketId
    connectWebSocket()
}

const closeChat = () => {
    ElMessageBox.confirm('确认下线吗?')
        .then(() => {
            closeChatSocket()
        })
        .catch(() => {
            // catch error
        })
}

function handleStatusCommand(command) {
    if (command === 'online') {
        connectChat()
    } else if (command === 'offline') {
        closeChat()
    }
}

// websocket ping
setInterval(() => {
    if (chatWebSocket.value && chatWebSocket.value.readyState === WebSocket.OPEN) {
        // 发送ping消息
        chatWebSocket.value.send(JSON.stringify({
            fromUserId: myId.value,
            ticketId: ticketId.value,
            messageType: "ping",
        }));
    }
}, 10000); // 每10秒发送一次

function connectWebSocket() {
    // 连接 WebSocket
    // 监听消息并解析
    // 将消息push到消息列表中
    // 建立连接之后首先获取历史消息
    console.log('新建websocket', myId.value, ticketId.value)
    if (!myId.value || !ticketId.value) return

    chatWebSocket.value = new WebSocket(`${getWebSocketUrl()}?userId=${myId.value}&userName=${myName.value}&toUserId=${toUserId.value}&toUserName=${toUserName.value}&ticketId=${ticketId.value}`)

    chatWebSocket.value.onopen = () => {
        isConnected.value = true
        console.log('WebSocket 已连接', myId.value, ticketId.value)
    }

    chatWebSocket.value.onmessage = (event) => {
        const content = event.data
        parseMessage(content)

    }

    chatWebSocket.value.onclose = () => {
        isConnected.value = false
        console.log('WebSocket 已关闭', myId.value, ticketId.value)
    }

    chatWebSocket.value.onerror = () => {
        console.log('WebSocket 发生错误')
    }
}

// 显示大图
function handleImageClick(url) {
    currentImageUrl.value = url
    isViewerOpen.value = true
}

function parseMessage(raw) {
    let data;
    try {
        data = JSON.parse(raw); // 关键步骤：解析 JSON 字符串成对象
    } catch (e) {
        console.error('解析失败:', e);
        return [null, null];
    }

    const msgId = data.ID;
    const fromUserId = data.fromUserId;
    const toUserId = data.toUserId;
    const fromUserName = data.fromUserName;
    const msg = data.content;
    const messageType = data.messageType || 'user';
    const time = dayjs(data.CreatedAt).format('YYYY-MM-DD HH:mm:ss');
    const readStatus = data.readStatus;

    if (messageType === 'user') { // 用户消息
        if (msgId) {
            // 更新消息
            const index = messages.value.findIndex(item => item.id === msgId)
            if (index !== -1) {
                messages.value[index].readStatus = readStatus
            } else {
                messages.value.push({ id: msgId, messageType: messageType, fromUserName: fromUserName, fromUserId: fromUserId, toUserId: toUserId, content: msg, contentType: data.contentType, time, readStatus })
            }
        }
    } else {
        messages.value.push({ id: msgId, messageType: messageType, fromUserName: fromUserName, fromUserId: fromUserId, toUserId: toUserId, content: msg, contentType: data.contentType, time, readStatus })

    }
    scrollToBottom()
}

function sendMessage() {
    // 将消息发送给服务器
    // 从服务器接受到推送之后才显示到页面上
    if (!newMessage.value) return

    if (!isConnected.value) {
        ElMessage({
            message: '你当前已离线，请上线后重试。',
            type: 'error',
        })
        return
    }

    // 发送消息到服务器
    chatWebSocket.value.send(JSON.stringify({
        fromUserId: myId.value,
        toUserId: toUserId.value,
        fromUserName: myName.value,
        toUserName: toUserName.value,
        ticketId: ticketId.value,
        messageType: "user",
        content: newMessage.value,
        contentType: 'text',
    }));
    newMessage.value = ''
}

function scrollToBottom() {
    nextTick(() => {
        const scrollEl = scrollRef.value?.$el?.querySelector('.el-scrollbar__wrap')
        if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight
    })
}

function reset() {
    return new Promise((resolve) => {
        if (chatWebSocket.value) {
            chatWebSocket.value.close()
            myId.value = ''
            myName.value = ''
            toUserId.value = ''
            toUserName.value = ''
            ticketId.value = ''
            messages.value = []
            isConnected.value = false
            resolve()
        } else {
            resolve()
        }
    })
}

function closeChatSocket() {
    // 关闭 WebSocket 连接
    if (chatWebSocket.value) {
        console.log('关闭websocket', myId.value, ticketId.value)
        chatWebSocket.value.close()
    }
}



function handleUploadSuccess(response) {
    const imageName = response.fileName; // 后端返回的图片 URL
    sendImageMessage(imageName);
}
function sendImageMessage(imageName) {
    // 发送图片消息到服务器
    chatWebSocket.value.send(JSON.stringify({
        fromUserId: myId.value,
        toUserId: toUserId.value,
        fromUserName: myName.value,
        toUserName: toUserName.value,
        ticketId: ticketId.value,
        messageType: "user",
        content: imageName,
        contentType: 'image',
    }));
}

function beforeUpload(file) {
    const isImage = file.type.startsWith('image/');
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isImage) {
        ElMessage({
            message: '只能上传图片',
            grouping: true,
            type: 'error',
        })
        return false
    }
    if (!isLt2M) {
        ElMessage({
            message: '图片不能超过 2MB!',
            grouping: true,
            type: 'error',
        })
        return false
    }
    return isImage && isLt2M;
}


</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding: 0 20px;
    border: 1px solid var(--el-border-color);
    border-radius: 5px;
}

.status-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 10px 5px;
}

.chat-container {
    display: flex;
    flex: 1;

    width: 100%;
    flex-direction: column;
    min-height: 0;
}

.scroll-content {
    flex: 1;
    border: 1px solid #ddd;
    padding: 10px;
    overflow-y: auto;
    /* background: #f9f9f9; */
}

.chat-input {
    /* 输入框 */
    display: flex;
    flex-shrink: 0;
    /* 防止输入框被压缩 */
    margin-top: 10px;
    margin-bottom: 10px;
    align-items: center;
}


.system-message {
    font-size: 0.8rem;
    text-align: center;
    color: #909399;
}

.chat-message {
    /* 单条消息内容  */
    background-color: rgba(161, 240, 191, 0.2);
    padding: 6px 6px;
    border-radius: 4px;
    margin-left: auto;
}

.chat-block-container {
    /* 整条消息 */
    display: flex;
    flex-direction: column;
    margin: 8px 0px;
    word-break: break-word;
}

.chat-self-container {
    /* 自己的整条信息,包括用户名 时间 内容 状态 */
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    color: #67C23A;
    margin-left: auto;
    max-width: 70%;
}

.chat-peer-container {
    /* 对方的整条消息,包括用户名 时间 内容 状态 */
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    color: #409EFF;
    margin-right: auto;
    max-width: 70%;
}

.chat-message-container {
    /* 消息内容和状态 */
    display: flex;
    align-items: center;
}

.chat-username {
    /* 用户名 */
    /* font-size: 1rem; */
    font-weight: bold;
    margin-bottom: 4px;
}

.message-status {
    /* 已读 未读 状态 */
    font-size: 0.8rem;
    padding: 0 5px;
    color: #909399;
    white-space: nowrap;
    margin-right: 10px;
}

.chat-time {
    font-size: 0.8rem;
    margin-right: 5px;
}

.el-comment {
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
}

.ticket-container {
    display: flex;
    flex-direction: column;
    min-width: 800px;
}

.ticket-time {
    color: gray;
    font-size: 0.8em;
}

.icon-refresh {
    margin-left: 5px;
}
</style>
