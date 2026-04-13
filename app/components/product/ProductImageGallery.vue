<script setup lang="ts">
const props = defineProps<{
  images: string[]
  title: string
}>()

const activeIndex = ref(0)
const activeImage = computed(() => props.images[activeIndex.value] ?? '')

// Zoom on hover
const isZoomed = ref(false)
const zoomPos = ref({ x: 50, y: 50 })

function onMouseMove(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  zoomPos.value = {
    x: ((e.clientX - rect.left) / rect.width) * 100,
    y: ((e.clientY - rect.top) / rect.height) * 100,
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Main image -->
    <div
      class="relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 aspect-square cursor-zoom-in"
      @mouseenter="isZoomed = true"
      @mouseleave="isZoomed = false"
      @mousemove="onMouseMove"
    >
      <img
        v-if="activeImage"
        :src="activeImage"
        :alt="title"
        class="h-full w-full object-cover transition-transform duration-300"
        :style="
          isZoomed
            ? {
                transform: 'scale(1.6)',
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              }
            : {}
        "
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center"
      >
        <UIcon name="heroicons:photo" class="size-24 text-zinc-300 dark:text-zinc-600" />
      </div>

      <!-- Prev / Next arrows for mobile -->
      <template v-if="images.length > 1">
        <button
          class="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 dark:bg-zinc-900/80 shadow backdrop-blur-sm transition hover:bg-white dark:hover:bg-zinc-900"
          aria-label="Previous image"
          @click="activeIndex = (activeIndex - 1 + images.length) % images.length"
        >
          <UIcon name="heroicons:chevron-left" class="size-4" />
        </button>
        <button
          class="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 dark:bg-zinc-900/80 shadow backdrop-blur-sm transition hover:bg-white dark:hover:bg-zinc-900"
          aria-label="Next image"
          @click="activeIndex = (activeIndex + 1) % images.length"
        >
          <UIcon name="heroicons:chevron-right" class="size-4" />
        </button>
      </template>
    </div>

    <!-- Thumbnails -->
    <div v-if="images.length > 1" class="flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="(img, i) in images"
        :key="i"
        class="shrink-0 h-16 w-16 overflow-hidden rounded-lg border-2 transition"
        :class="
          i === activeIndex
            ? 'border-primary-500 opacity-100'
            : 'border-transparent opacity-60 hover:opacity-100'
        "
        :aria-label="`View image ${i + 1}`"
        @click="activeIndex = i"
      >
        <img :src="img" :alt="`${title} ${i + 1}`" class="h-full w-full object-cover" />
      </button>
    </div>
  </div>
</template>
