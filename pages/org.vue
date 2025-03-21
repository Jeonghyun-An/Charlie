<template>
    <div class="max-w-2xl mx-auto p-4">
        <h1 class="text-xl font-semibold mb-4">조직도</h1>
        <Accordion :multiple="true" class="border-none shadow-none">
            <AccordionTab header="내 프로필">
                <ul class="ml-4 p-2 list-disc">
                    <li v-for="(member, index) in myProfile" :key="index">
                        {{ member }}
                    </li>
                </ul>
            </AccordionTab>
            <AccordionTab header="지뉴소프트(주)" :expanded="true">
                <OrgAccordion :data="orgData" />
            </AccordionTab>
        </Accordion>
    </div>
</template>

<script setup lang="ts">
import OrgAccordion from "@/components/OrgAccordion.vue";
import orgChartData from "@/assets/data/orgChart.json";

const myProfile = ref(["안정현 매니저"]);

const orgData = orgChartData;
</script>
