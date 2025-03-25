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
                    @remove="removeNode"
                    :expanded="expandedState[node.id] || false"
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

// 필요한 타입 정의 (타입 파일에 이미 정의되어 있다면 import만 하면 됩니다)
// TreeNodeItem 타입이 types/tree.ts에 정의되어 있지 않다면 여기 추가하세요:
/* 
interface TreeNodeItem {
    id: string;
    name: string;
    type: 'member' | 'team' | 'department' | 'company';
    children?: TreeNodeItem[];
    position?: string;
    path?: string[];
}

interface DragDataMember {
    type: 'member';
    name: string;
}

interface DragDataTeam {
    type: 'team' | 'department';
    name: string;
    members: string[];
}

interface DragDataCompany {
    type: 'company';
    name: string;
    members: string[];
}

type DragData = DragDataMember | DragDataTeam | DragDataCompany;
*/

const tree = ref<TreeNodeItem[]>([]);
const expandedState: Ref<Record<string, boolean>> = ref({});
provide("expandedState", expandedState);

// 노드 확장/축소 상태 토글
const toggleExpand = (id: string): void => {
    expandedState.value[id] = !(expandedState.value[id] || false);
};

// 모든 노드 확장
const expandAll = (): void => {
    traverseTree(tree.value, (node) => {
        if (node.children?.length) {
            expandedState.value[node.id] = true;
        }
    });
};

// 모든 노드 축소
const collapseAll = (): void => {
    traverseTree(tree.value, (node) => {
        if (node.children?.length) {
            expandedState.value[node.id] = false;
        }
    });
};

// 모든 노드 삭제
const clearTree = (): void => {
    if (confirm("모든 선택 항목을 삭제하시겠습니까?")) {
        tree.value = [];
        expandedState.value = {};
    }
};

// 트리 순회 함수
const traverseTree = (
    nodes: TreeNodeItem[],
    callback: (node: TreeNodeItem) => void
): void => {
    nodes.forEach((node) => {
        callback(node);
        if (node.children?.length) {
            traverseTree(node.children, callback);
        }
    });
};

// ID 생성 함수
const generateId = (type: string, name: string): string => {
    return `${type}-${name.replace(/\s+/g, "-").toLowerCase()}`;
};

// 이름에서 직책 분리
const extractNameAndPosition = (
    fullName: string
): { name: string; position: string } => {
    const match = fullName.match(/^(.+?)\s(.+?)$/);
    if (match) {
        return { name: match[1], position: match[2] };
    }
    return { name: fullName, position: "" };
};

// 트리에서 노드 찾기
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

// 트리에서 노드 제거
const removeNode = (id: string): void => {
    // 최상위 노드 확인
    const topLevelIndex = tree.value.findIndex((node) => node.id === id);
    if (topLevelIndex !== -1) {
        tree.value.splice(topLevelIndex, 1);
        return;
    }

    // 하위 노드 확인
    const removeFromChildren = (nodes: TreeNodeItem[]): boolean => {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];

            // 명시적 타입 가드
            if (!node.children) continue;

            // 이제 TypeScript는 children이 확실히 존재함을 인식합니다
            const childIndex = node.children.findIndex(
                (child) => child.id === id
            );

            if (childIndex !== -1) {
                // children 배열이 존재하는 것을 확인했으므로 안전하게 사용 가능
                node.children.splice(childIndex, 1);

                // 자식이 없어지면 빈 배열로 설정
                if (node.children.length === 0) {
                    node.children = [];
                }
                return true;
            }

            // 재귀 호출에서도 children이 확실히 배열임을 알고 있음
            if (node.children.length > 0 && removeFromChildren(node.children)) {
                return true;
            }
        }
        return false;
    };

    removeFromChildren(tree.value);
};
// 멤버가 어떤 팀에도 속하지 않았는지 확인
const isIndependentMember = (memberName: string): boolean => {
    const nameOnly = extractNameAndPosition(memberName).name;

    const findMemberInChildren = (nodes: TreeNodeItem[]): boolean => {
        for (const node of nodes) {
            if (
                node.children?.some(
                    (child) =>
                        child.type === "member" &&
                        extractNameAndPosition(child.name).name === nameOnly
                )
            ) {
                return true;
            }
            if (node.children?.length) {
                if (findMemberInChildren(node.children)) return true;
            }
        }
        return false;
    };

    return !findMemberInChildren(tree.value);
};

// 드롭 이벤트 처리
interface DragDataMember {
    type: "member";
    name: string;
}

interface DragDataTeam {
    type: "team" | "department";
    name: string;
    members: string[];
}

interface DragDataCompany {
    type: "company";
    name: string;
    members: string[];
}

type DragData = DragDataMember | DragDataTeam | DragDataCompany;

const handleDrop = (event: DragEvent): void => {
    const data = event.dataTransfer?.getData("application/json");
    if (!data) return;

    try {
        const parsed = JSON.parse(data) as DragData;

        if (parsed.type === "member") {
            const { name, position } = extractNameAndPosition(parsed.name);
            const memberId = generateId("member", parsed.name);

            // 이미 독립적으로 추가된 멤버인지 확인
            const existingNode = findNodeById(tree.value, memberId);
            if (existingNode) return;

            // 이미 다른 팀에 포함된 멤버인지 확인
            if (!isIndependentMember(parsed.name)) return;

            // 멤버 추가
            const newNode: TreeNodeItem = {
                name: parsed.name,
                type: "member",
                id: memberId,
                position: position,
            };

            tree.value.push(newNode);
            expandedState.value[memberId] = true;
        } else if (parsed.type === "team" || parsed.type === "department") {
            const teamId = generateId(parsed.type, parsed.name);

            // 이미 추가된 팀인지 확인
            if (findNodeById(tree.value, teamId)) return;

            // 팀에 속한 멤버 중 중복을 제거
            const uniqueMembers = parsed.members.filter((member: string) =>
                isIndependentMember(member)
            );

            // 팀과 멤버 추가
            const memberNodes: TreeNodeItem[] = uniqueMembers.map(
                (member: string) => {
                    const { name: memberName, position } =
                        extractNameAndPosition(member);
                    return {
                        name: member,
                        type: "member" as const,
                        id: generateId("member", member),
                        position: position,
                        path: [parsed.name],
                    };
                }
            );

            const newNode: TreeNodeItem = {
                name: parsed.name,
                type: parsed.type,
                id: teamId,
                children: memberNodes,
            };

            tree.value.push(newNode);
            expandedState.value[teamId] = true;
        } else if (parsed.type === "company") {
            const companyId = generateId("company", parsed.name);

            // 이미 추가된 회사인지 확인
            if (findNodeById(tree.value, companyId)) return;

            // 전체 구성원 중 아직 추가되지 않은 멤버만 필터링
            const uniqueMembers = parsed.members.filter((member: string) =>
                isIndependentMember(member)
            );

            // 회사와 모든 멤버 추가
            const memberNodes: TreeNodeItem[] = uniqueMembers.map(
                (member: string) => {
                    const { name: memberName, position } =
                        extractNameAndPosition(member);
                    return {
                        name: member,
                        type: "member" as const,
                        id: generateId("member", member),
                        position: position,
                        path: [parsed.name],
                    };
                }
            );

            const newNode: TreeNodeItem = {
                name: parsed.name,
                type: "company" as const,
                id: companyId,
                children: memberNodes,
            };

            tree.value.push(newNode);
            expandedState.value[companyId] = true;
        }
    } catch (err) {
        console.error("❌ 드롭 데이터 파싱 오류:", err);
    }
};

// 초기화 시 모든 노드 펼침
onMounted(() => {
    expandAll();
});
</script>
