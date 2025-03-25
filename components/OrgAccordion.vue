<template>
    <div>
        <div v-for="(value, key, idx) in data" :key="idx">
            <template
                v-if="
                    Array.isArray(value) &&
                    (key === '대표이사' || key === '관리자')
                "
            >
                <ul class="ml-4 p-2 list-disc">
                    <li
                        v-for="(member, index) in value"
                        :key="index"
                        draggable="true"
                        @dragstart="
                            handleDragStart(member, {
                                type: 'member',
                                name: member,
                                path: [key],
                            })
                        "
                    >
                        {{ member }}
                    </li>
                </ul>
            </template>

            <template v-else>
                <Accordion
                    :multiple="true"
                    class="border-none shadow-none bg-zinc-100"
                >
                    <AccordionTab>
                        <template #header>
                            <!-- 팀 드래그 전용 영역 -->
                            <div
                                class="font-semibold cursor-move w-full"
                                draggable="true"
                                @dragstart="
                                    handleDragStart(key, {
                                        type: 'team',
                                        name: key,
                                        members: getExactTeamMembers(data, key),
                                    })
                                "
                            >
                                {{ formatHeader(key) }}
                            </div>
                        </template>

                        <template v-if="Array.isArray(value)">
                            <ul class="ml-4 p-2 list-disc">
                                <li
                                    v-for="(member, index) in value"
                                    :key="index"
                                    draggable="true"
                                    @dragstart="
                                        handleDragStart(member, {
                                            type: 'member',
                                            name: member,
                                            path: [key],
                                        })
                                    "
                                >
                                    {{ member }}
                                </li>
                            </ul>
                        </template>

                        <template v-else>
                            <OrgAccordion :data="value" />
                        </template>
                    </AccordionTab>
                </Accordion>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import OrgAccordion from "@/components/OrgAccordion.vue";

const props = defineProps<{ data: Record<string, any> }>();

const formatHeader = (key: string) => {
    return key === "관리자" ? " " : key;
};

const handleDragStart = (label: string, payload: any) => {
    const transfer = (event as DragEvent).dataTransfer;
    if (transfer) {
        transfer.setData("application/json", JSON.stringify(payload));
    }
};

const flattenMembersIncludeAll = (node: any): string[] => {
    if (Array.isArray(node)) return node;
    if (typeof node === "object") {
        return Object.values(node).flatMap(flattenMembersIncludeAll);
    }
    return [];
};

const getExactTeamMembers = (node: any, targetKey: string): string[] => {
    if (!node || typeof node !== "object") return [];

    for (const [key, value] of Object.entries(node)) {
        if (key === targetKey) {
            return flattenMembersIncludeAll(value);
        } else if (typeof value === "object") {
            const result = getExactTeamMembers(value, targetKey);
            if (result.length > 0) return result;
        }
    }
    return [];
};
</script>
