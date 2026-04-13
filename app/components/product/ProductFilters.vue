<script setup lang="ts">
const props = defineProps<{
  modelValue: {
    categoryId: string | null
    sort: string
    minPrice: string
    maxPrice: string
  }
}>()

const emit = defineEmits<{
  'update:modelValue': [typeof props.modelValue]
}>()

const { t } = useI18n()
const { categories, getCategoryName } = useCategories()

// Always read from props — no local copy, no watchers, no ping-pong loops.
// Every interaction calls update() which emits the full new object to the parent.
function update(patch: Partial<typeof props.modelValue>) {
  emit('update:modelValue', { ...props.modelValue, ...patch })
}

function clearFilters() {
  emit('update:modelValue', { categoryId: null, sort: 'newest', minPrice: '', maxPrice: '' })
}

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low → High', value: 'price-asc' },
  { label: 'Price: High → Low', value: 'price-desc' },
  { label: 'Top Rated', value: 'rating' },
]

const hasActiveFilters = computed(
  () =>
    props.modelValue.categoryId ||
    props.modelValue.sort !== 'newest' ||
    props.modelValue.minPrice ||
    props.modelValue.maxPrice,
)
</script>

<template>
  <div class="space-y-6">
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
            All Categories
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
        Price Range ($)
      </label>
      <div class="flex gap-2">
        <UInput
          :value="modelValue.minPrice"
          type="number"
          placeholder="Min"
          size="sm"
          min="0"
          class="w-full"
          @update:model-value="update({ minPrice: String($event ?? '') })"
        />
        <UInput
          :value="modelValue.maxPrice"
          type="number"
          placeholder="Max"
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
      Clear filters
    </UButton>
  </div>
</template>
