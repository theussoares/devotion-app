<template>
  <div class="min-h-screen pb-20">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800 px-4 py-3">
      <h1 class="text-xl font-bold text-white mb-3">Buscar</h1>
      <SearchBar v-model="query" @clear="clearSearch" />
    </div>

    <!-- Results -->
    <div class="px-4 py-4">
      <SearchResults 
        :results="results"
        :loading="loading"
        :query="query"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { query, results, loading, clearSearch } = useSearch()
</script>
