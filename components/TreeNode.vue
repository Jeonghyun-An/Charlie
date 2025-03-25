<template>
    <li class="mb-1">
        <div
            :class="[
                'flex items-center gap-1 py-1 px-1 rounded',
                'hover:bg-zinc-100',
                level === 0 ? 'font-semibold' : '',
            ]"
        >
            <button
                v-if="node.children?.length"
                @click="emit('toggle-expand', node.id)"
                class="w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-zinc-800"
            >
                <span v-if="expanded">▼</span>
                <span v-else>▶</span>
            </button>
            <span v-else class="w-5"></span>

            <span class="mr-1">
                <span v-if="node.type === 'company'">🏢</span>
                <span
                    v-else-if="
                        node.type === 'team' || node.type === 'department'
                    "
                    >👥</span
                >
                <span v-else>👤</span>
            </span>

            <span :class="nameClasses">{{ displayName }}</span>
            <span v-if="node.position" class="text-xs ml-1 text-zinc-500">{{
                node.position
            }}</span>
            <span v-if="node.path?.length" class="text-xs ml-2 text-zinc-400">
                {{ node.path.join(" / ") }}
            </span>

            <button
                @click="emit('remove', node.id)"
                class="ml-auto text-zinc-400 hover:text-red-500 text-xs px-1"
            >
                ✕
            </button>
        </div>

        <ul
            v-if="typedChildren.length && expanded"
            class="pl-6 mt-1 border-l border-zinc-200"
        >
            <EnhancedTreeNode
                v-for="(child, i) in typedChildren"
                :key="child.id"
                :node="child"
                :level="level + 1"
                :expanded="isNodeExpanded(child.id)"
                @remove="emit('remove', $event)"
                @toggle-expand="emit('toggle-expand', $event)"
            />
        </ul>
    </li>
</template>

<script setup lang="ts">
import { computed, inject, ref, type Ref } from "vue";
import EnhancedTreeNode from "@/components/TreeNode.vue";
import type { TreeNodeItem } from "@/types/tree";

const props = defineProps<{
    node: TreeNodeItem;
    level: number;
    expanded: boolean;
}>();

const emit = defineEmits<{
    (e: "remove", id: string): void;
    (e: "toggle-expand", id: string): void;
}>();

// 확장 상태 주입 (타입 문제 해결을 위한 기본값 설정 변경)
const expandedState = inject<Ref<Record<string, boolean>>>(
    "expandedState",
    ref({})
);

// 노드의 확장 상태를 확인하는 함수 추가
const isNodeExpanded = (id: string): boolean => {
    return expandedState.value[id] || false;
};

// 💥 여기서 자식 노드의 타입을 명확히 설정!
const typedChildren = computed(() => {
    return (props.node.children ?? []) as TreeNodeItem[];
});

const nameClasses = computed(() => {
    const classes: string[] = [];
    if (props.node.type === "company") classes.push("text-blue-800");
    else if (props.node.type === "team" || props.node.type === "department")
        classes.push("text-green-700");
    if (props.level === 0) classes.push("font-medium");
    return classes.join(" ");
});

const displayName = computed(() => {
    if (props.node.position) {
        const nameParts = props.node.name.split(" ");
        if (nameParts.length > 1) {
            return nameParts.slice(0, -1).join(" ");
        }
    }
    return props.node.name;
});
</script>
