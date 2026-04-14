<script setup lang="ts">
const { t } = useI18n()
const colorMode = useColorMode()

const mounted = ref(false)
onMounted(() => { mounted.value = true })

const isDark = computed(() => colorMode.value === 'dark')

function toggle() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <UButton
    v-if="mounted"
    :icon="isDark ? 'heroicons:sun' : 'heroicons:moon'"
    color="neutral"
    variant="ghost"
    size="sm"
    :aria-label="isDark ? t('theme.switchToLight') : t('theme.switchToDark')"
    @click="toggle"
  />
  <UButton
    v-else
    icon="heroicons:moon"
    color="neutral"
    variant="ghost"
    size="sm"
    :aria-label="t('theme.switchToDark')"
    aria-hidden="true"
  />
</template>
