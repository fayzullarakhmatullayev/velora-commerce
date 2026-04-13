<script setup lang="ts">
useSeoMeta({ title: 'Terms of Service — Velora Commerce' })
</script>

<template>
  <div class="velora-container py-12 lg:py-20">
    <div class="mx-auto max-w-3xl">
      <h1 class="font-display text-4xl font-bold text-zinc-900 dark:text-white mb-2">Terms of Service</h1>
      <p class="text-zinc-400 text-sm mb-10">Last updated: {{ new Date().getFullYear() }}</p>

      <VCard padding="lg" class="space-y-6">
        <div v-for="section in [
          {
            title: '1. Acceptance of Terms',
            text: 'By accessing and using Velora Commerce, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.',
          },
          {
            title: '2. Use of Service',
            text: 'You agree to use our services only for lawful purposes and in accordance with these terms. You must not use our services in any way that could damage or impair our platform.',
          },
          {
            title: '3. Account Responsibility',
            text: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
          },
          {
            title: '4. Orders and Payments',
            text: 'All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order. Payment must be received before goods are dispatched.',
          },
          {
            title: '5. Returns & Refunds',
            text: 'We offer a 30-day return policy for unused items in original condition. Refunds are processed within 5-10 business days of receiving the returned item.',
          },
          {
            title: '6. Limitation of Liability',
            text: 'Velora Commerce shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services.',
          },
        ]" :key="section.title" class="space-y-2">
          <h3 class="font-display font-semibold text-zinc-900 dark:text-white">{{ section.title }}</h3>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{{ section.text }}</p>
        </div>
      </VCard>
    </div>
  </div>
</template>
