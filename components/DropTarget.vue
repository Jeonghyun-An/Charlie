<template>
    <div
        class="p-4 border border-dashed border-zinc-400 rounded-md min-h-[200px]"
        @dragover.prevent
        @drop="handleDrop"
    >
        <div class="flex justify-between items-center mb-4">
            <h2 class="font-semibold">선택된 대상</h2>
            <div class="flex gap-2">
                <button
                    v-if="tree.length"
                    @click="collapseAll"
                    class="text-xs px-2 py-1 bg-zinc-200 rounded hover:bg-zinc-300"
                >
                    모두 접기
                </button>
                <button
                    v-if="tree.length"
                    @click="expandAll"
                    class="text-xs px-2 py-1 bg-zinc-200 rounded hover:bg-zinc-300"
                >
                    모두 펼치기
                </button>
                <button
                    v-if="tree.length"
                    @click="clearTree"
                    class="text-xs px-2 py-1 bg-red-100 rounded hover:bg-red-200 text-red-700"
                >
                    모두 지우기
                </button>
            </div>
        </div>

        <div
            v-if="tree.length"
            class="overflow-auto max-h-[500px] border border-zinc-200 rounded p-2 bg-white"
        >
            <ul class="pl-2">
                <EnhancedTreeNode
                    v-for="(node, i) in tree"
                    :key="i"
                    :node="node"
                    :level="0"
                    :expanded="expandedState[node.id] || false"
                    @remove="removeNode"
                    @toggle-expand="toggleExpand"
                />
            </ul>
        </div>

        <div
            v-else
            class="flex flex-col items-center justify-center h-32 text-zinc-400 text-sm border-2 border-dashed border-zinc-300 rounded-lg bg-zinc-50"
        >
            <div class="mb-2">
                👈 왼쪽 조직도에서 드래그해서 여기로 놓으세요
            </div>
            <div class="text-xs text-zinc-500">
                팀, 부서 또는 개별 인원을 드래그할 수 있습니다
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, type Ref, onMounted, provide } from "vue";
import EnhancedTreeNode from "@/components/TreeNode.vue";
import type { TreeNodeItem } from "@/types/tree";

const tree = ref<TreeNodeItem[]>([]);
const expandedState: Ref<Record<string, boolean>> = ref({});
provide("expandedState", expandedState);

const toggleExpand = (id: string): void => {
    expandedState.value[id] = !(expandedState.value[id] || false);
};

const expandAll = (): void => {
    traverseTree(tree.value, (node) => {
        if (node.children?.length) expandedState.value[node.id] = true;
    });
};

const collapseAll = (): void => {
    traverseTree(tree.value, (node) => {
        if (node.children?.length) expandedState.value[node.id] = false;
    });
};

const clearTree = (): void => {
    if (confirm("모든 선택 항목을 삭제하시겠습니까?")) {
        tree.value = [];
        expandedState.value = {};
    }
};

const traverseTree = (
    nodes: TreeNodeItem[],
    callback: (node: TreeNodeItem) => void
): void => {
    nodes.forEach((node) => {
        callback(node);
        if (node.children?.length) traverseTree(node.children, callback);
    });
};

const generateId = (type: string, name: string): string =>
    `${type}-${name.replace(/\s+/g, "-").toLowerCase()}`;

const extractNameAndPosition = (
    fullName: string
): { name: string; position: string } => {
    const match = fullName.match(/^(.+?)\s(.+?)$/);
    return match
        ? { name: match[1], position: match[2] }
        : { name: fullName, position: "" };
};

const findNodeById = (
    nodes: TreeNodeItem[],
    id: string
): TreeNodeItem | null => {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children?.length) {
            const found = findNodeById(node.children, id);
            if (found) return found;
        }
    }
    return null;
};

const removeNode = (id: string): void => {
    const topLevelIndex = tree.value.findIndex((node) => node.id === id);
    if (topLevelIndex !== -1) {
        tree.value.splice(topLevelIndex, 1);
        delete expandedState.value[id];
        return;
    }
    const removeFromChildren = (nodes: TreeNodeItem[]): boolean => {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (!node.children) continue;
            const childIndex = node.children.findIndex(
                (child) => child.id === id
            );
            if (childIndex !== -1) {
                node.children.splice(childIndex, 1);
                delete expandedState.value[id];
                return true;
            }
            if (removeFromChildren(node.children)) return true;
        }
        return false;
    };
    removeFromChildren(tree.value);
};

const ensureTeamPath = (path: string[]): TreeNodeItem[] => {
    let current = tree.value;
    const fullPath: TreeNodeItem[] = [];

    for (const segment of path) {
        let node = current.find(
            (n) =>
                (n.type === "team" || n.type === "department") &&
                n.name === segment
        );
        if (!node) {
            node = {
                name: segment,
                type: "team",
                id: generateId("team", segment),
                children: [],
            };
            current.push(node);
        }
        fullPath.push(node);
        if (!node.children) node.children = [];
        current = node.children;
    }

    return fullPath;
};

const insertRecursiveTeam = (
    node: DragDataTeam,
    path: string[] = []
): TreeNodeItem => {
    const teamPath = [...path, node.name];
    const teamChain = ensureTeamPath(teamPath);
    const teamNode = teamChain[teamChain.length - 1];
    teamNode.children = teamNode.children || [];

    node.members.forEach((member: string) => {
        const memberId = generateId("member", member);
        removeNode(memberId);
        const { position } = extractNameAndPosition(member);

        const exists = teamNode.children?.some((c) => c.id === memberId);
        if (!exists) {
            teamNode.children!.push({
                name: member,
                type: "member",
                id: memberId,
                position,
                path: teamPath,
            });
            expandedState.value[memberId] = true;
        }
    });

    if (node.children?.length) {
        node.children.forEach((childTeam) => {
            insertRecursiveTeam(childTeam, teamPath);
        });
    }

    expandedState.value[teamNode.id] = true;
    return teamNode;
};

const insertMemberToTeamByPath = (
    member: TreeNodeItem,
    path: string[]
): boolean => {
    const fullPath: TreeNodeItem[] = ensureTeamPath(path);
    const targetTeam = fullPath[fullPath.length - 1];
    const exists = targetTeam.children!.some((child) => child.id === member.id);
    if (!exists) targetTeam.children!.push(member);
    return true;
};

const handleDrop = (event: DragEvent): void => {
    const data = event.dataTransfer?.getData("application/json");
    if (!data) return;

    try {
        const parsed = JSON.parse(data) as DragData;

        if (parsed.type === "member") {
            const { name, position } = extractNameAndPosition(parsed.name);
            const memberId = generateId("member", parsed.name);
            const existingNode = findNodeById(tree.value, memberId);
            if (existingNode) removeNode(memberId);

            const newNode: TreeNodeItem = {
                name: parsed.name,
                type: "member",
                id: memberId,
                position,
                path: parsed.path,
            };

            const inserted = parsed.path
                ? insertMemberToTeamByPath(newNode, parsed.path)
                : false;
            if (!inserted) tree.value.push(newNode);
            expandedState.value[memberId] = true;
            expandAll();
        } else if (parsed.type === "team" || parsed.type === "department") {
            // 중복된 team path 삽입 방지 (기존에 존재하는 동일 팀 + 동일 path 제거)
            const fullTeamId = generateId(
                "team",
                [...(parsed.path || []), parsed.name].join("-")
            );
            const existingTeam = findNodeById(tree.value, fullTeamId);
            if (existingTeam) removeNode(fullTeamId);

            insertRecursiveTeam(parsed, parsed.path);
            expandAll();
        }
    } catch (err) {
        console.error("❌ 드롭 데이터 파싱 오류:", err);
    }
};

interface DragDataMember {
    type: "member";
    name: string;
    path?: string[];
}
interface DragDataTeam {
    type: "team" | "department";
    name: string;
    members: string[];
    path?: string[];
    children?: DragDataTeam[];
}
interface DragDataCompany {
    type: "company";
    name: string;
    members: string[];
    path?: string[];
}
type DragData = DragDataMember | DragDataTeam | DragDataCompany;

onMounted(() => {
    expandAll();
});
</script>
