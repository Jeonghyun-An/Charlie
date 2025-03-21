<template>
    <div>
        <div v-for="(value, key, idx) in data" :key="idx">
            <!-- 관리자 또는 대표이사인 경우에는 항상 펼쳐서 리스트만 출력 -->
            <template
                v-if="
                    Array.isArray(value) &&
                    (key === '대표이사' || key === '관리자')
                "
            >
                <ul class="ml-4 p-2 list-disc">
                    <li v-for="(member, index) in value" :key="index">
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

defineProps<{ data: Record<string, any> }>();

// "관리자"는 UI에 표시하지 않음
const formatHeader = (key: string) => {
    return key === "관리자" ? " " : key;
};
</script>
