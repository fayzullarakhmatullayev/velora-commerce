<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const available = computed(() =>
  locales.value.map((l) => ({
    label: l.name,
    code: l.code,
    active: l.code === locale.value,
  })),
)

const current = computed(() => available.value.find((l) => l.active))

const items = computed(() =>
  available.value.map((l) => ({
    label: l.label,
    icon: l.active ? 'heroicons:check' : undefined,
    click: () => setLocale(l.code as 'en' | 'uz' | 'ru'),
  })),
)
</script>

<template>
  <UDropdownMenu :items="[items]">
    <UButton color="neutral" variant="ghost" size="sm" trailing-icon="heroicons:chevron-down">
      <span class="text-xs font-semibold uppercase tracking-wider">
        {{ current?.code }}
      </span>
    </UButton>
  </UDropdownMenu>
</template>
