<template>
    <div
        v-if="dialogVisible"
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
        <div class="bg-white rounded-xl shadow-lg w-96 p-6">
            <!-- 다이얼로그 헤더 -->
            <div class="flex justify-between items-center border-b pb-3 mb-4">
                <h2 class="text-lg font-semibold">LLM 모델 선택</h2>
                <button
                    @click="dialogVisible = false"
                    class="text-gray-500 hover:text-gray-800"
                >
                    ✕
                </button>
            </div>

            <!-- 드롭다운 메뉴 -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2"
                    >모델 선택</label
                >
                <select
                    v-model="selectedModel"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
                >
                    <option
                        v-for="model in models"
                        :key="model._id"
                        :value="model.name"
                    >
                        {{ model.name }}
                    </option>
                </select>
            </div>

            <!-- 버튼 영역 -->
            <div class="flex justify-end space-x-2">
                <button
                    @click="dialogVisible = false"
                    class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition"
                >
                    취소
                </button>
                <button
                    @click="confirmSelection"
                    class="px-4 py-2 bg-black hover:bg-zinc-700 text-white rounded-xl transition"
                >
                    확인
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const API_URL = "http://localhost:3001/api";
const dialogVisible = ref(false);
const models = ref([]);
const selectedModel = ref(null);

const fetchModels = async () => {
    try {
        const res = await axios.get(`${API_URL}/models`);
        models.value = res.data.data;
    } catch (error) {
        console.error("모델 불러오기 실패:", error);
    }
};

const confirmSelection = () => {
    if (!selectedModel.value) {
        alert("모델을 선택하세요!");
        return;
    }
    console.log("선택된 모델:", selectedModel.value);
    dialogVisible.value = false;
};

onMounted(fetchModels);

defineExpose({ dialogVisible, selectedModel });
</script>
