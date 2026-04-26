<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
const AppHeader = defineAsyncComponent(() => import('@/components/AppHeader.vue'))
const ProfileTab = defineAsyncComponent(() => import('@/components/profile/ProfileTab.vue'))
</script>

<template>
  <div class="bg-gray-50 h-screen flex flex-col overflow-hidden">
    <AppHeader breadcrumb="Dashboard > Profile" />

    <main class="flex-1 max-w-7xl w-full mx-auto px-2 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6 lg:px-8 overflow-hidden">
      <div class="bg-white rounded-lg md:rounded-xl shadow-md h-full overflow-hidden p-3 sm:p-4 md:p-6">
        <ProfileTab />
      </div>
    </main>
  </div>
</template>
