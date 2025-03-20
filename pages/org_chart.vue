<template>
    <div class="max-w-lg mx-auto p-4 bg-white shadow-md rounded-lg">
        <h2 class="text-xl font-semibold mb-4">조직도</h2>
        <Accordion :multiple="true">
            <!-- 내 프로필 -->
            <AccordionTab header="내 프로필">
                <ul class="p-2 space-y-1">
                    <li v-for="(member, index) in myProfile" :key="index">
                        - {{ member }}
                    </li>
                </ul>
            </AccordionTab>
            <!-- 회사 조직도 -->
            <AccordionTab header="지뉴소프트(주)">
                <ul class="p-2 space-y-1">
                    <li
                        v-for="(member, index) in company.대표이사"
                        :key="index"
                    >
                        - {{ member }}
                    </li>
                </ul>
                <Accordion :multiple="true">
                    <AccordionTab
                        header="경영지원실"
                        class="font-bold text-2xl"
                    >
                        <ul class="p-2 space-y-1">
                            <li
                                v-for="(member, index) in company.경영지원실"
                                :key="index"
                                class="font-bold text-2xl"
                            >
                                - {{ member }}
                            </li>
                        </ul>
                    </AccordionTab>

                    <AccordionTab header="경영기획실">
                        <ul class="p-2 space-y-1">
                            <li
                                v-for="(member, index) in company.경영기획실"
                                :key="index"
                            >
                                - {{ member }}
                            </li>
                        </ul>
                    </AccordionTab>

                    <!-- 연구소 -->
                    <AccordionTab header="연구소">
                        <ul class="p-2 space-y-1">
                            <li
                                v-for="(member, index) in company.연구소.관리자"
                                :key="index"
                            >
                                - {{ member }}
                            </li>
                        </ul>
                        <Accordion :multiple="true">
                            <AccordionTab header="연구기획실">
                                <ul class="p-2 space-y-1">
                                    <li
                                        v-for="(member, index) in company.연구소
                                            .연구기획실.관리자"
                                        :key="index"
                                    >
                                        - {{ member }}
                                    </li>
                                </ul>
                                <Accordion :multiple="true">
                                    <AccordionTab header="연구1팀">
                                        <ul class="p-2 space-y-1">
                                            <li
                                                v-for="(
                                                    member, index
                                                ) in company.연구소.연구기획실
                                                    .연구1팀"
                                                :key="index"
                                            >
                                                - {{ member }}
                                            </li>
                                        </ul>
                                    </AccordionTab>
                                    <AccordionTab header="연구2팀">
                                        <ul class="p-2 space-y-1">
                                            <li
                                                v-for="(
                                                    member, index
                                                ) in company.연구소.연구기획실
                                                    .연구2팀"
                                                :key="index"
                                            >
                                                - {{ member }}
                                            </li>
                                        </ul>
                                    </AccordionTab>
                                </Accordion>
                            </AccordionTab>
                        </Accordion>
                    </AccordionTab>

                    <!-- 사업부서 -->
                    <AccordionTab header="사업부서">
                        <ul class="p-2 space-y-1">
                            <li
                                v-for="(member, index) in company.사업부서
                                    .관리자"
                                :key="index"
                            >
                                - {{ member }}
                            </li>
                        </ul>
                        <Accordion :multiple="true">
                            <AccordionTab header="전략사업팀">
                                <ul class="p-2 space-y-1">
                                    <li
                                        v-for="(member, index) in company
                                            .사업부서.전략사업팀"
                                        :key="index"
                                    >
                                        - {{ member }}
                                    </li>
                                </ul>
                            </AccordionTab>

                            <AccordionTab header="개발실">
                                <ul class="p-2 space-y-1">
                                    <li
                                        v-for="(member, index) in company
                                            .사업부서.개발실.관리자"
                                        :key="index"
                                    >
                                        - {{ member }}
                                    </li>
                                </ul>
                                <Accordion :multiple="true">
                                    <AccordionTab header="서비스품질운영팀">
                                        <ul class="p-2 space-y-1">
                                            <li
                                                v-for="(
                                                    member, index
                                                ) in company.사업부서.개발실
                                                    .서비스품질운영팀"
                                                :key="index"
                                            >
                                                - {{ member }}
                                            </li>
                                        </ul>
                                    </AccordionTab>

                                    <AccordionTab header="개발1팀">
                                        <ul class="p-2 space-y-1">
                                            <li
                                                v-for="(
                                                    member, index
                                                ) in company.사업부서.개발실
                                                    .개발1팀"
                                                :key="index"
                                            >
                                                - {{ member }}
                                            </li>
                                        </ul>
                                    </AccordionTab>

                                    <AccordionTab header="개발2팀">
                                        <ul class="p-2 space-y-1">
                                            <li
                                                v-for="(
                                                    member, index
                                                ) in company.사업부서.개발실
                                                    .개발2팀"
                                                :key="index"
                                            >
                                                - {{ member }}
                                            </li>
                                        </ul>
                                    </AccordionTab>

                                    <AccordionTab header="개발전략팀">
                                        <ul class="p-2 space-y-1">
                                            <li
                                                v-for="(
                                                    member, index
                                                ) in company.사업부서.개발실
                                                    .개발전략팀"
                                                :key="index"
                                            >
                                                - {{ member }}
                                            </li>
                                        </ul>
                                    </AccordionTab>
                                </Accordion>
                            </AccordionTab>
                        </Accordion>
                    </AccordionTab>
                </Accordion>
            </AccordionTab>
        </Accordion>
    </div>
</template>

<script setup>
import { ref } from "vue";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";

const myProfile = ref(["안정현 매니저"]);
// 회사 조직도 데이터
const company = ref({
    대표이사: ["김동일 대표이사"],
    경영지원실: ["한은영 실장/이사", "두재린 매니저", "정보람 매니저"],
    경영기획실: ["최돈용 이사"],
    연구소: {
        관리자: ["임태훈 연구소장", "김대승 연구부소장"],
        연구기획실: {
            관리자: ["홍성극 실장", "이혜승 부장"],
            연구1팀: [
                "박현재 팀장",
                "장종욱 대리",
                "김경훈 매니저",
                "박정열 매니저",
                "정성훈 매니저",
                "정우영 매니저",
            ],
            연구2팀: ["안정현 매니저", "정민석 매니저", "정용희 매니저"],
        },
    },
    사업부서: {
        관리자: ["원훈희 본부장/상무"],
        전략사업팀: ["최현호 부장", "최수빈 대리"],
        개발실: {
            관리자: ["김명수 실장/이사", "김종화 팀장/부장", "최금수 부장"],
            서비스품질운영팀: ["강태경 팀장/부장", "김태영 차장"],
            개발1팀: [
                "남충열 차장",
                "안승현 매니저",
                "엄상용 매니저",
                "하제우 매니저",
                "한승호 매니저",
            ],
            개발2팀: [
                "옥순재 팀장/부장",
                "오상욱 매니저",
                "이준용 매니저",
                "허정 매니저",
            ],
            개발전략팀: ["배병건 팀장/부장"],
        },
    },
});
</script>

<style scoped>
/* 추가적인 스타일링 */
</style>
