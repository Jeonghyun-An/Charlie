<template>
    <div class="flex h-screen">
        <!-- 좌측: 채팅 기록 목록 -->
        <div class="w-[250px] p-1 flex flex-col bg-zinc-50 relative">
            <div>
                <button
                    type="button"
                    class="flex justify-center items-center w-4/5 h-12 mx-auto m-[10%] bg-zinc-950 text-white rounded shadow-md hover:bg-zinc-700"
                    @click="newChat"
                >
                    NEW CHAT
                </button>
            </div>
            <div
                class="chat-list-header m-1 font-bold text-xs border-y border-zinc-100"
            >
                채팅 목록
            </div>
            <div class="chat-records flex-1 overflow-y-auto text-sm">
                <div
                    v-for="record in chatRecords"
                    :key="record.id"
                    class="chat-record p-1.5 flex justify-between items-center cursor-pointer relative group m-1 hover:bg-zinc-200 hover:shadow rounded-xl"
                    @click="selectChatRecord(record)"
                >
                    <div
                        class="record-title flex-1 mr-2 whitespace-nowrap overflow-hidden"
                    >
                        {{ record.title }}
                    </div>
                    <button
                        class="menu-toggle invisible group-hover:visible text-zinc-400 text-lg"
                        @click.stop="toggleMenu(record.id, $event)"
                    >
                        ···
                    </button>
                </div>
            </div>
        </div>

        <!-- 우측: 채팅 영역 -->
        <div class="chat-window flex-1 flex flex-col relative text-wrap">
            <div
                v-if="activeChat"
                class="chat-title text-center mb-2 text-sm text-zinc-300"
            >
                {{ activeChat ? activeChat.title : "채팅을 시작하세요" }}
            </div>
            <div
                class="flex-1 flex flex-col gap-2 overflow-y-auto px-[20%] m-1 break-words break-keep"
                ref="chatMessagesRef"
                style="scrollbar-gutter: stable"
            >
                <template v-if="activeChat">
                    <div
                        v-for="message in activeChat.messages"
                        :key="message.id"
                        class="relative inline-flex p-1 mt-5 rounded-3xl break-words flex-wrap text-zinc-900"
                        :class="
                            message.sender === 'user'
                                ? 'ml-auto max-w-[70%] text-left  mt-10 p-4 bg-zinc-100 shadow-xs'
                                : 'mx-auto w-full mb-10 text-left'
                        "
                    >
                        <div
                            class="flex-1 whitespace-pre-wrap break-words overflow-auto"
                        >
                            {{ message.text }}
                        </div>
                        <div
                            v-if="message.sender === 'user'"
                            class="absolute bottom-[-15px] right-[-25px]"
                        >
                            <button
                                class="replay-btn text-xs text-zinc-300 cursor-pointer"
                                @click="replayMessage(message)"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 56 56"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M28 51.906c13.055 0 23.906-10.828 23.906-23.906c0-13.055-10.875-23.906-23.93-23.906C14.899 4.094 4.095 14.945 4.095 28c0 13.078 10.828 23.906 23.906 23.906m0-3.984C16.937 47.922 8.1 39.062 8.1 28c0-11.04 8.813-19.922 19.876-19.922c11.039 0 19.921 8.883 19.945 19.922c.023 11.063-8.883 19.922-19.922 19.922m10.43-18.844c0-5.742-4.735-10.265-10.008-10.265a6 6 0 0 0-.657.046l1.665-1.687a1.6 1.6 0 0 0 .421-1.078c0-.82-.656-1.5-1.476-1.5c-.422 0-.82.187-1.078.469l-4.5 4.593c-.54.563-.586 1.617 0 2.157l4.547 4.546a1.5 1.5 0 0 0 1.03.446a1.47 1.47 0 0 0 1.477-1.477c0-.422-.164-.797-.445-1.078L27.11 22c.235-.047.563-.047.867-.047c4.008 0 7.22 3.188 7.22 7.195c0 4.032-3.212 7.266-7.22 7.266c-4.03 0-7.218-3.234-7.218-7.266c0-.867-.75-1.57-1.617-1.57c-.868 0-1.618.703-1.618 1.57c0 5.79 4.664 10.5 10.454 10.5c5.789 0 10.453-4.71 10.453-10.57"
                                    />
                                </svg>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 56 56"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M28 51.906c13.055 0 23.906-10.851 23.906-23.906c0-13.078-10.875-23.906-23.93-23.906C14.899 4.094 4.095 14.922 4.095 28c0 13.055 10.828 23.906 23.906 23.906m10.594-22.922c0 5.953-4.735 10.735-10.617 10.735S17.36 34.937 17.36 29.055c0-.867.75-1.594 1.64-1.594c.892 0 1.642.727 1.642 1.594c0 4.101 3.234 7.383 7.336 7.383c4.078 0 7.335-3.282 7.335-7.383c0-4.055-3.257-7.29-7.335-7.29c-.305 0-.633 0-.868.047l2.32 2.274c.282.281.446.656.446 1.102c0 .82-.656 1.5-1.5 1.5c-.398 0-.774-.188-1.055-.47l-4.617-4.593c-.586-.562-.539-1.64 0-2.203l4.57-4.664c.258-.305.68-.469 1.102-.469c.844 0 1.5.68 1.5 1.524c0 .421-.14.82-.422 1.101l-1.687 1.688c.187-.024.445-.047.656-.047c5.367 0 10.172 4.593 10.172 10.43"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div
                            v-if="message.sender === 'bot'"
                            class="absolute bottom-[-20px] left-[+5px]"
                        >
                            <button
                                class="text-xs text-zinc-500 cursor-pointer"
                                @click="toggledocs(message)"
                            >
                                >
                            </button>
                            <div
                                v-if="message.showDocs"
                                class="mt-1 text-xs text-zinc-400"
                            >
                                <ul class="ml-5 p-0">
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

                <div v-else class="flex justify-center items-center h-full">
                    <div
                        class="p-3 w-full m-5 mt-0 border rounded-3xl shadow-lg"
                    >
                        <textarea
                            ref="textareaRef"
                            v-model="newMessage"
                            @keydown="handleKeydown"
                            placeholder="질문을 입력하세요"
                            rows="2"
                            class="w-full px-2 py-2 resize-none outline-none"
                        ></textarea>
                        <div class="flex justify-between items-center py-1">
                            <button
                                class="px-1 cursor-pointer text-zinc-400 hover:text-zinc-800"
                                @click="toggledocs(message)"
                            >
                                <Icon
                                    size="24px"
                                    name="mdi:paperclip"
                                    class="text-zinc-400 hover:text-zinc-800"
                                />
                            </button>
                            <button @click="startChat">
                                <Icon
                                    size="20px"
                                    name="qlementine-icons:send-16"
                                    class="text-zinc-400 hover:text-zinc-800"
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div
                v-if="activeChat"
                class="p-3 mx-[20%] m-5 mt-0 border rounded-3xl shadow-lg"
            >
                <textarea
                    ref="textareaRef"
                    v-model="newMessage"
                    @keydown="handleKeydown"
                    placeholder="질문을 입력하세요"
                    rows="2"
                    class="w-full px-2 py-2 resize-none outline-none"
                ></textarea>
                <div class="flex justify-between items-center py-1">
                    <button
                        class="px-1 cursor-pointer text-zinc-400 hover:text-zinc-800"
                        @click="toggledocs(message)"
                    >
                        <Icon
                            size="24px"
                            name="mdi:paperclip"
                            class="text-zinc-400 hover:text-zinc-800"
                        />
                    </button>
                    <!-- 제출 버튼 (Enter 단독 제출 외에도 버튼 클릭 제출) -->
                    <button @click="sendMessage">
                        <Icon
                            size="20px"
                            name="qlementine-icons:send-16"
                            class="text-zinc-400 hover:text-zinc-800"
                        />
                    </button>
                </div>
            </div>
        </div>

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
import { ref, reactive, nextTick, watch } from "vue";
import { onClickOutside } from "@vueuse/core";

const clickOutside = {
    mounted(el, binding) {
        el.clickOutsideEvent = onClickOutside(el, binding.value);
    },
    unmounted(el) {
        if (el.clickOutsideEvent) el.clickOutsideEvent();
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
const teleportMenuRef = ref(null);
const textareaRef = ref(null);
const MAX_HEIGHT = 200;
// const { textarea } = useTextareaAutosize({
//     styleProp: "minHeight",
//     maxRows: 4,
// });
function updateHeight() {
    const el = textareaRef.value;
    if (!el) return;
    el.style.height = "auto";
    const newHeight = el.scrollHeight;
    if (newHeight > MAX_HEIGHT) {
        el.style.height = MAX_HEIGHT + "px";
        el.style.overflowY = "auto";
    } else {
        el.style.height = newHeight + "px";
        el.style.overflowY = "hidden";
    }
}

watch(newMessage, () => {
    nextTick(updateHeight);
});

function handleKeydown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (!activeChat.value) {
            startChat();
        } else {
            sendMessage();
        }
    }
}

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

/* 액션 버튼 자체 스타일  */
.replay-btn {
    width: 25px;
    height: 40px;
    &:hover {
        > svg {
            &:nth-child(1) {
                display: none;
            }
            &:nth-child(2) {
                display: block;
            }
        }
    }
    > svg {
        &:nth-child(2) {
            display: none;
        }
    }
}
</style>
