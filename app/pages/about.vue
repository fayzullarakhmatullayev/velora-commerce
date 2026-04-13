<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({ title: 'About — Velora Commerce' })
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-primary-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-primary-950 py-24">
      <div class="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary-400/10 blur-3xl" aria-hidden="true" />
      <div class="velora-container relative text-center">
        <VBadge class="mb-6">Our Story</VBadge>
        <h1 class="font-display text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl lg:text-6xl">
          Built for modern commerce
        </h1>
        <p class="mx-auto mt-6 max-w-2xl text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Velora Commerce was founded with a single belief — that beautiful shopping experiences
          shouldn't be reserved for the world's biggest brands.
        </p>
      </div>
    </section>

    <!-- Values -->
    <section class="velora-container py-20">
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-3">
        <VCard v-for="v in [
          { icon: 'heroicons:sparkles', title: 'Premium Quality', desc: 'Every product is handpicked and verified for the highest standards.' },
          { icon: 'heroicons:globe-alt', title: 'Global Reach', desc: 'Serving customers in 50+ countries with fast, reliable delivery.' },
          { icon: 'heroicons:shield-check', title: 'Trusted & Secure', desc: 'End-to-end encrypted payments and full buyer protection on every order.' },
        ]" :key="v.title" padding="lg">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-950 mb-4">
            <UIcon :name="v.icon" class="size-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 class="font-display font-semibold text-zinc-900 dark:text-white mb-2">{{ v.title }}</h3>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{{ v.desc }}</p>
        </VCard>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-zinc-50 dark:bg-zinc-900/50 py-20">
      <div class="velora-container text-center">
        <h2 class="font-display text-3xl font-bold text-zinc-900 dark:text-white mb-4">
          Ready to start shopping?
        </h2>
        <p class="text-zinc-500 dark:text-zinc-400 mb-8">Discover thousands of premium products curated just for you.</p>
        <UButton to="/shop" size="lg">
          {{ t('home.heroCta') }}
          <UIcon name="heroicons:arrow-right" class="size-4" />
        </UButton>
      </div>
    </section>
  </div>
</template>
