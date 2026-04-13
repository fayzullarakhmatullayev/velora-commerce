<template>
  <div class="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
    <!-- Minimal auth header -->
    <header class="flex h-16 items-center px-6">
      <NuxtLink to="/" class="flex items-center gap-2 group">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-bold shadow-sm group-hover:bg-primary-700 transition-colors"
        >
          V
        </div>
        <span class="font-display font-semibold text-zinc-900 dark:text-white text-lg">
          Velora
        </span>
      </NuxtLink>
    </header>

    <!-- Centered content -->
    <main class="flex flex-1 items-center justify-center px-4 py-12">
      <slot />
    </main>

    <!-- Minimal footer -->
    <footer class="py-6 text-center text-sm text-zinc-400">
      &copy; {{ new Date().getFullYear() }} Velora Commerce
    </footer>
  </div>
</template>
