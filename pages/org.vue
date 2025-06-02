<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-10">
        <div class="max-w-lg p-10">
            <h1 class="text-xl font-semibold mb-4">조직도</h1>
            <Accordion :multiple="true" class="border-none shadow-none">
                <AccordionTab header="내 프로필">
                    <OrgMine :data="myData" />
                </AccordionTab>
                <AccordionTab header="지뉴소프트(주)" :expanded="true">
                    <OrgAccordion :data="orgData" />
                </AccordionTab>
            </Accordion>
        </div>
        <!-- 드롭 대상 -->
        <div class="pt-8">
            <DropTarget />
        </div>
    </div>
</template>

<script setup lang="ts">
import orgMyData from "@/assets/data/myData.json";
import OrgMine from "@/components/OrgMine.vue";
import orgChartData from "@/assets/data/orgChart.json";
import OrgAccordion from "@/components/OrgAccordion.vue";
import DropTarget from "@/components/DropTarget.vue";

const myData = orgMyData;
const orgData = orgChartData;
</script>
