<template>
    <div class="flex h-screen">
        <!-- 좌측: 채팅 기록 목록 -->
        <div
            v-if="isSidebarOpen"
            class="w-[230px] p-1 flex flex-col bg-zinc-50 relative transition-all duration-300 shadow-md"
        >
            <div
                class="flex justify-between items-center py-3 px-2 border-b border-double"
            >
                <div class="relative group">
                    <button
                        @click="toggleSidebar"
                        class="flex justify-center w-6 h-6 text-zinc-400 hover:text-zinc-800 text-sm"
                    >
                        ❮❮
                    </button>
                    <div
                        class="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 max-w-[100px] whitespace-nowrap transition-opacity group-hover:opacity-100 pointer-events-none"
                    >
                        사이드바 닫기
                    </div>
                </div>
                <div class="relative group">
                    <button
                        type="button"
                        class="flex justify-center items-center w-6 h-6 rounded text-xs"
                        @click="newChat"
                    >
                        <Icon
                            size="24px"
                            name="mynaui:edit-one"
                            class="text-zinc-400 hover:text-zinc-800"
                        />
                    </button>
                    <div
                        class="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 max-w-[100px] whitespace-nowrap group-hover:opacity-100 transition-opacity pointer-events-none"
                    >
                        새로운 채팅
                    </div>
                </div>
            </div>
            <div
                class="chat-list-header m-1 pl-2 font-bold text-xs border-zinc-100"
            >
                채팅 목록
            </div>
            <div
                class="flex-1 overflow-y-auto text-sm"
                style="scrollbar-gutter: stable"
            >
                <div
                    v-for="room in chatRecords"
                    :key="room._id"
                    class="chat-record p-1.5 flex justify-between items-center cursor-pointer relative group m-1 hover:bg-[#e3e3e3] hover:shadow rounded-xl"
                    :class="{ 'bg-transparent': editingRoomId === room._id }"
                    @click="selectChatroom(room)"
                >
                    <div
                        class="record-title flex-1 mr-2 whitespace-nowrap overflow-hidden"
                    >
                        <template v-if="editingRoomId === room._id">
                            <input
                                v-model="editableRoomName"
                                @blur="submitRoomNameEdit(room)"
                                :style="titleInputStyle"
                                class="w-full p-1 border rounded focus:outline-none focus:ring focus:border-pink-400"
                                autofocus
                            />
                        </template>
                        <template v-else>
                            {{ room.title }}
                        </template>
                    </div>
                    <button
                        class="menu-toggle invisible group-hover:visible text-zinc-400 text-lg"
                        @click.stop="toggleMenu(room._id, $event)"
                    >
                        ···
                    </button>
                </div>
            </div>
        </div>
        <!-- 우측: 채팅 영역 -->
        <div
            class="chat-window flex-1 flex flex-col relative text-wrap overflow-hidden"
        >
            <div class="absolute left-0 top-2 flex flex-col items-center group">
                <button
                    v-if="!isSidebarOpen"
                    @click="toggleSidebar"
                    class="w-10 h-10 bg-zinc-200 text-zinc-600 hover:bg-zinc-300 rounded-r-lg shadow-md flex justify-center items-center relative"
                >
                    ☰
                </button>
                <div
                    class="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 max-w-[100px] whitespace-nowrap group-hover:opacity-100 transition-opacity pointer-events-none"
                >
                    사이드바 열기
                </div>
            </div>
            <div
                v-if="activeChat"
                class="chat-title flex flex-col items-center text-center text-sm text-zinc-400"
            >
                <span class="font-semibold">{{
                    activeChat ? activeChat.title : "채팅을 시작하세요"
                }}</span>
                <span class="text-xs font-light text-zinc-300">{{
                    formattedDate
                }}</span>
            </div>
            <div
                class="flex-1 flex flex-col gap-2 overflow-y-auto px-[20%] m-1 break-words break-keep"
                ref="chatMessagesRef"
                style="scrollbar-gutter: stable"
            >
                <template v-if="activeChat">
                    <div
                        v-for="chat in activeChat.chats"
                        :key="chat._id"
                        class="relative flex flex-col p-1 mt-5 rounded-3xl text-zinc-900 break-words whitespace-pre-wrap"
                        :class="
                            chat.sender === 'user'
                                ? 'ml-auto max-w-[70%] text-left  mt-10 p-4 bg-[#f3f3f3] shadow-xs'
                                : 'mx-auto w-full mb-10 text-left'
                        "
                    >
                        <div
                            class="flex-1 break-words whitespace-pre-wrap overflow-auto"
                        >
                            {{ chat.text }}
                        </div>
                        <div
                            v-if="chat.sender === 'user'"
                            class="absolute bottom-[-15px] right-[-25px]"
                        >
                            <button
                                class="replay-btn text-xs text-zinc-300 cursor-pointer"
                                @click="replayMessage(chat)"
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
                        <div class="flex flex-col items-start">
                            <div v-if="chat.sender === 'bot'">
                                <button
                                    class="text-xs text-zinc-500 cursor-pointer"
                                    @click="toggledocs(chat)"
                                >
                                    >
                                </button>
                            </div>
                            <div
                                v-show="chat.showDocs"
                                class="mt-2 p-3 w-full bg-[#f9f9f9] rounded-lg shadow"
                            >
                                <table class="w-full border-collapse text-xs">
                                    <thead>
                                        <tr class="bg-[#ececec]">
                                            <th class="p-2 text-center">
                                                파일명
                                            </th>
                                            <th class="p-2 text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            v-for="(
                                                doc, index
                                            ) in chat.docs.slice(0, 3)"
                                            :key="index"
                                            class="border-b"
                                        >
                                            <td class="p-2">{{ doc.name }}</td>
                                            <td
                                                class="p-2 flex items-center justify-center"
                                            >
                                                <button
                                                    class="px-1 py-1 text-xs"
                                                    @click="viewInfo(doc)"
                                                >
                                                    <Icon
                                                        size="24px"
                                                        name="mdi-light:information"
                                                        class="text-zinc-400 hover:text-zinc-800"
                                                    />
                                                </button>
                                                <button
                                                    class="px-1 py-1 text-xs"
                                                    @click="openViewer(doc)"
                                                >
                                                    <Icon
                                                        size="24px"
                                                        name="material-symbols-light:document-search-outline-rounded"
                                                        class="text-zinc-400 hover:text-zinc-800"
                                                    />
                                                </button>
                                                <button
                                                    class="px-1 py-1 text-xs"
                                                    @click="downloadPdf(doc)"
                                                >
                                                    <Icon
                                                        size="24px"
                                                        name="material-symbols-light:download-rounded"
                                                        class="text-zinc-400 hover:text-zinc-800"
                                                    />
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </template>
                <div
                    v-else
                    class="flex flex-col justify-center items-center h-full"
                >
                    <div class="text-3xl font-semibold pb-2 text-zinc-800">
                        무엇을 도와드릴까요?
                    </div>

                    <div class="p-3 w-full m-5 border rounded-3xl shadow-lg">
                        <!-- 업로드된 파일 목록 UI -->
                        <div
                            v-if="uploadedFiles.length"
                            class="mt-2 bg-zinc-100 p-2 rounded-md shadow"
                        >
                            <div class="flex justify-between items-center">
                                <span class="text-sm font-semibold"
                                    >📑 업로드된 문서 ({{
                                        uploadedFiles.length
                                    }}개)</span
                                >
                                <button
                                    @click="clearUploadedFiles"
                                    class="text-xs text-red-600 hover:text-red-800"
                                >
                                    모두 삭제
                                </button>
                            </div>
                            <ul>
                                <li
                                    v-for="(file, index) in uploadedFiles"
                                    :key="index"
                                    class="flex justify-between items-center p-1 border-b text-sm"
                                >
                                    {{ file.name }} ({{ file.size }}KB)
                                    <button @click="removeFile(index)">
                                        <Icon
                                            size="22px"
                                            name="material-symbols:close-rounded"
                                            class="text-zinc-400 hover:text-zinc-800"
                                        />
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <textarea
                            ref="textareaRef"
                            v-model="newMessage"
                            @keydown="handleKeydown"
                            placeholder="질문을 입력하세요"
                            rows="2"
                            autofocus
                            class="w-full px-2 py-2 resize-none outline-none"
                        ></textarea>

                        <div class="flex justify-between items-center py-1">
                            <button
                                class="relative px-1 cursor-pointer text-zinc-400 hover:text-zinc-800"
                                @click="triggerFileUpload"
                            >
                                <Icon
                                    size="24px"
                                    name="mdi:paperclip"
                                    class="text-zinc-400 hover:text-zinc-800"
                                />
                            </button>

                            <!-- 숨겨진 파일 업로드 input -->
                            <input
                                type="file"
                                multiple
                                ref="fileInput"
                                @change="handleFileUpload"
                                class="hidden"
                            />
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
                    autofocus
                    class="w-full px-2 py-2 resize-none outline-none"
                ></textarea>
                <div class="flex justify-between items-center py-1">
                    <button
                        class="px-1 cursor-pointer text-zinc-400 hover:text-zinc-800"
                        @click="toggleDocsPanel"
                    >
                        <Icon
                            size="24px"
                            name="mdi:paperclip"
                            class="text-zinc-400 hover:text-zinc-800"
                        />
                    </button>
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
        <!-- 채팅방 내부에서 업로드한 문서 목록 보기 -->
        <div
            v-if="isDocsPanelOpen"
            class="flex flex-col right-0 top-0 h-full w-[300px] bg-white shadow-lg border-l border-gray-300 p-4 overflow-y-auto transition-transform duration-300 text-sm"
        >
            <div class="flex justify-between items-center mb-3">
                <h2 class="font-semibold">📄 업로드된 문서</h2>
                <button @click="toggleDocsPanel">
                    <Icon
                        size="24px"
                        name="material-symbols:close-rounded"
                        class="text-zinc-400 hover:text-zinc-800"
                    />
                </button>
            </div>
            <div v-if="uploadedFiles.length">
                <ul>
                    <li
                        v-for="(doc, index) in activeChat.docs"
                        :key="index"
                        class="flex justify-between items-center border-b p-1"
                    >
                        <span> {{ doc.name }} ({{ doc.size }}KB) </span>
                        <button @click="openViewer(doc)">
                            <Icon
                                size="24px"
                                name="material-symbols-light:document-search-outline-rounded"
                                class="text-zinc-400 hover:text-zinc-800"
                            />
                        </button>
                    </li>
                </ul>
            </div>
            <div v-else class="text-gray-500 text-sm text-center">
                업로드된 문서가 없습니다.
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
                    @click.stop="enableRoomEditing(getRecordById(activeMenuId))"
                    class="text-xs"
                >
                    이름 바꾸기
                </button>
                <button
                    @click.stop="
                        confirmRoomDeletion(getRecordById(activeMenuId))
                    "
                    class="text-xs text-red-800"
                >
                    삭제
                </button>
            </div>
        </teleport>
    </div>
    <!-- PDF 뷰어 모달 -->
    <div
        v-if="pdfViewer.isOpen"
        class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
        <div
            class="bg-white rounded-lg p-4 shadow-lg max-w-4xl w-full relative"
        >
            <button
                @click="closePdfViewer"
                class="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
                ✖
            </button>
            <h2 class="font-semibold mb-2 text-center">
                {{ pdfViewer.title }}
            </h2>
            <div class="pdf-container overflow-y-auto max-h-[80vh] p-2">
                <canvas ref="pdfCanvas"></canvas>
            </div>
            <div
                class="flex justify-between items-center mt-3 ml-56 text-sm p-1"
            >
                <button
                    @click="prevPage"
                    class="px-3 py-1 bg-zinc-200 hover:bg-zinc-300 rounded-lg"
                >
                    ◀ 이전
                </button>
                <span
                    >{{ pdfViewer.currentPage }} /
                    {{ pdfViewer.totalPages }}</span
                >
                <button
                    @click="nextPage"
                    class="px-3 py-1 bg-zinc-200 hover:bg-zinc-300 rounded-lg"
                >
                    다음 ▶
                </button>
                <button
                    @click="downloadPdf()"
                    class="px-3 py-1 bg-zinc-500 text-white rounded-lg hover:bg-zinc-800"
                >
                    ⬇ 다운로드
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, nextTick, watch, onMounted } from "vue";
import { onClickOutside } from "@vueuse/core";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

//mongoDB
const API_URL = "http://localhost:3001/api";

const clickOutside = {
    mounted(el, binding) {
        el.clickOutsideEvent = onClickOutside(el, binding.value);
    },
    unmounted(el) {
        if (el.clickOutsideEvent) el.clickOutsideEvent();
    },
};
defineExpose({ directives: { "click-outside": clickOutside } });

const formattedDate = computed(() => {
    if (!activeChat.value || !activeChat.value.createdAt) return "";

    const date = new Date(activeChat.value.createdAt);

    return date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
});
const isCustomDocs = computed(() => activeChat.value?.isCustomDocs ?? false);

const uploadedFiles = ref([]);
const fileInput = ref(null);
const isDocsPanelOpen = ref(false);
const chatRecords = ref([]);
const activeChat = ref(null);
const newMessage = ref("");
const activeMenuId = ref(null);
const menuStyle = reactive({ top: "0px", left: "0px" });
const isSidebarOpen = ref(true); // 사이드바 상태 추가

const chatMessagesRef = ref(null);
const teleportMenuRef = ref(null);
const textareaRef = ref(null);
const MAX_HEIGHT = 200;
// const { textarea } = useTextareaAutosize({
//     styleProp: "minHeight",
//     maxRows: 4,
// });
function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value;
}
function toggleDocsPanel() {
    isDocsPanelOpen.value = !isDocsPanelOpen.value;
}
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

async function handleKeydown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (!activeChat.value) {
            await startChat();
        } else {
            await sendMessage();
        }
    }
}

function triggerFileUpload() {
    if (fileInput.value) {
        fileInput.value.click();
    }
}

function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    files.forEach((file) => {
        uploadedFiles.value.push({
            name: file.name,
            path: URL.createObjectURL(file), // 실제 업로드 기능이 구현되면 path 변경 필요
            size: (file.size / 1024).toFixed(2), // KB 단위 변환
        });
    });
}

function removeFile(index) {
    uploadedFiles.value.splice(index, 1);
}

function clearUploadedFiles() {
    uploadedFiles.value = [];
}

function selectChatroom(room) {
    if (!room) {
        console.warn("⚠️ 채팅방이 존재하지 않습니다.");
        activeChat.value = null;
        return;
    }
    fetchChatroom(room._id);
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
// 채팅방 이름 수정 관련
const editingRoomId = ref(null);
const editableRoomName = ref("");
const titleInputStyle = computed(() => {
    return { width: "180px" };
});

function enableRoomEditing(room) {
    editingRoomId.value = room._id;
    editableRoomName.value = room.title;
    activeMenuId.value = null;
    nextTick(() => {
        const el = document.querySelector("input[ref='editableRoom']");
        if (el) el.focus();
    });
}

async function submitRoomNameEdit(room) {
    try {
        const updatedTitle = editableRoomName.value;
        const res = await axios.put(`${API_URL}/chatrooms/${room._id}`, {
            title: updatedTitle,
        });
        if (res.data.success) {
            await fetchChatrooms();
            if (activeChat.value && activeChat.value._id === room._id) {
                await fetchChatroom(room._id);
            }
        }
    } catch (err) {
        console.error("채팅방 이름 수정 실패:", err);
    } finally {
        editingRoomId.value = null;
    }
}

async function confirmRoomDeletion(room) {
    activeMenuId.value = null;
    if (confirm(`정말 ${room.title} 채팅방을 삭제하시겠습니까?`)) {
        try {
            const res = await axios.delete(`${API_URL}/chatrooms/${room._id}`);
            if (res.data.success) {
                await fetchChatrooms();
                if (activeChat.value && activeChat.value._id === room._id) {
                    activeChat.value = null;
                }
            }
        } catch (err) {
            console.error("채팅방 삭제 실패:", err);
        }
    }
}

async function fetchChatrooms() {
    try {
        const res = await axios.get(`${API_URL}/chatrooms`);
        if (res.data.success) {
            chatRecords.value = res.data.data;
        }
    } catch (err) {
        console.error("채팅방 불러오기 실패:", err);
    }
}

async function fetchChatroom(id) {
    try {
        const res = await axios.get(`${API_URL}/chatrooms/${id}`);
        if (res.data.success) {
            activeChat.value = res.data.data;
            nextTick(() => {
                if (chatMessagesRef.value) {
                    chatMessagesRef.value.scrollTop =
                        chatMessagesRef.value.scrollHeight;
                }
            });
        }
    } catch (err) {
        console.error("채팅방 상세 불러오기 실패:", err);
    }
}

async function startChat() {
    if (!activeChat.value) {
        try {
            const creationTime = new Date();
            if (!newMessage.value.trim()) return;
            const title = newMessage.value.substring(0, 15);

            const res = await axios.post(`${API_URL}/chatrooms`, {
                title,
                creationTime,
                isCustomDocs: uploadedFiles.value.length > 0,
                docs: [...uploadedFiles.value], // 업로드한 문서 포함
            });

            if (res.data.success) {
                chatRecords.value.unshift(res.data.data);
                activeChat.value = res.data.data;

                if (!activeChat.value.isCustomDocs) {
                    uploadedFiles.value = [];
                }
            }
        } catch (err) {
            console.error("채팅방 생성 실패:", err);
        }
    }
    await sendMessage();
}

async function fetchSystemDocs() {
    try {
        const res = await axios.get(`${API_URL}/system-docs`);
        if (res.data.success) {
            return res.data.data;
        }
    } catch (err) {
        console.error("❌ 시스템 문서 가져오기 실패:", err);
    }
    return [];
}

async function sendMessage() {
    console.log("📝 사용자 입력:", newMessage.value);
    if (newMessage.value.trim() === "") return;

    try {
        const payload = { text: newMessage.value, sender: "user" };
        const res = await axios.post(
            `${API_URL}/chatrooms/${activeChat.value?._id}/chats`,
            payload
        );

        if (res.data.success) {
            activeChat.value.chats.push(res.data.data);
        }

        const userText = newMessage.value;
        newMessage.value = "";

        nextTick(() => {
            if (chatMessagesRef.value) {
                chatMessagesRef.value.scrollTop =
                    chatMessagesRef.value.scrollHeight;
            }
            updateHeight();
        });

        let responseDocs = [];
        let responseText = "";

        if (!activeChat.value) {
            console.warn("⚠️ activeChat이 NULL, 기본 문서 로드");
            activeChat.value = { isCustomDocs: false, docs: [] };
        }

        console.log("📝 채팅방 문서 기반 여부:", activeChat.value.isCustomDocs);
        console.log("📂 채팅방의 문서 목록:", activeChat.value.docs);

        if (activeChat.value.isCustomDocs && activeChat.value.docs.length > 0) {
            // 🔹 업로드한 문서가 있는 경우 → 해당 문서만 사용
            responseDocs = activeChat.value.docs;
            responseText = "이 문서를 참고하세요.";
        } else {
            // 🔹 문서를 업로드하지 않은 경우 → 기본 문서 불러오기
            responseDocs = await fetchSystemDocs();
            responseText =
                responseDocs.length > 0
                    ? "기본 문서를 참고하여 답변을 제공합니다."
                    : "❌ 사용할 문서가 없습니다.";

            console.log("📂 기본 문서 목록:", responseDocs);
        }

        if (!responseDocs.length) {
            console.warn("⚠️ 문서가 없어 답변을 생성할 수 없습니다.");
            return;
        }

        //  봇의 응답 전송 (500ms 지연)
        setTimeout(async () => {
            const botPayload = {
                text: responseText + "\n\n" + userText,
                sender: "bot",
                docs: responseDocs,
            };

            console.log("🚀 봇 응답 데이터:", botPayload); // 🛠️ 디버깅용

            try {
                const botRes = await axios.post(
                    `${API_URL}/chatrooms/${activeChat.value._id}/chats`,
                    botPayload
                );

                if (botRes.data.success) {
                    activeChat.value.chats.push(botRes.data.data);
                }
            } catch (err) {
                console.error("❌ 봇 메시지 전송 실패:", err);
            }

            nextTick(() => {
                if (chatMessagesRef.value) {
                    chatMessagesRef.value.scrollTop =
                        chatMessagesRef.value.scrollHeight;
                }
            });
        }, 500);
    } catch (err) {
        console.error("❌ 메시지 전송 실패:", err);
    }
}

function replayMessage(chat) {
    newMessage.value = chat.text;
}
function toggledocs(chat) {
    chat.showDocs = !chat.showDocs;
}

function viewInfo(doc) {
    alert(
        `파일명: ${doc.name}\n파일 크기: ${doc.size}KB\n파일 경로: ${doc.path}`
    );
}

const pdfViewer = ref({
    isOpen: false,
    title: "",
    url: "",
    currentPage: 1,
    totalPages: 1,
});

const pdfCanvas = ref(null);
let pdfDoc = null;
async function openViewer(doc) {
    if (!doc || !doc.path) {
        alert("⚠️ 문서 경로가 없습니다.");
        return;
    }
    pdfViewer.value.isOpen = true;
    pdfViewer.value.title = doc.name;
    pdfViewer.value.url = doc.path;
    pdfViewer.value.currentPage = 1;
    await loadPdf();
}

async function loadPdf() {
    if (!pdfViewer.value.url) return;
    const loadingTask = pdfjsLib.getDocument(pdfViewer.value.url);
    pdfDoc = await loadingTask.promise;
    pdfViewer.value.totalPages = pdfDoc.numPages;
    renderPage(pdfViewer.value.currentPage);
}

async function renderPage(pageNumber) {
    if (!pdfDoc) return;
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.3 });

    const canvas = pdfCanvas.value;
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = { canvasContext: context, viewport };
    await page.render(renderContext).promise;
}

function nextPage() {
    if (pdfViewer.value.currentPage < pdfViewer.value.totalPages) {
        pdfViewer.value.currentPage++;
        renderPage(pdfViewer.value.currentPage);
    }
}

function prevPage() {
    if (pdfViewer.value.currentPage > 1) {
        pdfViewer.value.currentPage--;
        renderPage(pdfViewer.value.currentPage);
    }
}

function downloadPdf(doc = null) {
    let filePath, fileName;
    if (!doc && pdfViewer.value.isOpen) {
        filePath = pdfViewer.value.url;
        fileName = pdfViewer.value.title;
    } else if (doc?.path) {
        filePath = doc.path;
        fileName = doc.name || "다운로드.pdf";
    } else {
        alert("⚠️ 파일을 다운로드할 수 없습니다. 다시 시도해주세요.");
        return;
    }
    const link = document.createElement("a");
    link.href = filePath;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function closePdfViewer() {
    pdfViewer.value.isOpen = false;
    pdfDoc = null;
}

onMounted(() => {
    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && pdfViewer.value.isOpen) {
            closePdfViewer();
        }
    });
});

function handleMenuMouseLeave() {
    activeMenuId.value = null;
}
function getRecordById(id) {
    return chatRecords.value.find((room) => room._id === id);
}

onMounted(fetchChatrooms);
</script>

<style scoped lang="scss">
.record-title {
    padding-left: 3px;
    flex: 1;
    margin-right: 8px;
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
.chat-record {
    transition: background 0.3s ease-in-out;
}
.chat-record.bg-transparent {
    background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 1),
        rgba(255, 255, 255, 0.7)
    );
}

.record-title input {
    position: relative;
    z-index: 10;
    background: rgba(255, 255, 255, 0.9);
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

::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 5px;
}

::-webkit-scrollbar-thumb {
    background: #d1d1d1;
    border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
    background: #b0b0b0;
}

::-webkit-scrollbar-corner {
    background: transparent;
}
</style>
