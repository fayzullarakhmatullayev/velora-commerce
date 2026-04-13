<template>
  <!-- UApp provides color mode, toast, and tooltip context for the entire app -->
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Global cart drawer — rendered outside the layout so it overlays everything -->
    <CartDrawer />
  </UApp>
</template>
