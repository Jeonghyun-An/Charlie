<!-- PDF 뷰어 모달 -->
<template>
    <div
        v-if="pdfViewer.isOpen"
        class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
        <div
            class="bg-white rounded-lg p-4 shadow-lg max-w-4xl w-full relative"
        >
            <button
                @click="$emit('close')"
                class="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
                ✖
            </button>
            <h2 class="font-semibold mb-2 text-center">
                {{ pdfViewer.title }}
            </h2>
            <div class="pdf-container overflow-y-auto max-h-[80vh] p-2">
                <canvas ref="pdfCanvas"></canvas>
            </div>
            <div
                class="flex justify-between items-center mt-3 ml-40 text-sm p-1"
            >
                <button
                    @click="$emit('prev')"
                    class="px-3 py-1 bg-zinc-200 hover:bg-zinc-300 rounded-lg"
                >
                    ◀ 이전
                </button>
                <span
                    >{{ pdfViewer.currentPage }} /
                    {{ pdfViewer.totalPages }}</span
                >
                <button
                    @click="$emit('next')"
                    class="px-3 py-1 bg-zinc-200 hover:bg-zinc-300 rounded-lg"
                >
                    다음 ▶
                </button>
                <button
                    @click="$emit('download')"
                    class="px-3 py-1 bg-zinc-500 text-white rounded-lg hover:bg-zinc-800"
                >
                    ⬇ 다운로드
                </button>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, watch } from "vue";
import * as pdfjsLib from "pdfjs-dist/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const props = defineProps({
    pdfViewer: Object,
});

const emits = defineEmits(["close", "prev", "next", "download"]);

const pdfCanvas = ref(null);
let pdfDoc = null;

watch(
    () => props.pdfViewer.url,
    async (newUrl) => {
        if (newUrl) {
            await loadPdf();
        }
    }
);

// ✅ 현재 페이지 변경 감지하여 다시 렌더링
watch(
    () => props.pdfViewer.currentPage,
    async (newPage) => {
        if (pdfDoc) {
            await renderPage(newPage);
        }
    }
);

async function loadPdf() {
    if (!props.pdfViewer.url) return;
    const loadingTask = pdfjsLib.getDocument(props.pdfViewer.url);
    pdfDoc = await loadingTask.promise;
    props.pdfViewer.totalPages = pdfDoc.numPages;
    renderPage(props.pdfViewer.currentPage);
}

async function renderPage(pageNumber) {
    if (!pdfDoc) return;
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.3 });

    const canvas = pdfCanvas.value;
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = { canvasContext: context, viewport };
    await page.render(renderContext).promise;
}
</script>
