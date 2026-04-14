<script setup lang="ts">
const collapsed = ref(false)

// Persist sidebar state in localStorage
onMounted(() => {
  const saved = localStorage.getItem('admin_sidebar_collapsed')
  if (saved !== null) collapsed.value = saved === 'true'
})

watch(collapsed, (val) => {
  localStorage.setItem('admin_sidebar_collapsed', String(val))
})
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
    <!-- Sidebar -->
    <AdminSidebar v-model:collapsed="collapsed" />

    <!-- Main content area -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <AdminHeader />

      <!-- Page slot -->
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
