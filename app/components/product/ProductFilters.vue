<script setup lang="ts">
const props = defineProps<{
  modelValue: {
    categoryId: string | null
    sort: string
    minPrice: string
    maxPrice: string
    onSale: boolean
  }
}>()

const emit = defineEmits<{
  'update:modelValue': [typeof props.modelValue]
}>()

const { t } = useI18n()
const { categories, getCategoryName } = useCategories()

function update(patch: Partial<typeof props.modelValue>) {
  emit('update:modelValue', { ...props.modelValue, ...patch })
}

function clearFilters() {
  emit('update:modelValue', { categoryId: null, sort: 'newest', minPrice: '', maxPrice: '', onSale: false })
}

const sortOptions = computed(() => [
  { label: t('product.sortNewest'), value: 'newest' },
  { label: t('product.sortPriceAsc'), value: 'price-asc' },
  { label: t('product.sortPriceDesc'), value: 'price-desc' },
  { label: t('product.sortRating'), value: 'rating' },
])

const hasActiveFilters = computed(
  () =>
    props.modelValue.categoryId ||
    props.modelValue.sort !== 'newest' ||
    props.modelValue.minPrice ||
    props.modelValue.maxPrice ||
    props.modelValue.onSale,
)
</script>

<template>
  <div class="space-y-6">
    <!-- On Sale toggle -->
    <button
      class="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-all"
      :class="modelValue.onSale
        ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'"
      @click="update({ onSale: !modelValue.onSale })"
    >
      <span class="flex items-center gap-2">
        <span class="text-base">🏷️</span>
        {{ t('product.onSaleOnly') }}
      </span>
      <div
        class="h-5 w-9 rounded-full transition-colors relative"
        :class="modelValue.onSale ? 'bg-rose-500' : 'bg-zinc-200 dark:bg-zinc-700'"
      >
        <div
          class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
          :class="modelValue.onSale ? 'translate-x-4' : 'translate-x-0.5'"
        />
      </div>
    </button>

    <USeparator />

    <!-- Sort -->
    <div class="space-y-2">
      <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {{ t('common.sort') }}
      </label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="opt in sortOptions"
          :key="opt.value"
          class="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
          :class="
            modelValue.sort === opt.value
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
              : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300'
          "
          @click="update({ sort: opt.value })"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <USeparator />

    <!-- Categories -->
    <div class="space-y-2">
      <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {{ t('product.category') }}
      </label>
      <ul class="space-y-1">
        <li>
          <button
            class="w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors"
            :class="
              !modelValue.categoryId
                ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-medium'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            "
            @click="update({ categoryId: null })"
          >
            {{ t('product.allCategories') }}
          </button>
        </li>
        <li v-for="cat in (categories ?? [])" :key="cat.id">
          <button
            class="w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors"
            :class="
              modelValue.categoryId === cat.id
                ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-medium'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            "
            @click="update({ categoryId: cat.id })"
          >
            {{ getCategoryName(cat) }}
          </button>
        </li>
      </ul>
    </div>

    <USeparator />

    <!-- Price range -->
    <div class="space-y-2">
      <label class="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {{ t('product.priceRange') }}
      </label>
      <div class="flex gap-2">
        <UInput
          :value="modelValue.minPrice"
          type="number"
          :placeholder="t('product.minPrice')"
          size="sm"
          min="0"
          class="w-full"
          @update:model-value="update({ minPrice: String($event ?? '') })"
        />
        <UInput
          :value="modelValue.maxPrice"
          type="number"
          :placeholder="t('product.maxPrice')"
          size="sm"
          min="0"
          class="w-full"
          @update:model-value="update({ maxPrice: String($event ?? '') })"
        />
      </div>
    </div>

    <!-- Clear filters -->
    <UButton
      v-if="hasActiveFilters"
      color="neutral"
      variant="ghost"
      block
      @click="clearFilters"
    >
      {{ t('product.clearFilters') }}
    </UButton>
  </div>
</template>
