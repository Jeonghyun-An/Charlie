<!-- <template>
    <div
        class="min-h-40 border-2 border-dashed border-zinc-300 rounded-lg p-4 mt-6"
        @dragover.prevent
        @drop="handleDrop"
    >
        <h3 class="text-lg font-semibold mb-2">드롭된 항목</h3>
        <div v-if="droppedItems.length">
            <ul class="space-y-1 text-sm">
                <li v-for="(item, idx) in droppedItems" :key="idx">
                    {{ item.label }}
                </li>
            </ul>
        </div>
        <div v-else class="text-zinc-400 text-sm">
            드래그해서 여기로 놓으세요.
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const droppedItems = ref<{ label: string; value: any }[]>([]);

const handleDrop = (event: DragEvent) => {
    const data = event.dataTransfer?.getData("application/json");
    if (data) {
        const parsed = JSON.parse(data);
        droppedItems.value.push(parsed);
    }
};
</script> -->
<template>
    <div
        class="p-4 border border-dashed border-zinc-400 rounded-md min-h-[200px]"
        @dragover.prevent
        @drop="handleDrop"
    >
        <h2 class="font-semibold mb-2">📥 선택된 대상</h2>
        <ul class="list-disc pl-5 space-y-1">
            <li v-for="(item, index) in selectedMembers" :key="index">
                {{ item }}
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const selectedMembers = ref<string[]>([]);

const handleDrop = (event: DragEvent) => {
    const transfer = event.dataTransfer;
    if (!transfer) return;

    const data = transfer.getData("application/json");
    if (!data) return;

    try {
        const parsed = JSON.parse(data);
        const membersToAdd: string[] =
            parsed.type === "member" ? [parsed.name] : parsed.members;

        // 중복 제거
        membersToAdd.forEach((member) => {
            if (!selectedMembers.value.includes(member)) {
                selectedMembers.value.push(member);
            }
        });
    } catch (error) {
        console.error("❌ 드롭 데이터 파싱 오류:", error);
    }
};
</script>
