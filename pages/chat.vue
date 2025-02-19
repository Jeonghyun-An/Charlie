<template>
    <div id="chat_app" class="flex">
        <aside class="p-4 w-60 bg-gray-50 flex flex-col max-h-full">
            <button
                type="button"
                class="mb-5 w-full text-sm py-4 bg-black text-white font-bold hover:bg-customRed"
                @click="utils.resetChatroom"
            >
                NEW CHAT
            </button>
            <nav class="flex-1 flex flex-col overflow-y-auto">
                <div v-for="chatroom in chatrooms" class="">
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

        <section class="flex-1 bg-white">
            <div class="mx-auto w-[768px] flex flex-col h-full justify-center">
                <main
                    v-if="selectedChatroom"
                    ref="chatLogHistory"
                    id="chat_histroy"
                    class="flex-1 overflow-y-auto"
                >
                    <div
                        class="flex-col justify-end flex gap-3 p-3"
                        v-for="chat in selectedChatroom.chats"
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
                                        .split("")[0]
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
                                        .split("")[0]
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

                <!-- 전송 버튼 -->
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
                    <!-- 전송 버튼 -->
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

    <el-dialog v-model="dialogFormVisible" title="LLM select" width="500">
        <el-form :model="form">
            <el-form-item label="LLM">
                <el-select
                    v-model="form.model"
                    placeholder="Please select a LLM"
                >
                    <el-option
                        @click="dialogFormVisible = false"
                        plain
                        v-for="model in form.models"
                        :label="MODEL_NAME_TO_LABEL[model]"
                        :value="model"
                    />
                </el-select>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<style scoped lang="scss">
// #chat_app {
//     height: calc(100dvh - 72px);
// }

// main::-webkit-scrollbar {
//     display: none;
// }
//
</style>

//
<script setup>
// definePageMeta({ layout: "default" });

// import { CHAT_SERVICE, CHATROOM_SERVICE } from "~/services/common";
// import { useStoreUser } from "~/stores/store.user";
// import { MODELS, MODEL_NAME_TO_LABEL } from "~/utils/models";

// const form = reactive({
//     model: MODELS[0],
//     models: MODELS,
// });
// const dialogFormVisible = ref(false);

// const storeUser = useStoreUser();

// const chatLogHistory = ref(null);
// const chatInput = ref(null);

// const editableElement = ref([]);
// const chatrooms = ref([]);
// const question = ref("");
// const editingChatroomId = ref(-1);
// const selectedChatroomId = ref(-1);
// const awaitingLlmResponse = ref(false);
// const selectedChatroom = ref(null);

// const isDeleteModalVisible = ref(false); // 모달 창 표시 여부
// const chatroomToDelete = ref(null); // 삭제할 채팅방 ID

// const utils = {
//     resetChatroom() {
//         selectedChatroomId.value = -1;
//         selectedChatroom.value = null;
//     },
//     focusOnInput() {
//         console.log(chatInput.value);
//         chatInput.value?.focus();
//     },
//     scrollToBottom() {
//         chatLogHistory.value?.scrollTo({
//             top: chatLogHistory.value.scrollHeight,
//             behavior: "smooth",
//         });
//     },
//     async renderChatrooms() {
//         try {
//             const { data: chatroomsData } = await CHATROOM_SERVICE.getAll();
//             chatrooms.value = chatroomsData.value.response;
//         } catch (error) {
//             console.error("Failed to fetch chatrooms:", error);
//         }
//     },
//     async renderChatroom(chatroomId) {
//         try {
//             const { data: chatroomData } = await CHATROOM_SERVICE.get(
//                 chatroomId
//             );
//             selectedChatroomId.value = chatroomId;
//             selectedChatroom.value = {
//                 ...chatroomData.value.response,
//                 chats: chatroomData.value.response.chats.map((chat) => {
//                     try {
//                         const parsedResponse = JSON.parse(chat.response);
//                         return {
//                             ...chat,
//                             response: parsedResponse.response || chat.response, // 순수 모델 응답
//                             metadata: parsedResponse.metadata || {}, // 메타데이터
//                         };
//                     } catch (error) {
//                         console.error(
//                             "Failed to parse chat response:",
//                             chat.response,
//                             error
//                         );
//                         return {
//                             ...chat,
//                             response: chat.response, // 원본 응답 그대로 사용
//                             metadata: {}, // 기본 빈 객체로 설정
//                         };
//                     }
//                 }),
//             };
//             nextTick(utils.scrollToBottom);
//         } catch (error) {
//             console.error("Failed to fetch chatroom details:", error);
//         }
//     },
// };

// onMounted(utils.renderChatrooms);

// const send = async () => {
//     if (awaitingLlmResponse.value || !question.value.trim()) return;
//     // 만약에 선택된 채팅방이 없을 경우
//     awaitingLlmResponse.value = true;

//     nextTick(utils.scrollToBottom);

//     let activeChatroomId = selectedChatroomId.value;
//     if (!selectedChatroom.value) {
//         const { data: createChatroomData } = await CHATROOM_SERVICE.create({
//             model: form.model,
//             title: question.value,
//             userId: storeUser.id,
//         });
//         const createdChatroom = createChatroomData.value.response;
//         activeChatroomId = createdChatroom.id;
//         selectedChatroom.value = createdChatroom;
//     }

//     await CHAT_SERVICE.send(activeChatroomId, { question: question.value });

//     await utils.renderChatrooms();
//     await utils.renderChatroom(activeChatroomId);

//     question.value = "";
//     awaitingLlmResponse.value = false;
//     nextTick(utils.focusOnInput);
// };

// const openDeleteModal = (chatroomId) => {
//     chatroomToDelete.value = chatroomId;
//     isDeleteModalVisible.value = true;
// };

// const closeDeleteModal = () => {
//     chatroomToDelete.value = null;
//     isDeleteModalVisible.value = false;
// };

// const confirmDelete = async () => {
//     if (chatroomToDelete.value !== null) {
//         await deleteChatroom(chatroomToDelete.value);
//         closeDeleteModal();
//     }
// };

// const deleteChatroom = async (chatroomId) => {
//     if (selectedChatroomId.value === chatroomId) {
//         utils.resetChatroom();
//     }
//     await CHATROOM_SERVICE.delete(chatroomId);
//     await utils.renderChatrooms();
// };

// const setEditingChatroom = async (chatroomId) => {
//     editingChatroomId.value = chatroomId;
//     nextTick(() => {
//         const $el = editableElement.value.at(0);
//         $el?.focus();
//     });
// };

// const editChatroomName = async (event, chatroomId) => {
//     await CHATROOM_SERVICE.update(chatroomId, {
//         title: event.target.textContent.trim(),
//     });
//     await utils.renderChatrooms();
//     await utils.renderChatroom(selectedChatroomId.value);
//     editingChatroomId.value = -1;
// };

// const handleChatroomSelect = async (chatroomId) => {
//     utils.renderChatroom(chatroomId);
// };
</script>
