<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div class="max-w-2xl mx-auto p-4">
            <h1 class="text-xl font-semibold mb-4">조직도</h1>
            <Accordion :multiple="true" class="border-none shadow-none">
                <AccordionTab header="내 프로필">
                    <OrgMine :data="myData" />
                </AccordionTab>
                <AccordionTab header="지뉴소프트(주)" :expanded="true">
                    <!-- 회사 전체 드래그용 -->
                    <div
                        draggable="true"
                        @dragstart="handleCompanyDrag"
                        class="p-2 bg-zinc-100 rounded hover:bg-zinc-200 cursor-move mb-2"
                    >
                        <span class="text-sm text-zinc-700">👥 전체 인원</span>
                    </div>
                    <OrgAccordion :data="orgData" />
                </AccordionTab>
            </Accordion>
        </div>
        <!-- 드롭 대상 -->
        <div>
            <DropTarget />
        </div>
    </div>
</template>

<script setup lang="ts">
import OrgMine from "@/components/OrgMine.vue";
import orgChartData from "@/assets/data/orgChart.json";
import OrgAccordion from "@/components/OrgAccordion.vue";
import orgMyData from "@/assets/data/myData.json";
import DropTarget from "@/components/DropTarget.vue";

const myData = orgMyData;
const orgData = orgChartData;

const handleCompanyDrag = (event: DragEvent) => {
    if (!event.dataTransfer) return;

    const flattenAllMembers = (node: any): string[] => {
        if (Array.isArray(node)) return node;
        if (typeof node === "object") {
            return Object.values(node).flatMap(flattenAllMembers);
        }
        return [];
    };

    const payload = {
        type: "company",
        name: "지뉴소프트(주)",
        members: flattenAllMembers(orgData),
    };

    event.dataTransfer.setData("application/json", JSON.stringify(payload));
};
</script>
