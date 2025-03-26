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
                                path: [...currentPath, key],
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
                            <div
                                class="font-semibold cursor-move w-full"
                                draggable="true"
                                @dragstart="
                                    handleDragStart(key, {
                                        type: 'team',
                                        name: key,
                                        members: getExactTeamMembers(value),
                                        path: [...currentPath, key],
                                        children: buildNestedChildren(value, [
                                            ...currentPath,
                                            key,
                                        ]),
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
                                            path: [...currentPath, key],
                                        })
                                    "
                                >
                                    {{ member }}
                                </li>
                            </ul>
                        </template>

                        <template v-else>
                            <OrgAccordion
                                :data="value"
                                :currentPath="currentPath"
                            />
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

const props = defineProps<{
    data: Record<string, any>;
    currentPath?: string[];
}>();

const currentPath = props.currentPath || [];

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

const getExactTeamMembers = (node: any): string[] => {
    return flattenMembersIncludeAll(node);
};

const buildNestedChildren = (node: any, path: string[]): any[] => {
    const result: any[] = [];
    for (const [key, value] of Object.entries(node)) {
        if (Array.isArray(value)) {
            result.push({
                type: "team",
                name: key,
                members: value,
                path: [...path, key],
            });
        } else if (typeof value === "object") {
            result.push({
                type: "team",
                name: key,
                members: getExactTeamMembers(value),
                path: [...path, key],
                children: buildNestedChildren(value, [...path, key]),
            });
        }
    }
    return result;
};
</script>
