<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
const AppHeader = defineAsyncComponent(() => import('@/components/AppHeader.vue'))
const ProfileTab = defineAsyncComponent(() => import('@/components/profile/ProfileTab.vue'))
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <AppHeader breadcrumb="Dashboard > Profile" />

    <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div class="bg-white rounded-xl shadow-md overflow-hidden p-6">
        <ProfileTab />
      </div>
    </main>
  </div>
</template>
