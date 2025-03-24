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
                    <AccordionTab :header="formatHeader(key)">
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
                                        })
                                    "
                                >
                                    {{ member }}
                                </li>
                            </ul>
                        </template>
                        <template v-else>
                            <!-- 팀 전체를 드래그할 수 있게 key를 포함한 객체 전달 -->
                            <div
                                draggable="true"
                                @dragstart="
                                    handleDragStart(key, {
                                        type: 'team',
                                        name: key,
                                        members: flattenMembers(value),
                                    })
                                "
                            >
                                <OrgAccordion :data="value" />
                            </div>
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
import { defineProps } from "vue";

defineProps<{ data: Record<string, any> }>();

const formatHeader = (key: string) => {
    return key === "관리자" ? " " : key;
};

const handleDragStart = (label: string, payload: any) => {
    const transfer = (event as DragEvent).dataTransfer;
    if (transfer) {
        transfer.setData("application/json", JSON.stringify(payload));
    }
};

// 재귀적으로 하위 모든 멤버 추출
const flattenMembers = (node: any): string[] => {
    if (Array.isArray(node)) return node;
    if (typeof node === "object") {
        return Object.values(node).flatMap(flattenMembers);
    }
    return [];
};
</script>
