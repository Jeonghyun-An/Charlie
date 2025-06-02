<template>
    <div>
        <div v-for="(value, key, idx) in data" :key="idx">
            <template v-if="Array.isArray(value) && key === '내프로필'">
                <ul class="ml-4 p-2 list-disc">
                    <li
                        v-for="(member, index) in value"
                        :key="index"
                        draggable="true"
                        @dragstart="(e) => handleDragStart(e, member)"
                    >
                        {{ member }}
                    </li>
                </ul>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{ data: Record<string, any> }>();

// 드래그 시작 핸들러
const handleDragStart = (event: DragEvent, value: string) => {
    if (event.dataTransfer) {
        const payload = {
            label: value,
            type: value.includes("팀") ? "팀" : "개인",
        };
        event.dataTransfer.setData("application/json", JSON.stringify(payload));
        event.dataTransfer.effectAllowed = "move";
    }
    console.log(event);
};
</script>
