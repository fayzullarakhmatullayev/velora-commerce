<script setup lang="ts">
useSeoMeta({ title: 'Privacy Policy — Velora Commerce' })
</script>

<template>
  <div class="velora-container py-12 lg:py-20">
    <div class="mx-auto max-w-3xl prose prose-zinc dark:prose-invert">
      <h1 class="font-display text-4xl font-bold text-zinc-900 dark:text-white mb-2">Privacy Policy</h1>
      <p class="text-zinc-400 text-sm mb-10">Last updated: {{ new Date().getFullYear() }}</p>

      <VCard padding="lg" class="space-y-6 not-prose">
        <div v-for="section in [
          {
            title: '1. Information We Collect',
            text: 'We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This includes your name, email address, payment information, and shipping address.',
          },
          {
            title: '2. How We Use Your Information',
            text: 'We use the information we collect to process transactions, send order confirmations, respond to comments and questions, and send marketing communications (with your consent).',
          },
          {
            title: '3. Information Sharing',
            text: 'We do not sell, trade, or otherwise transfer your personal information to outside parties. This does not include trusted third parties who assist us in operating our website and conducting our business, subject to confidentiality agreements.',
          },
          {
            title: '4. Data Security',
            text: 'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
          },
          {
            title: '5. Your Rights',
            text: 'You have the right to access, update, or delete your personal information at any time through your account settings or by contacting us directly.',
          },
          {
            title: '6. Contact Us',
            text: 'If you have questions about this Privacy Policy, please contact us at privacy@velora.store.',
          },
        ]" :key="section.title" class="space-y-2">
          <h3 class="font-display font-semibold text-zinc-900 dark:text-white">{{ section.title }}</h3>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{{ section.text }}</p>
        </div>
      </VCard>
    </div>
  </div>
</template>
