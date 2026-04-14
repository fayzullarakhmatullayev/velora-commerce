<script setup lang="ts">
import type { Database } from '~/types/database.types'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Addresses — Velora Commerce' })

type Address = Database['public']['Tables']['addresses']['Row']
type AddressInsert = Database['public']['Tables']['addresses']['Insert']

const { t } = useI18n()
const supabase = useSupabase()
const toast = useToast()

// ── Fetch addresses ───────────────────────────────────────────────────────────
const { data: addresses, refresh } = useAsyncData('account-addresses', async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) return [] as Address[]

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', session.user.id)
    .order('is_default', { ascending: false })

  if (error) throw error
  return data as Address[]
}, { default: () => [] as Address[], getCachedData: () => undefined })

// ── Modal state ───────────────────────────────────────────────────────────────
const modalOpen = ref(false)
const editing = ref<Address | null>(null)
const saving = ref(false)
const deleting = ref<string | null>(null)

const emptyForm = (): Omit<AddressInsert, 'user_id'> => ({
  label: 'Home',
  full_name: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  country: '',
  postal_code: '',
  is_default: false,
})

const form = reactive(emptyForm())

function openAdd() {
  editing.value = null
  Object.assign(form, emptyForm())
  modalOpen.value = true
}

function openEdit(addr: Address) {
  editing.value = addr
  Object.assign(form, {
    label: addr.label,
    full_name: addr.full_name,
    phone: addr.phone,
    street: addr.street,
    city: addr.city,
    state: addr.state ?? '',
    country: addr.country,
    postal_code: addr.postal_code,
    is_default: addr.is_default,
  })
  modalOpen.value = true
}

async function save() {
  if (!form.full_name || !form.street || !form.city || !form.country || !form.postal_code) {
    toast.add({ title: 'Please fill all required fields', color: 'error' })
    return
  }

  saving.value = true
  try {
    if (editing.value) {
      const { error } = await supabase
        .from('addresses')
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq('id', editing.value.id)
      if (error) throw error
    } else {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('addresses')
        .insert({ ...form, user_id: session.user.id })
      if (error) throw error
    }

    toast.add({ title: editing.value ? 'Address updated' : 'Address added', color: 'success', icon: 'heroicons:check-circle' })
    modalOpen.value = false
    await refresh()
  } catch (e: unknown) {
    toast.add({ title: e instanceof Error ? e.message : 'Failed to save', color: 'error' })
  } finally {
    saving.value = false
  }
}

async function setDefault(id: string) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) return
  // Unset all, then set selected
  await supabase.from('addresses').update({ is_default: false }).eq('user_id', session.user.id)
  await supabase.from('addresses').update({ is_default: true }).eq('id', id)
  await refresh()
}

async function remove(id: string) {
  deleting.value = id
  try {
    const { error } = await supabase.from('addresses').delete().eq('id', id)
    if (error) throw error
    await refresh()
  } catch (e: unknown) {
    toast.add({ title: 'Failed to delete', color: 'error' })
  } finally {
    deleting.value = null
  }
}
</script>

<template>
  <div class="velora-container py-10">
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <UButton to="/account" color="neutral" variant="ghost" icon="heroicons:arrow-left" size="sm" />
        <h1 class="font-display text-2xl font-bold text-zinc-900 dark:text-white">{{ t('account.addressesTitle') }}</h1>
      </div>
      <UButton icon="heroicons:plus" size="sm" @click="openAdd">{{ t('account.addAddress') }}</UButton>
    </div>

    <!-- Empty -->
    <div
      v-if="addresses.length === 0"
      class="flex flex-col items-center justify-center py-24 text-center"
    >
      <UIcon name="heroicons:map-pin" class="size-16 text-zinc-200 dark:text-zinc-700 mb-4" />
      <p class="font-medium text-zinc-700 dark:text-zinc-300">{{ t('account.noAddresses') }}</p>
      <p class="mt-1 text-sm text-zinc-400">{{ t('account.noAddressesDesc') }}</p>
      <UButton class="mt-6" @click="openAdd">{{ t('account.addAddress') }}</UButton>
    </div>

    <!-- Address cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <VCard
        v-for="addr in addresses"
        :key="addr.id"
        padding="md"
        class="relative"
      >
        <div class="flex items-start justify-between gap-2 mb-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {{ addr.label }}
            </span>
            <UBadge v-if="addr.is_default" color="primary" variant="subtle" size="sm">{{ t('common.default') }}</UBadge>
          </div>
          <div class="flex items-center gap-1">
            <UButton icon="heroicons:pencil" size="xs" color="neutral" variant="ghost" @click="openEdit(addr)" />
            <UButton
              icon="heroicons:trash"
              size="xs"
              color="error"
              variant="ghost"
              :loading="deleting === addr.id"
              @click="remove(addr.id)"
            />
          </div>
        </div>

        <address class="not-italic text-sm text-zinc-600 dark:text-zinc-300 space-y-0.5">
          <p class="font-medium text-zinc-900 dark:text-white">{{ addr.full_name }}</p>
          <p>{{ addr.street }}</p>
          <p>{{ addr.city }}<span v-if="addr.state">, {{ addr.state }}</span> {{ addr.postal_code }}</p>
          <p>{{ addr.country }}</p>
          <p class="text-zinc-400">{{ addr.phone }}</p>
        </address>

        <UButton
          v-if="!addr.is_default"
          size="xs"
          color="neutral"
          variant="outline"
          class="mt-3"
          @click="setDefault(addr.id)"
        >
          {{ t('account.setDefault') }}
        </UButton>
      </VCard>
    </div>

    <!-- Add / Edit modal -->
    <UModal v-model:open="modalOpen" :title="editing ? t('account.editAddress') : t('account.addAddress')">
      <template #body>
        <form class="space-y-4" @submit.prevent="save">
          <UFormField :label="t('account.addressLabel')" name="label">
            <UInput v-model="form.label" :placeholder="t('account.addressLabelPlaceholder')" class="w-full" />
          </UFormField>

          <div class="grid grid-cols-2 gap-3">
            <UFormField :label="`${t('checkout.fullName')} *`" name="full_name" class="col-span-2">
              <UInput v-model="form.full_name" placeholder="Jane Smith" class="w-full" />
            </UFormField>

            <UFormField :label="`${t('checkout.phone')} *`" name="phone" class="col-span-2">
              <UInput v-model="form.phone" type="tel" placeholder="+1 555 000 0000" class="w-full" />
            </UFormField>

            <UFormField :label="`${t('checkout.street')} *`" name="street" class="col-span-2">
              <UInput v-model="form.street" placeholder="123 Main St" class="w-full" />
            </UFormField>

            <UFormField :label="`${t('checkout.city')} *`" name="city">
              <UInput v-model="form.city" placeholder="New York" class="w-full" />
            </UFormField>

            <UFormField :label="t('checkout.state')" name="state">
              <UInput v-model="form.state" placeholder="NY" class="w-full" />
            </UFormField>

            <UFormField :label="`${t('checkout.postalCode')} *`" name="postal_code">
              <UInput v-model="form.postal_code" placeholder="10001" class="w-full" />
            </UFormField>

            <UFormField :label="`${t('checkout.country')} *`" name="country">
              <UInput v-model="form.country" placeholder="US" class="w-full" />
            </UFormField>
          </div>

          <UCheckbox v-model="form.is_default" :label="t('account.setAsDefault')" />

          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="ghost" @click="modalOpen = false">{{ t('common.cancel') }}</UButton>
            <UButton type="submit" :loading="saving">{{ editing ? t('common.saveChanges') : t('account.addAddress') }}</UButton>
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>
