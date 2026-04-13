<script setup lang="ts">
useSeoMeta({ title: 'Contact — Velora Commerce' })

const form = reactive({ name: '', email: '', subject: '', message: '' })
const loading = ref(false)
const sent = ref(false)

async function submit() {
  loading.value = true
  // Placeholder — wire to email service in production
  await new Promise((r) => setTimeout(r, 1000))
  sent.value = true
  loading.value = false
}
</script>

<template>
  <div class="velora-container py-12 lg:py-20">
    <div class="mx-auto max-w-2xl">
      <div class="mb-10">
        <VBadge class="mb-3">Contact</VBadge>
        <h1 class="font-display text-4xl font-bold text-zinc-900 dark:text-white">
          Get in touch
        </h1>
        <p class="mt-3 text-zinc-500 dark:text-zinc-400">
          We typically respond within 24 hours on business days.
        </p>
      </div>

      <!-- Success state -->
      <VCard v-if="sent" padding="lg" class="text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 mx-auto mb-4">
          <UIcon name="heroicons:check" class="size-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 class="font-display font-semibold text-zinc-900 dark:text-white text-xl mb-2">Message sent!</h2>
        <p class="text-zinc-500 dark:text-zinc-400 mb-6">We'll get back to you within 24 hours.</p>
        <UButton color="neutral" variant="outline" @click="sent = false">Send another</UButton>
      </VCard>

      <!-- Contact form -->
      <VCard v-else padding="lg">
        <form class="space-y-5" @submit.prevent="submit">
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <UFormField label="Name" name="name" required>
              <UInput v-model="form.name" placeholder="Your name" class="w-full" />
            </UFormField>
            <UFormField label="Email" name="email" required>
              <UInput v-model="form.email" type="email" placeholder="you@example.com" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Subject" name="subject" required>
            <UInput v-model="form.subject" placeholder="How can we help?" class="w-full" />
          </UFormField>
          <UFormField label="Message" name="message" required>
            <UTextarea
              v-model="form.message"
              placeholder="Tell us more..."
              :rows="5"
              class="w-full"
            />
          </UFormField>
          <UButton type="submit" size="lg" block :loading="loading">
            Send message
            <UIcon name="heroicons:paper-airplane" class="size-4" />
          </UButton>
        </form>
      </VCard>

      <!-- Contact info -->
      <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 text-center">
        <div v-for="item in [
          { icon: 'heroicons:envelope', label: 'Email', value: 'hello@velora.store' },
          { icon: 'heroicons:phone', label: 'Phone', value: '+1 (555) 000-0000' },
          { icon: 'heroicons:map-pin', label: 'Location', value: 'Tashkent, Uzbekistan' },
        ]" :key="item.label" class="space-y-1">
          <div class="flex justify-center">
            <UIcon :name="item.icon" class="size-5 text-primary-600 dark:text-primary-400" />
          </div>
          <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{{ item.label }}</p>
          <p class="text-sm text-zinc-700 dark:text-zinc-300">{{ item.value }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
