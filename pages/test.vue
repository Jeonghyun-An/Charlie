<template>
    <div class="flex h-screen">
        <!-- 좌측: 채팅 기록 목록 -->
        <div
            class="chat-list w-[250px] p-1 border-r border-gray-300 flex flex-col bg-[#fffbfc] relative"
        >
            <div class="new-chat p-5">
                <button
                    type="button"
                    class="btn-new-chat bg-[rgb(255,227,232)] rounded w-4/5 mx-auto flex justify-center items-center"
                    @click="newChat"
                >
                    NEW CHAT
                </button>
            </div>
            <div class="chat-list-header mx-4 pb-2 font-bold text-sm border-b">
                채팅 목록
            </div>
            <div class="chat-records flex-1 overflow-y-auto">
                <div
                    v-for="record in chatRecords"
                    :key="record.id"
                    class="chat-record p-2 flex justify-between items-center cursor-pointer relative group"
                    @click="selectChatRecord(record)"
                >
                    <div
                        class="record-title flex-1 mr-2 whitespace-nowrap overflow-hidden"
                    >
                        {{ record.title }}
                    </div>
                    <button
                        class="menu-toggle invisible group-hover:visible text-rose-600 text-xl"
                        @click.stop="toggleMenu(record.id, $event)"
                    >
                        ···
                    </button>
                </div>
            </div>
        </div>

        <!-- 우측: 채팅 영역 -->
        <div class="chat-window flex-1 flex flex-col relative">
            <div v-if="activeChat" class="chat-title text-center mb-2 text-sm">
                {{ activeChat.title }}
            </div>
            <div
                class="chat-messages flex-1 flex flex-col gap-2 overflow-y-auto px-[15%]"
                ref="chatMessagesRef"
            >
                <template v-if="activeChat">
                    <div
                        v-for="message in activeChat.messages"
                        :key="message.id"
                        class="relative inline-flex w-fit max-w-full p-2 mt-5 rounded-xl break-words overflow-visible"
                        :class="
                            message.sender === 'user'
                                ? 'ml-auto max-w-[80%] text-left pt-10'
                                : 'mx-auto w-full border border-[mistyrose] p-8 text-left'
                        "
                    >
                        <div class="flex-1">
                            {{ message.text }}
                        </div>
                        <!-- 사용자 액션: replay 버튼 (메시지 bubble 바깥쪽 오른쪽 하단) -->
                        <div
                            v-if="message.sender === 'user'"
                            class="msg-actions user absolute bottom-[-10px] right-[-10px]"
                        >
                            <button
                                class="replay-btn text-xs text-[hotpink] cursor-pointer"
                                @click="replayMessage(message)"
                            >
                                <!-- SVG 아이콘 대신 텍스트 "replay" 표시 -->
                                replay
                            </button>
                        </div>
                        <!-- 봇 액션: 문서보기 버튼 (메시지 bubble 바깥쪽 왼쪽 하단) -->
                        <div
                            v-if="message.sender === 'bot'"
                            class="msg-actions bot absolute bottom-[-10px] left-[-10px]"
                        >
                            <button
                                class="doc-btn text-xs text-[hotpink] cursor-pointer"
                                @click="toggledocs(message)"
                            >
                                문서보기
                            </button>
                            <div
                                v-if="message.showDocs"
                                class="doc-list mt-1 text-xs text-gray-500"
                            >
                                <ul class="list-disc ml-5 p-0">
                                    <li
                                        v-for="(doc, index) in message.docs"
                                        :key="index"
                                    >
                                        {{ doc }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </template>
                <div
                    v-else
                    class="chat-initial flex justify-center items-center h-full"
                >
                    <input
                        type="text"
                        placeholder="질문을 입력하세요"
                        v-model="newMessage"
                        @keyup.enter="startChat"
                        class="w-1/2 p-2"
                    />
                </div>
            </div>
            <div v-if="activeChat" class="chat-input p-5 pt-0 mx-10">
                <input
                    type="text"
                    placeholder="메시지 입력..."
                    v-model="newMessage"
                    @keyup.enter="sendMessage"
                    class="w-full p-2 outline-pink outline-dashed rounded-full"
                />
            </div>
        </div>

        <!-- Teleport: 컨텍스트 메뉴 (v-click-outside 디렉티브 사용) -->
        <teleport to="body">
            <div
                v-if="activeMenuId"
                v-click-outside="handleMenuMouseLeave"
                :style="menuStyle"
                ref="teleportMenuRef"
                class="absolute bg-white border border-gray-300 p-1 rounded shadow z-50 flex flex-col gap-1"
            >
                <button
                    @click.stop="renameRecord(getRecordById(activeMenuId))"
                    class="text-xs"
                >
                    이름 바꾸기
                </button>
                <button
                    @click.stop="deleteRecord(getRecordById(activeMenuId))"
                    class="text-xs text-red-800"
                >
                    삭제
                </button>
            </div>
        </teleport>
    </div>
</template>

<script setup>
import { ref, reactive, nextTick } from "vue";

// 커스텀 v-click-outside 디렉티브
const clickOutside = {
    mounted(el, binding) {
        el.clickOutsideEvent = (event) => {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event);
            }
        };
        document.addEventListener("click", el.clickOutsideEvent);
    },
    unmounted(el) {
        document.removeEventListener("click", el.clickOutsideEvent);
    },
};
defineExpose({ directives: { "click-outside": clickOutside } });

// 더미 데이터
const chatRecords = reactive([
    {
        id: 1,
        title: "채팅 11111111111111111111111111111111111111111111",
        messages: [
            { id: 102, text: "메시지 1", sender: "user" },
            {
                id: 103,
                text: "메시지 2",
                sender: "bot",
                docs: ["문서 A", "문서 B"],
                showDocs: false,
            },
        ],
    },
    {
        id: 2,
        title: "채팅 2",
        messages: [
            { id: 201, text: "채팅 2", sender: "user" },
            {
                id: 202,
                text: "두 번째 메시지\nns\ns\ns\ndfdfdf...",
                sender: "bot",
            },
        ],
    },
    {
        id: 3,
        title: "채팅 3",
        messages: [{ id: 301, text: "채팅 3", sender: "user" }],
    },
    {
        id: 4,
        title: "채팅 11111111111111111111111111111111111111111ㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴ111",
        messages: [
            { id: 401, text: "채팅 1", sender: "user" },
            { id: 402, text: "메시지 1", sender: "bot" },
            {
                id: 404,
                text: "채팅 222222222222222222222222222222222222222222222222222222222",
                sender: "user",
            },
            { id: 403, text: "메시지 2", sender: "bot" },
        ],
    },
]);
const activeChat = ref(null);
const newMessage = ref("");
const activeMenuId = ref(null);
const menuStyle = reactive({ top: "0px", left: "0px" });

const chatMessagesRef = ref(null);
const chatListRef = ref(null);
const teleportMenuRef = ref(null);

function selectChatRecord(record) {
    activeChat.value = record;
}
function newChat() {
    activeChat.value = null;
}
function toggleMenu(id, event) {
    if (activeMenuId.value === id) {
        activeMenuId.value = null;
        return;
    }
    activeMenuId.value = id;
    const rect = event.currentTarget.getBoundingClientRect();
    menuStyle.top = rect.top - 20 + "px";
    menuStyle.left = rect.right + 8 + "px";
}
function renameRecord(record) {
    alert(`이름 바꾸기: ${record.title}`);
    activeMenuId.value = null;
}
function deleteRecord(record) {
    alert(`삭제: ${record.title}`);
    activeMenuId.value = null;
}
function startChat() {
    if (!activeChat.value) {
        const creationTime = new Date();
        const newChatroom = {
            id: Date.now(),
            title: creationTime.toLocaleTimeString(),
            messages: [],
        };
        chatRecords.push(newChatroom);
        activeChat.value = newChatroom;
    }
    sendMessage();
}
function sendMessage() {
    if (newMessage.value.trim() !== "") {
        activeChat.value.messages.push({
            id: Date.now(),
            text: newMessage.value,
            sender: "user",
        });
        const userText = newMessage.value;
        newMessage.value = "";
        nextTick(() => {
            if (chatMessagesRef.value) {
                chatMessagesRef.value.scrollTop =
                    chatMessagesRef.value.scrollHeight;
            }
        });
        setTimeout(() => {
            activeChat.value.messages.push({
                id: Date.now() + 1,
                text: "더미 메시지 " + userText,
                sender: "bot",
                docs: ["참고 문서 1"],
                showDocs: false,
            });
            nextTick(() => {
                if (chatMessagesRef.value) {
                    chatMessagesRef.value.scrollTop =
                        chatMessagesRef.value.scrollHeight;
                }
            });
        }, 500);
    }
}
function replayMessage(message) {
    newMessage.value = message.text;
}
function toggledocs(message) {
    message.showDocs = !message.showDocs;
}
function handleMenuMouseLeave() {
    activeMenuId.value = null;
}
function getRecordById(id) {
    return chatRecords.find((record) => record.id === id);
}
</script>

<style scoped lang="scss">
.chat-app {
    display: flex;
    height: 100vh;
}

/* 좌측 채팅 기록 목록 */
.chat-list {
    border-right: 1px solid rgb(207, 191, 191);
}
.new-chat {
    padding: 5%;
}
.btn-new-chat {
    color: rosybrown;
    background-color: rgb(255, 227, 232);
    border-radius: 4px;
    height: 60%;
    margin: 10%;
}

.btn-new-chat:hover {
    background-color: black;
}

.chat-list-header {
    margin: 16px;
    font-weight: bold;
    font-size: small;
    border-bottom: 1px solid rgb(207, 191, 191);
}

.chat-records {
    flex: 1;
    overflow-y: auto;
}

.chat-record {
}

.chat-record:hover {
    background-color: rgb(255, 227, 232);
    border-radius: 100px;
}

.record-title {
    flex: 1;
    margin-right: 10px;
    white-space: nowrap;
    overflow: hidden;
    -webkit-mask-image: linear-gradient(
        to right,
        black 0%,
        black 75%,
        transparent 100%
    );
    mask-image: linear-gradient(
        to right,
        black 0%,
        black 75%,
        transparent 100%
    );
}

/* 메뉴 토글 버튼 */
.menu-toggle {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2em;
    visibility: hidden;
    color: rosybrown;
}
.chat-record:hover .menu-toggle {
    visibility: visible;
}

/* 우측 채팅 영역 */
.chat-window {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    text-wrap: wrap;
}

.chat-title {
    color: rgb(207, 191, 191);
}

/* 메시지 스타일: 사용자 메시지(오른쪽)와 봇 메시지(왼쪽) */
.chat-messages {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    padding-left: 15%;
    padding-right: 15%;
    margin-top: 5%;
    margin: 2%;
}

.chat-message {
    position: relative;
    display: flex;
    width: fit-content;
    max-width: 100%;
    padding: 10px;
    margin-top: 3%;
    border-radius: 10px;
    word-break: break-word;
}

/* 유저 메시지는 오른쪽 정렬 */
.chat-message.user {
    background-color: rgb(256, 227, 232);
    margin-left: auto;
    margin-top: 80px;
    text-align: left;
    max-width: 80%;
}

/* 봇 메시지는 중앙 정렬 */
.chat-message.bot {
    background-color: rgb(253, 246, 245);
    margin-right: auto;
    margin-left: auto;
    text-align: left;
    border-radius: 0;
    width: 100%;
    border: solid mistyrose;
    padding: 30px;
}
/* 액션 버튼 컨테이너: 메시지 박스 바깥쪽 하단에 위치 (버튼들 자체는 별도 스타일) */
.msg-actions {
    position: absolute;
    bottom: -20px; /* 메시지 박스 바깥쪽에 위치 (필요시 값을 조정) */
    z-index: 2;
    @apply flex;
}

/* 사용자 메시지의 액션 버튼: 오른쪽 하단에 위치 */
.msg-actions.user {
    right: -20px;
    bottom: -10px;
    font-weight: bold;
}

/* 봇 메시지의 액션 버튼: 왼쪽 하단에 위치 */
.msg-actions.bot {
    left: 5px;
}

/* 액션 버튼 자체 스타일 (필요에 따라 추가 조정) */
.replay-btn,
.doc-btn {
    background: none;
    border: none;
    font-size: 0.8em;
    color: hotpink;
    cursor: pointer;
}

/* 문서 목록 스타일 */
.doc-list {
    margin-top: 5px;
    font-size: 0.8em;
    color: #555;
}
.doc-list ul {
    list-style-type: disc;
    margin-left: 20px;
    padding: 0;
}

/* 하단 입력창 */
.chat-input {
    padding: 5%;
    padding-top: 0%;
    margin-left: 10%;
    margin-right: 10%;
}

.chat-input input {
    width: 100%;
    padding: 10px;
    outline-color: pink;
    outline-style: dashed;
    border-radius: 100px;
}

/* 초기 상태 중앙 입력창 */
.chat-initial {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.chat-initial input {
    width: 50%;
    padding: 8px;
}
</style>
