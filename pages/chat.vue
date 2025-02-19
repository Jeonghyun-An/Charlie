<template>
    <div id="chat_app" class="flex min-h-screen">
        <!-- 좌측 사이드바: 채팅방 목록 -->
        <aside class="p-4 w-60 bg-gray-50 flex flex-col max-h-full">
            <button
                type="button"
                class="mb-5 w-full text-sm py-4 bg-black text-white font-bold hover:bg-customRed"
                @click="utils.resetChatroom"
            >
                NEW CHAT
            </button>
            <nav class="flex-1 flex flex-col overflow-y-auto">
                <div v-for="chatroom in chatrooms" :key="chatroom.id">
                    <div v-if="editingChatroomId === chatroom.id">
                        <p
                            ref="editableElement"
                            @blur="(e) => editChatroomName(e, chatroom.id)"
                            contenteditable="true"
                            class="outline-rose-500 p-1 flex-1"
                        >
                            {{ chatroom.title }}
                        </p>
                    </div>
                    <div
                        v-else
                        @click="handleChatroomSelect(chatroom.id)"
                        class="flex aside-chatroom hover:bg-gray-200 cursor-pointer p-2 rounded-lg"
                    >
                        <p class="flex-1 truncate">
                            <span>{{ chatroom.title.slice(0, 10) }}</span>
                            <span
                                v-if="chatroom.title.length > 10"
                                :title="chatroom.title"
                            >
                                {{ chatroom.title.slice(10) }}
                            </span>
                        </p>
                        <div class="relative">
                            <!-- Element Plus Dropdown -->
                            <el-dropdown placement="bottom">
                                <Icon
                                    name="material-symbols:more-horiz"
                                    class="more-icon text-gray-500 w-5 h-5 cursor-pointer"
                                />
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            @click="
                                                setEditingChatroom(chatroom.id)
                                            "
                                        >
                                            <p class="flex gap-3 i-center">
                                                <Icon
                                                    name="material-symbols:edit-outline"
                                                    class="text-lg text-zinc-800"
                                                />
                                                수정
                                            </p>
                                        </el-dropdown-item>
                                        <el-dropdown-item
                                            @click="
                                                openDeleteModal(chatroom.id)
                                            "
                                        >
                                            <p
                                                class="flex gap-3 i-center text-red-600"
                                            >
                                                <Icon
                                                    name="material-symbols:delete-forever"
                                                    class="text-lg"
                                                />
                                                삭제
                                            </p>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>
                    </div>
                </div>
            </nav>
        </aside>

        <!-- 삭제 확인 모달 -->
        <div
            v-if="isDeleteModalVisible"
            class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            @click.self="closeDeleteModal"
        >
            <div class="bg-white rounded-lg shadow-lg p-6 w-96">
                <h2 class="text-xl text-red-600 font-bold mb-5 text-center">
                    채팅방 삭제
                </h2>
                <p class="text-gray-700 mb-1">
                    해당 채팅방을 삭제하시겠습니까?
                </p>
                <p class="text-gray-700 mb-6">삭제 시 복구될 수 없습니다.</p>
                <div class="flex justify-end gap-4">
                    <button
                        @click="closeDeleteModal"
                        class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700"
                    >
                        취소
                    </button>
                    <button
                        @click="confirmDelete"
                        class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                        삭제
                    </button>
                </div>
            </div>
        </div>

        <!-- 우측 채팅 영역 -->
        <section class="flex-1 bg-white content-center">
            <div class="mx-auto w-[768px] flex flex-col h-full justify-center">
                <main
                    v-if="selectedChatroom"
                    ref="chatLogHistory"
                    id="chat_histroy"
                    class="flex-1 overflow-y-auto"
                >
                    <div
                        class="flex-col justify-end flex gap-3 p-3"
                        v-for="(chat, index) in selectedChatroom.chats"
                        :key="index"
                    >
                        <p
                            class="px-5 py-2.5 bg-gray-100 break-words rounded-3xl ms-auto max-w-[70%]"
                        >
                            {{ chat.question }}
                        </p>
                        <div class="p-2 flex gap-3">
                            <div
                                class="flex justify-center items-center border border-gray-200 w-8 h-8 rounded-full break-keep"
                            >
                                {{
                                    selectedChatroom.model
                                        .slice(0, 1)
                                        .toUpperCase()
                                }}
                            </div>
                            <p class="leading-8 flex-1 break-keep">
                                {{ chat.response }}
                            </p>
                        </div>
                    </div>
                    <div
                        v-if="awaitingLlmResponse"
                        class="flex-col justify-end flex gap-3 p-3"
                    >
                        <p
                            class="px-5 py-2.5 bg-gray-100 break-words rounded-3xl ms-auto w-fit max-w-[70%]"
                        >
                            {{ question }}
                        </p>
                        <div class="p-2 flex gap-3">
                            <div
                                class="flex justify-center items-center border border-gray-200 w-8 h-8 rounded-full break-keep"
                            >
                                {{
                                    selectedChatroom.model
                                        .slice(0, 1)
                                        .toUpperCase()
                                }}
                            </div>
                            <p
                                v-loading="true"
                                class="leading-8 break-keep"
                            ></p>
                        </div>
                    </div>
                </main>
                <h3 class="text-3xl text-center font-bold" v-else>
                    무엇을 도와드릴까요?
                </h3>

                <form
                    @submit.prevent="send"
                    class="p-5 flex items-center gap-2"
                >
                    <input
                        ref="chatInput"
                        v-model="question"
                        :disabled="awaitingLlmResponse"
                        type="text"
                        class="py-2.5 px-5 outline-none bg-gray-200 w-full rounded-full overflow-y-auto"
                    />
                    <button
                        type="button"
                        class="bg-black text-white px-2 py-2 rounded-full flex items-center justify-center hover:text-gray-300"
                        @click="send"
                        :disabled="awaitingLlmResponse"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="currentColor"
                                d="M12 2a1 1 0 0 1 .894.553l9 18a1 1 0 0 1-1.11 1.423L12 20.024l-8.783 1.952a1 1 0 0 1-1.111-1.423l9-18A1 1 0 0 1 12 2m1 16.198l6.166 1.37L13 7.236zM11 7.236L4.834 19.568L11 18.198z"
                            />
                        </svg>
                    </button>
                </form>
                <div class="text-center" v-if="!selectedChatroom">
                    <button
                        class="text-white bg-black rounded-full px-5 py-2"
                        @click="dialogFormVisible = true"
                    >
                        {{ MODEL_NAME_TO_LABEL[form.model] }}
                    </button>
                </div>
            </div>
        </section>
    </div>

    <!-- Element Plus Dialog: LLM 선택 -->
    <el-dialog v-model="dialogFormVisible" title="LLM select" width="500">
        <el-form :model="form">
            <el-form-item label="LLM">
                <el-select
                    v-model="form.model"
                    placeholder="Please select a LLM"
                    @change="handleModelChange"
                >
                    <el-option
                        v-for="model in form.models"
                        :key="model"
                        :label="MODEL_NAME_TO_LABEL[model]"
                        :value="model"
                    />
                </el-select>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script setup>
import { ref, reactive } from "vue";

/* 더미 데이터 및 간단한 로직 */

// 채팅방 더미 데이터
const chatrooms = ref([
    {
        id: 1,
        title: "첫번째 채팅방",
        model: "GPT",
        chats: [
            {
                question: "안녕하세요?",
                response: "안녕하세요! 무엇을 도와드릴까요?",
            },
            {
                question: "오늘 날씨 어때요?",
                response: "오늘은 맑고 화창합니다.",
            },
        ],
    },
    {
        id: 2,
        title: "두번째 채팅방",
        model: "Solar",
        chats: [
            {
                question: "뭐해?",
                response: "채팅 중입니다.",
            },
        ],
    },
]);

// 현재 선택된 채팅방 (초기엔 첫번째 채팅방을 선택)
const selectedChatroom = ref(chatrooms.value[0]);

// 채팅 입력값
const question = ref("");

// 에디팅 및 삭제 관련 상태
const editingChatroomId = ref(-1);
const isDeleteModalVisible = ref(false);
const chatroomToDelete = ref(null);
const editableElement = ref(null);

// 전송 중 여부 (더미 시연용)
const awaitingLlmResponse = ref(false);

// LLM 선택 Dialog 관련 더미 데이터
const dialogFormVisible = ref(false);
const form = reactive({
    model: "GPT",
    models: ["GPT", "Solar"],
});
const MODEL_NAME_TO_LABEL = {
    GPT: "GPT",
    Solar: "Solar",
};

// 유틸 함수 (더미)
const utils = {
    resetChatroom() {
        selectedChatroom.value = null;
    },
};

const handleModelChange = (value) => {
    dialogFormVisible.value = false;
};

// 채팅방 선택 (더미)
const handleChatroomSelect = (chatroomId) => {
    const found = chatrooms.value.find((c) => c.id === chatroomId);
    if (found) {
        selectedChatroom.value = found;
    }
};

// 메시지 전송 (더미)
const send = () => {
    if (!selectedChatroom.value || !question.value.trim()) return;
    // 간단히 질문과 더미 응답 추가
    selectedChatroom.value.chats.push({
        question: question.value,
        response: "더미 응답입니다.",
    });
    question.value = "";
};

// 에디팅 모드 전환 (더미)
const setEditingChatroom = (chatroomId) => {
    editingChatroomId.value = chatroomId;
};

// 에디팅 완료 후 제목 수정 (더미)
const editChatroomName = (event, chatroomId) => {
    const newTitle = event.target.textContent.trim();
    const chatroom = chatrooms.value.find((c) => c.id === chatroomId);
    if (chatroom) {
        chatroom.title = newTitle;
    }
    editingChatroomId.value = -1;
};

// 삭제 모달 열기 (더미)
const openDeleteModal = (chatroomId) => {
    chatroomToDelete.value = chatroomId;
    isDeleteModalVisible.value = true;
};

// 삭제 모달 닫기 (더미)
const closeDeleteModal = () => {
    chatroomToDelete.value = null;
    isDeleteModalVisible.value = false;
};

// 삭제 확인 (더미)
const confirmDelete = () => {
    if (chatroomToDelete.value !== null) {
        // 해당 채팅방 제거
        chatrooms.value = chatrooms.value.filter(
            (c) => c.id !== chatroomToDelete.value
        );
        if (
            selectedChatroom.value &&
            selectedChatroom.value.id === chatroomToDelete.value
        ) {
            selectedChatroom.value = null;
        }
        closeDeleteModal();
    }
};
</script>

<style scoped lang="scss">
/* 필요에 따라 스타일을 수정하세요 */
// 예: #chat_app {
//   height: calc(100vh - 72px);
// }
</style>
