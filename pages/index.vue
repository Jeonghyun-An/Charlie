<template>
  <div class="card">
    <DataTable :value="products" tableStyle="min-width: 50rem">
      <Column field="code" header="Code"></Column>
      <Column field="name" header="Name"></Column>
      <Column field="category" header="Category"></Column>
      <Column field="quantity" header="Quantity"></Column>
    </DataTable>
  </div>
  <InputText placeholder="Overriden" class="p-8 bg-red-400" />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const products = ref([
  { code: 1004, name: "정민석", category: "ace", quantity: 200 },
  { code: 1004, name: "정민석", category: "ace", quantity: 200 },
  { code: 1004, name: "정민석", category: "ace", quantity: 200 },
  { code: 1004, name: "정민석", category: "ace", quantity: 200 },
  { code: 1004, name: "정민석", category: "ace", quantity: 200 },
]);
</script>
